import { getCheckoutData } from "@/supabase/marketplace";
import { supabase } from "@/supabase/supabase-admin";
import { fetchNFTMetadata } from "@/utils/web3/queries";
import { NextApiRequest, NextApiResponse } from "next";
import sendMail, { sendAuctionLoserMail, sendAuctionMail } from "../outreach/send-mail";


const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY!);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const {
        email,
        user_id,
        auction_id,
        bid_amount,
        bid_team_id,
        loser_id
      } = req.body;

      // check to see if user is logged in
      const { user } = await supabase.auth.api.getUserByCookie(req);


      // Verify that the bid is valid
      // Check to see if they already have bid on this auction
      // Ensure the bid is higher than the current lowest bid


      const { data: data_auction, error: auction_error } = await supabase.from('auction')
        .select('*')
        .match({ id: auction_id }).single()


      const { data: active_bids, error: active_bids_error } = await supabase.from('auction_bids')
        .select('bid_id, bid_amount, bid_team_id, auction_id, status')
        .eq('auction_id', auction_id)
        .eq('status', 'confirmed')
        .order('bid_amount', { ascending: false })
        .limit(data_auction.items.length || 1)

      if (active_bids && active_bids.length >= data_auction.items.length) {
        // ensure this bid is higher than the lowest bid
        if (bid_amount <= active_bids[active_bids.length - 1].bid_amount) {
          return res.status(400).json({
            error: "Bid is too low"
          })
        }
      }

      // Lookup existing bid

      if (auction_id !== 2) {

        const { data: user_bids, error: user_bids_error } = await supabase.from('auction_bids')
          .select('*')
          .eq('auction_id', auction_id)
          .eq('user_id', user_id)
          .eq('status', 'confirmed')

        if (user_bids && user_bids.length > 0) {
          if (!user) {
            return res.status(200).json({
              status: "error",
              message: "You must be logged in to update your bid."
            })
          }
          if (user_bids[0].bid_amount > bid_amount) {
            return res.status(200).json({
              status: "error",
              message: "Bid is too low. You have already bid higher than this."
            })
          }

          // Cancel old bid and enter a new one

          await supabase
            .from("auction_bids")
            .update({
              status: "cancelled",
            })
            .match({
              user_id,
              auction_id,
            })

          await supabase.from('auction_bids').insert({
            user_id,
            auction_id,
            bid_amount,
            bid_team_id,
            status: 'confirmed'
          })

          // Send Success email

          await sendAuctionMail(user_id,
            auction_id,
            bid_amount,
            bid_team_id,
          )

          await sendAuctionLoserMail(loser_id,
            auction_id,
          )

          return res.status(200).json({
            status: "success",
            message: "Your bid has been updated!"
          })

        }
      }

      const { data, error } = await supabase.from('auction_bids').insert({
        user_id,
        auction_id,
        bid_amount,
        bid_team_id,
        status: 'pending'
      })

      let bid_id = ""

      if (data) {
        bid_id = data[0].bid_id
      }

      // Lookup user to see if we have a stripe cusotmer for them already
      const { data: user_details, error: user_details_error } = await supabase.from('user_details')
        .select('*')
        .eq('user_id', user_id)

      let customer = null

      if (auction_id != 2) {

        if (user_details && user_details[0].stripe_customer_id) {
          console.log("existing customer")
          customer = { id: user_details[0].stripe_customer_id }
        }
        else {
          console.log("new customer")
          customer = await stripe.customers.create({
            email,
          })

          await supabase.from('user_details').update({ 'stripe_customer_id': customer.id }).eq('user_id', user_id)
        }



        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'setup',
          customer: customer.id,
          success_url: `${req.headers.origin}/auction/success?session_id={CHECKOUT_SESSION_ID}&user_id=${user_id}&auction_id=${auction_id}&team_id=${bid_team_id}`,
          cancel_url: `${req.headers.origin}/auction/${auction_id}?status=cancelled`,
          metadata: {
            user_id: user_id,
            auction_id: auction_id,
            bid_amount: bid_amount,
            bid_team_id: bid_team_id,
            loser_id: loser_id,
            bid_id: bid_id
          }
        });

        // 303 redirect to session.url
        return res.status(200).json({ sessionUrl: session.url });
      }
      else {
        // Drop Bid
        const stripePrice = (bid_amount * 100).toFixed(0)

        console.log(stripePrice)
        // Create Checkout Sessions from body params.
        const session = await stripe.checkout.sessions.create({
          line_items: [
            {
              // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
              price_data: {
                currency: "usd",
                product: "prod_M575ljKlnIi6N3",
                unit_amount: 10000, //stripePrice,
              },
              quantity: 1,
            },
          ],
          customer_email: email,
          phone_number_collection: {
            enabled: true,
          },
          mode: "payment",
          success_url: `${req.headers.origin}/drops/finish_bid_checkout?session_id={CHECKOUT_SESSION_ID}&email=${email}&success=true&quantity=${1}&price=${bid_amount}`,
          cancel_url: `${req.headers.origin}/drops/naas?session_id={CHECKOUT_SESSION_ID}&canceled=true`,
          metadata: {
            naas_auction: true,
            user_id: user_id,
            auction_id: auction_id,
            bid_amount: bid_amount,
            bid_id: bid_id,
            bid_team_id: bid_team_id,
          },
        });

        // 303 redirect to session.url
        return res.status(200).json({ sessionUrl: session.url });

      }


    } catch (err: any) {
      console.log(err);
      res.status(err.statusCode || 500).send(err.message);
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
