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
        user_id,
        quantity,
        drop_id
      } = req.body;


      // Will vary by drop_id in the future
      // const images = ["https://verifiedink.us/img/naas/naas-3.png"]
      const product = "prod_M4jzDdlQdCwGXe"

      // Look up price from config and completed sales.

      const { data: priceData, error: priceError } = await supabase.from('configurations').select('value').eq('key', 'naas_drop').maybeSingle()

      console.log(priceData.value)
      if (priceData) {
        const naas_drop_price = priceData.value.current_price
        const stripePrice = (naas_drop_price * 100).toFixed(0)

        console.log(stripePrice)
        // Create Checkout Sessions from body params.
        const session = await stripe.checkout.sessions.create({
          line_items: [
            {
              // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
              price_data: {
                currency: "usd",
                product: product,
                unit_amount: stripePrice,
              },
              quantity: quantity,
            },
          ],
          customer_email: email,
          mode: "payment",
          success_url: `${req.headers.origin}/drops/finish_checkout?session_id={CHECKOUT_SESSION_ID}&email=${email}&success=true`,
          cancel_url: `${req.headers.origin}/drops/naas?session_id={CHECKOUT_SESSION_ID}&canceled=true`,
          metadata: {
            drop_id: drop_id,
          },
        });

      
      // Create the pending credit card sale row here
      const { data, error } = await supabase.from("drop_credit_card_sale").insert([
        {
          user_id,
          drop_id,
          quantity,
          price_usd: naas_drop_price,
          stripe_tx: session.id,
          status: "pending",
        },
      ]);

      if (data) {
        return res.status(200).json({ sessionUrl: session.url });
      }
      else if (error) {
        res.status(500).json(error.message);
      }
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
