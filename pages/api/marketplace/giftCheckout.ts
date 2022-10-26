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
        email,
        quantity,
        ship
      } = req.body;


      // Will vary by drop_id in the future
      // const images = ["https://verifiedink.us/img/naas/naas-3.png"]
      const single_product = "price_1LUcOBAhoO3h51zPD6FDZpWB"
      const multi_product = "price_1LUcSNAhoO3h51zPK639zQ35"

      // Look up price from config and completed sales.

      const product = quantity == 1 ? single_product : multi_product

      
       
        // Create Checkout Sessions from body params.
        const session = await stripe.checkout.sessions.create({
          line_items: [
            {
              // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
              price: product,
              quantity: 1,
            },
          ],
          customer_email: email,
          mode: "payment",
          success_url: `${req.headers.origin}/gift/finish_checkout?session_id={CHECKOUT_SESSION_ID}&email=${email}&ship=${ship}&success=true&quantity=${quantity}`,
          cancel_url: `${req.headers.origin}/gift/purchase?session_id={CHECKOUT_SESSION_ID}&email=${email}&canceled=true`,
          metadata: {
            ar_card: true,
            ar_quantity: quantity,
            ship: ship,
            gift_flow: true
          },
          allow_promotion_codes: true,
        });

      
      // Create the pending credit card sale row here
      const { data, error } = await supabase.from("ar_credit_card_sale").insert([
        {
          user_id: null,
          nft_id: null,
          quantity,
          email,
          total_cost: quantity == 1 ? 19.99 : 59,
          stripe_tx: session.id,
          tx_status: "pending",
        },
      ]);

      if (data) {
        return res.status(200).json({ sessionUrl: session.url });
      }
      else if (error) {
        res.status(500).json(error.message);
      }

      // return res.status(200).json({ sessionUrl: session.url });
      
    } catch (err: any) {
      console.log(err);
      return res.status(err.statusCode || 500).send(err.message);


    }


  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
