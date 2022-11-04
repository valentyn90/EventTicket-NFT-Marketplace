import { supabase } from "@/supabase/supabase-admin";
import { buffer } from "micro";
import Stripe from "stripe";
import * as web3 from "@solana/web3.js";
import base58 from "bs58";
import randCrypto from "crypto";
import crypto from "crypto-js";
import { cancel, cancelOrder, transferViaCreditCard } from "@/mint/marketplace";
import generateKeypair, { getKeypair } from "@/mint/mint";
import { sendARPurchaseMail, sendAuctionLoserMail, sendAuctionMail, sendDropAuctionMail, sendDropPurchaseMail, sendFanChallengeEmail, sendGenericDropPurchaseMail, sendPurchaseMail, sendSaleMail, sendTicketMail } from "../outreach/send-mail";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2020-08-27",
});
const webhookSecret = process.env.STRIPE_SECRET_WEBHOOK!;
const encryptionKey = process.env.PRIVATE_KEY_ENCRYPTION_KEY!;
const AUCTION_HOUSE = process.env.NEXT_PUBLIC_AUCTION_HOUSE;
const verifiedSolSvcKey = process.env.VERIFIED_INK_SOL_SERVICE_KEY!;

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: any, res: any) => {
  if (req.method === "POST") {
    const buf = await buffer(req);
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err: any) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    switch (event.type) {
      case "charge.succeeded":
        const charge = event.data.object;
        // Then define and call a function to handle the event payment_intent.succeeded
        // console.log(`💰 Payment received! ${JSON.stringify(charge)}`);
        break;
      // ... handle other event types
      case "checkout.session.completed":
        /**
         * Checkout successful
         * - update credit_card_sale table
         *    - check for payment intent id which was created for the current session
         * - Create key for user and transfer nft to new owner
         * - record new owner in nft_owner table
         * - cancel the listing on chain and update the listing table
         * - record the sale in completed sale table
         */
        try {
          const eventObject = event.data.object as any;

          // console.log("Checkout session completed");

          // payment successful, update credit_card_sale to payment_completed
          // const { data, error } = await supabase
          //   .from("credit_card_sale")
          //   .update({
          //     status: "2_payment_completed",
          //   })
          //   .match({ stripe_tx: eventObject.id })
          //   .single();

          // console.log(data)
          if (eventObject.metadata.fc_id && eventObject.payment_status === "paid") {
            const { data, error } = await supabase
              .from("fan_challenge_orders")
              .update({
                status: "2_payment_completed",
              })
              .match({ stripe_tx: eventObject.id })
              .single();

            const requestOptions = {
              method: "POST",
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: eventObject.customer_email })
            }

            const assign_nfts = await fetch(`https://verifiedink.us/api/marketplace/randomAssignmentChallenge`, requestOptions);

            await sendFanChallengeEmail(
              eventObject.metadata.email,
              eventObject.metadata.order_id
            )


          }
          else if (eventObject.metadata.naas_auction && eventObject.payment_status === "paid") {
            // Mark bid as "confirmed"
            const { data, error } = await supabase
              .from("auction_bids")
              .update({
                status: "confirmed",
                stripe_tx: eventObject.id
              })
              .match({
                user_id: eventObject.metadata.user_id,
                auction_id: eventObject.metadata.auction_id,
                // bid_amount: eventObject.metadata.bid_amount,
                bid_id: eventObject.metadata.bid_id,
              })

            await sendDropAuctionMail(eventObject.metadata.user_id,
              eventObject.metadata.auction_id,
              eventObject.metadata.bid_amount,
              eventObject.metadata.bid_team_id)

          }
          else if (eventObject.metadata.ar_card && eventObject.payment_status === "paid") {

            const orderTotal = eventObject.amount_total / 100;

            let orderQuantity = eventObject.metadata.ar_quantity;
            if (orderTotal > 30) {
              orderQuantity = 5;
            }

            const { data, error } = await supabase
              .from("ar_credit_card_sale")
              .update({
                status: "2_payment_completed",
                quantity: orderQuantity,
                total_cost: orderTotal,
              })
              .match({ stripe_tx: eventObject.id })
              .single();
            

            await sendARPurchaseMail(eventObject.metadata.user_id,
              orderQuantity,
              orderTotal,
              eventObject.metadata.nft_id,
              eventObject.customer_email)

          }
          else if (eventObject.metadata.drop_id && eventObject.metadata.drop_id == 1 && eventObject.payment_status === "paid") {
            const { data, error } = await supabase
              .from("drop_credit_card_sale")
              .update({
                status: "2_payment_completed",
              })
              .match({ stripe_tx: eventObject.id })
              .single();

            const { data: configData, error: configError } = await supabase
              .from("configurations")
              .select("*")
              .match({ key: "naas_drop" })
              .maybeSingle()

            if (configData) {
              let items_left = Math.max(configData.value.items_left - data.quantity, 0)
              let next_price = configData.value.next_price
              let current_price = configData.value.current_price

              // if (items_left == 0) {
              //   items_left = 97
              //   current_price = next_price
              //   next_price = current_price + 15
              // }

              const new_values = {
                next_price: next_price,
                items_left: items_left,
                current_price: current_price,
                max_purchase_quantity: configData.value.max_purchase_quantity,
                sale_open: configData.value.sale_open,
                presale_open: configData.value.presale_open,
              }

              await supabase
                .from("configurations")
                .update({
                  value: new_values,
                })
                .match({ key: "naas_drop" })
                .single();
            }
            // Send success email to user 
            await sendDropPurchaseMail(
              data.user_id,
              data.quantity,
              data.price_usd,
              data.drop_id,
            )

            // Call out to stripeTransfer to transfer the nft to the new owner
            const requestOptions = {
              method: "POST",
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: eventObject.customer_email })
            }

            const attempt_transfer = await fetch(`https://verifiedink.us/api/marketplace/randomAssignment`, requestOptions);

            console.log(attempt_transfer)

          }
          else if (eventObject.metadata.drop_id && eventObject.payment_status === "paid") {
            const { data, error } = await supabase
              .from("drop_credit_card_sale")
              .update({
                status: "2_payment_completed",
              })
              .match({ stripe_tx: eventObject.id })
              .single();

            const { data: configData, error: configError } = await supabase
              .from("drop")
              .select("*")
              .match({ id: eventObject.metadata.drop_id })
              .maybeSingle()

            if (configData) {
              let new_values = {}
              if (eventObject.metadata.nft_type === "standard") {
                new_values = {
                  standard: Math.max(configData.quantity_left.standard - data.quantity, 0),
                  premium: configData.quantity_left.premium
                }
              }
              else {
                new_values = {
                  premium: Math.max(configData.quantity_left.premium - data.quantity, 0),
                  standard: configData.quantity_left.standard
                }
              }

              await supabase
                .from("drop")
                .update({
                  quantity_left: new_values,
                })
                .match({ id: eventObject.metadata.drop_id })
                .single();
            }
            // Send success email to user 
            await sendGenericDropPurchaseMail(
              data.user_id,
              data.quantity,
              data.price_usd,
              data.drop_id,
              eventObject.metadata.nft_type
            )

            // Call out to stripeTransfer to transfer the nft to the new owner
            const requestOptions = {
              method: "POST",
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: eventObject.customer_email, drop_id: eventObject.metadata.drop_id })
            }

            const attempt_transfer = await fetch(`https://verifiedink.us/api/marketplace/randomAssignmentDrop`, requestOptions);

            console.log(attempt_transfer)

          }
          else if (eventObject.metadata.event_id) {
            // Event Ticket Sale

            const { data, error } = await supabase
              .from("event_credit_card_sale")
              .update({
                status: "2_payment_completed",
              })
              .match({ stripe_tx: eventObject.id })
              .single();

            // Assign ticket to user
            const { data: ticketData, error: ticketError } = await supabase
              .from("event_order_ticket")
              .select("*")
              .eq("order_id", data.id)

            if (ticketData) {
              const { data: assignedTickets, error: assignedTicketsError } = await supabase
                .from("event_ticket_owner")
                .update({
                  owner_id: data.user_id,
                  on_hold: null
                })
                .in("ticket_id", ticketData.map((ticket) => ticket.ticket_id))
                .is("owner_id", null)
            }

            // Send success email to user
            await sendTicketMail(
              data.id
            )


          }
          else if (eventObject.payment_status === "paid") {

            const { data, error } = await supabase
              .from("credit_card_sale")
              .update({
                status: "2_payment_completed",
              })
              .match({ stripe_tx: eventObject.id })
              .single();


            // Send success email to seller and buyer
            await sendPurchaseMail(
              eventObject.customer_email,
              eventObject.metadata.nft_id,
              eventObject.metadata.sn,
              eventObject.metadata.card_preview_image)

            const price = eventObject.amount_total / 100;
            const price_str = price.toFixed(0);


            await sendSaleMail(
              eventObject.metadata.seller_id,
              eventObject.metadata.nft_id,
              eventObject.metadata.sn,
              eventObject.metadata.card_preview_image,
              price_str
            )

            // Call out to stripeTransfer to transfer the nft to the new owner
            const requestOptions = {
              method: "POST",
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: data.user_id })
            }

            const attempt_transfer = await fetch(`https://verifiedink.us/api/marketplace/stripeTransfer`, requestOptions);

          }
          else if (eventObject.mode === "setup") {
            // Handles Auction Setup

            console.log("Checkout session setup");
            // Mark bid as "confirmed"
            const { data, error } = await supabase
              .from("auction_bids")
              .update({
                status: "confirmed",
              })
              .match({
                user_id: eventObject.metadata.user_id,
                auction_id: eventObject.metadata.auction_id,
                bid_amount: eventObject.metadata.bid_amount,
                bid_id: eventObject.metadata.bid_id,
              })

            // Send Success email

            await sendAuctionMail(eventObject.metadata.user_id,
              eventObject.metadata.auction_id,
              eventObject.metadata.bid_amount,
              eventObject.metadata.bid_team_id)

            if (eventObject.metadata.loser_id) {
              await sendAuctionLoserMail(eventObject.metadata.loser_id,
                eventObject.metadata.auction_id,
              )
            }
          }
          else { // payment_status != "paid"
            const { data, error } = await supabase
              .from("credit_card_sale")
              .update({
                status: "2b_payment_rejected",
              })
              .match({ stripe_tx: eventObject.id });
          }
        } catch (err) {
          console.log(err);
        }

        break;
      case "payment_intent.succeeded": {
        console.log("Payment intent successful");
        // console.log(event);

        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};

