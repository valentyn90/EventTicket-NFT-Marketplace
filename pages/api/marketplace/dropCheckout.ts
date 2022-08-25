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
        drop_id,
        nft_type
      } = req.body;


      if (drop_id === 1) {

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
            success_url: `${req.headers.origin}/drops/finish_checkout?session_id={CHECKOUT_SESSION_ID}&email=${email}&success=true&quantity=${quantity}&price=${naas_drop_price}`,
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
      }
      else {

        // Pull price from fan_challenge
        const { data: drop } = await supabase.from("drop").select("*").match({ id: drop_id }).maybeSingle();

        let price = 25

        if (drop) {
          nft_type === "standard" ?
            price = drop.price.standard :
            price = drop.price.premium
        }

        else { return res.status(400).json({ error: "No price found for this fan challenge" }) }

        const nft_id = drop.nfts[0].nft_id

        let imageLink = "https://verifiedink.us/api/meta/showTwitterPreview/" + nft_id

        nft_type === "standard" ?
          imageLink = `https://epfccsgtnbatrzapewjg.supabase.co/storage/v1/object/public/private/drops/${drop.id}-standard.png` :
          imageLink = `https://epfccsgtnbatrzapewjg.supabase.co/storage/v1/object/public/private/drops/${drop.id}-premium.png` 

        const images = [imageLink]

        const stripePrice = (+price * 100).toFixed(0);

        let product_id = ""

        const product_query = await stripe.products.search({
          query: `metadata[\'drop_id\']:\'${drop_id}.${nft_type}\'`,
        })

        console.log(product_query)

        if (product_query.data.length > 0) {
          product_id = product_query.data[0].id
        }
        else {
          const description = (nft_type === "standard") ? `You are purchasing ${drop.player_name}'s VerifiedInk Digital Collectible. Each Digital Collectible is randomly
        assigned` : `You are purchasing ${drop.player_name}'s VerifiedInk Digital Collectible.`

          const product = await stripe.products.create({
            name: `${drop.player_name}'s VerifiedInk`,
            description,
            images,
            metadata: {
              drop_id: drop_id.toString()+"."+nft_type,
            }
          });
          product_id = product.id
        }


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
          success_url: `${req.headers.origin}/drops/finish_drop_checkout?drop_id=${drop_id}&session_id={CHECKOUT_SESSION_ID}&email=${email}&success=true&quantity=${quantity}&price=${price}`,
          cancel_url: `${req.headers.origin}/drops/${drop_id}?&session_id={CHECKOUT_SESSION_ID}&canceled=true`,
          metadata: {
            drop_id,
            card_preview_image: imageLink,
            nft_type // standard or premium
          }
        });

        const { data, error } = await supabase.from("drop_credit_card_sale").insert([
          {
            user_id,
            drop_id,
            quantity,
            price_usd: price,
            stripe_tx: session.id,
            status: "pending",
            nft_type: nft_type
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
