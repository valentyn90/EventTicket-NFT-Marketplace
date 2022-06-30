import { supabase } from "@/supabase/supabase-admin";
import { buffer } from "micro";
import Stripe from "stripe";
import * as web3 from "@solana/web3.js";
import base58 from "bs58";
import randCrypto from "crypto";
import crypto from "crypto-js";
import { cancel, cancelOrder, transferViaCreditCard } from "@/mint/marketplace";
import generateKeypair, { getKeypair } from "@/mint/mint";
import { sendAuctionLoserMail, sendAuctionMail, sendPurchaseMail, sendSaleMail } from "../outreach/send-mail";

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


          if (eventObject.payment_status === "paid") {
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
              })
              .single();

            // Send Success email

            await sendAuctionMail(eventObject.metadata.user_id,
              eventObject.metadata.auction_id,
              eventObject.metadata.bid_amount,
              eventObject.metadata.bid_team_id)

            if(eventObject.metadata.loser_id){
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
