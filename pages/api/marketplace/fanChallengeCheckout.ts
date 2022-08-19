import { getCheckoutData } from "@/supabase/marketplace";
import { supabase } from "@/supabase/supabase-admin";
import { fetchNFTMetadata } from "@/utils/web3/queries";
import { NextApiRequest, NextApiResponse } from "next";


const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY!);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const {
        product_name,
        // Actual parameters
        email,
        user_id,
        quantity,
        fc_id,
        team_id
      } = req.body;

      // Pull price from fan_challenge
      const { data: fc } = await supabase.from("fan_challenge").select("*").match({ id: fc_id }).maybeSingle();

      let price = 25

      if (fc) {
        price = fc.price
      }
      else { return res.status(400).json({ error: "No price found for this fan challenge" }) }

      const nft_id = fc.nfts[0].nft_id

      let imageLink = "https://verifiedink.us/api/meta/showTwitterPreview/" + nft_id


      const images = [imageLink]

      const stripePrice = (+price * 100).toFixed(0);

      let product_id = ""

      const product_query = await stripe.products.search({
        query: `metadata[\'fc_id\']:\'${fc_id}\'`,
      })

      if (product_query.data.length > 0) {
        product_id = product_query.data[0].id
      }
      else {
        const description = `You are purchasing ${fc.name}'s VerifiedInk Digital Collectible. Each Digital Collectible is randomly
        assigned`

        const product = await stripe.products.create({
          name: product_name,
          description,
          images,
          metadata: {
            fc_id
          }
        });
        product_id = product.id
      }

      // Create Row in fan_challenge_orders table
      const { data: order } = await supabase.from("fan_challenge_orders")
        .insert([
          {
            fc_id,
            user_id,
            team_id,
            quantity,
            price,
            status: "pending"
          },
        ])

      let order_id
      if (order && order[0]) { order_id = order[0].id }
      else { return res.status(400).json({ error: "Error creating order." }) }


      // Create Checkout Sessions from body params.
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
            price_data: {
              currency: "usd",
              product: product_id,
              unit_amount: stripePrice,
            },
            quantity: quantity,
          },
        ],
        customer_email: email,
        mode: "payment",
        success_url: `${req.headers.origin}/challenge/finish_checkout?fc_id=${fc_id}&order_id=${order_id}&email=${email}&stripe_tx={CHECKOUT_SESSION_ID}&success=true`,
        cancel_url: `${req.headers.origin}/challenge/${fc_id}?&session_id={CHECKOUT_SESSION_ID}&canceled=true`,
        metadata: {
          fc_id: fc_id,
          team_id: team_id,
          card_preview_image: imageLink,
          order_id: order_id,
        }
      });

      const {data: order_update} = await supabase.from("fan_challenge_orders").update({
        stripe_tx: session.id,
      }).match({id: order_id})


      return res.status(200).json({ sessionUrl: session.url });

    } catch (err: any) {
      console.log(err);
      res.status(err.statusCode || 500).send(err.message);
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