export default handler;

// Checkout session completed
// {
//   object: {
//     id: 'cs_test_a1xBhj5w8HLlRvMHzWwJPgORao0a7ree2LMEBfDhUKwC6Q7SI4MeopZoYC',
//     object: 'checkout.session',
//     after_expiration: null,
//     allow_promotion_codes: null,
//     amount_subtotal: 1656,
//     amount_total: 1656,
//     automatic_tax: { enabled: false, status: null },
//     billing_address_collection: null,
//     cancel_url: 'http://localhost:3000/card/104?serial_no=10&canceled=true',
//     client_reference_id: null,
//     consent: null,
//     consent_collection: null,
//     currency: 'usd',
//     customer: 'cus_LH8FMvQK1CnHgi',
//     customer_creation: 'always',
//     customer_details: {
//       email: '1233@123.123',
//       phone: null,
//       tax_exempt: 'none',
//       tax_ids: []
//     },
//     customer_email: '1233@123.123',
//     expires_at: 1646720602,
//     livemode: false,
//     locale: null,
//     metadata: {},
//     mode: 'payment',
//     payment_intent: 'pi_3KaZyYAhoO3h51zP1yLVZCP0',
//     payment_link: null,
//     payment_method_options: {},
//     payment_method_types: [ 'card' ],
//     payment_status: 'paid',
//     phone_number_collection: { enabled: false },
//     recovered_from: null,
//     setup_intent: null,
//     shipping: null,
//     shipping_address_collection: null,
//     shipping_options: [],
//     shipping_rate: null,
//     status: 'complete',
//     submit_type: null,
//     subscription: null,
//     success_url: 'http://localhost:3000/checkout?nft_id=104&serial_no=10&success=true',
//     total_details: { amount_discount: 0, amount_shipping: 0, amount_tax: 0 },
//     url: null
//   }
// }
