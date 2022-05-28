import { supabase } from "@/supabase/supabase-admin";
import { buffer } from "micro";
import Stripe from "stripe";
import * as web3 from "@solana/web3.js";
import base58 from "bs58";
import randCrypto from "crypto";
import crypto from "crypto-js";
import { cancel, cancelOrder, transferViaCreditCard } from "@/mint/marketplace";
import generateKeypair, { getKeypair } from "@/mint/mint";
import { actions } from "@metaplex/js";
import { sendPurchaseMail } from "../outreach/send-mail";

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

            // Call out to stripeTransfer to transfer the nft to the new owner
            const requestOptions = {
              method: "POST",
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({user_id: data.user_id})
            }

            const attempt_transfer = await fetch(`https://verifiedink.us/api/marketplace/stripeTransfer`, requestOptions);

            // cancel listing on chain
            // find active order
            // const { data: orderData, error: orderError } = await supabase
            //   .from("order_book")
            //   .select("*")
            //   .match({ id: data.order_book_id })

            // let activeOrder = null;
            // if (orderData && orderData.length > 0) {
            //   activeOrder = orderData[0];
            // }
            // // console.log({ activeOrder });

            // const actual_seller_keypair = (await getKeypair(
            //   activeOrder.user_id
            // )) as web3.Keypair;
            // const auctionHouse = AUCTION_HOUSE!;
            // const sellerKeypair = await web3.Keypair.fromSecretKey(
            //   base58.decode(verifiedSolSvcKey)
            // );
            // const svcKeypair = sellerKeypair

            // // Delist in DB
            // const canceledOrder = await cancelOrder(
            //   activeOrder.mint,
            //   activeOrder.price,
            //   activeOrder.currency,
            //   activeOrder.buy,
            //   activeOrder.user_id,
            //   activeOrder.public_key
            // );

            // if (canceledOrder.error) {
            //   console.log({ error: "Error with storing cancel record in db", message: canceledOrder.error });
            // }

            // // Delist on chain
            // const ahCancel = await cancel(
            //   auctionHouse,
            //   svcKeypair,
            //   activeOrder.mint,
            //   activeOrder.price,
            //   activeOrder.currency,
            //   activeOrder.buy,
            //   actual_seller_keypair
            // );

            // console.log("Cancelling on chain listing")

            // if (ahCancel.error) {
            //   console.log({ error: "Error with onchain cancel", message: ahCancel.error });
            // }
            // else {
            //   // order cancelled on chain
            //   await supabase
            //     .from("credit_card_sale")
            //     .update({
            //       status: "3_onchain_listing_cancelled",
            //     })
            //     .match({ stripe_tx: eventObject.id })
            // }




            // const userId = data.user_id;

            // let userIdKey = "";

            // // Check if user already has a key
            // const { data: keyData, error: keyError } = await supabase
            //   .from("keys")
            //   .select("*")
            //   .eq("user_id", userId)
            //   .single();

            // if (!keyData) {
            //   // no key for userid, create one
            //   const { data } = await generateKeypair(userId);
            //   console.log({ data });
            //   if (data) {
            //     userIdKey = data.public_key;
            //   }
            // } else {
            //   userIdKey = keyData.public_key;
            // }


            // // Actually transfer the nft to the new owner
            // console.log("Transferring nft to new owner");
            // const sendToken = await transferViaCreditCard(
            //   data.mint,
            //   activeOrder.price,
            //   activeOrder.currency,
            //   actual_seller_keypair,
            //   userIdKey,
            //   svcKeypair
            // )



            // if (sendToken.txId) {
            //   // update nft_owner table with new owner
            //   await supabase
            //     .from("nft_owner")
            //     .update([
            //       {
            //         owner_id: userId,
            //       },
            //     ])
            //     .match({ mint: data.mint });

            //   await supabase
            //     .from("credit_card_sale")
            //     .update({
            //       status: "transferred",
            //     })
            //     .match({ stripe_tx: eventObject.id })
            //     .single();
            // }
            // else {
            //   // Error with Transfer - Let user know
            // }

            // // Todo: Send money to correct addresses



            // // record sale in completed sale table
            // const { data: sale, error: saleError } = await supabase
            //   .from("completed_sale")
            //   .insert([
            //     {
            //       price: eventObject.amount_total / 100,
            //       transaction: eventObject.id,
            //       mint: data.mint,
            //       currency: "USD",
            //       buyer_public_key: userIdKey,
            //       seller_public_key: activeOrder.public_key,
            //     },
            //   ]);
            // if (saleError) {
            //   console.log({ error: "Error with storing sale record in db", message: saleError });
            // }





          } else { // payment_status != "paid"
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
