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
        name,
        price,
        nft_id,
        sn,
        email,
        user_id,
        order_book_id,
        mint,
        price_sol,
        price_usd,
      } = req.body;

      const solPrice = await fetch(`https://verifiedink.us/api/marketplace/getPrice?mkt=SOL/USD`).then((res) => res.json())

      //Get Picture 
      const metadata = await fetchNFTMetadata(mint);

      let imageLink = metadata.image


      const images = imageLink ? [imageLink] : ["https://ebve3gxspgpu25wgfvoettab56j3kurcsbjfenbjiux2jgxx.arweave.net/IGpNmvJ-5n012xi1_cScwB75O1UiKQUlI0KUUvpJr3k?ext=png"]

      // Look up price directly from the order book - TODO: Eventually confirm with on chain (AH) price.

      const { mintId, orderBook } = await getCheckoutData(nft_id, sn)

      const usdPrice = solPrice.result.price * orderBook.price
      const stripePrice = (+usdPrice * 100).toFixed(0);

      const description = metadata.description
      const product = await stripe.products.create({
        name,
        description,
        images
      });

      // Create Checkout Sessions from body params.
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
            price_data: {
              currency: "usd",
              product: product.id,
              unit_amount: stripePrice,
            },
            quantity: 1,
          },
        ],
        customer_email: email,
        mode: "payment",
        success_url: `${req.headers.origin}/checkout?nft_id=${nft_id}&serial_no=${sn}&session_id={CHECKOUT_SESSION_ID}&success=true`,
        cancel_url: `${req.headers.origin}/card/${nft_id}?serial_no=${sn}&session_id={CHECKOUT_SESSION_ID}&canceled=true`,
        metadata: {
          nft_id: nft_id,
          sn: sn,
          card_preview_image: imageLink,
          seller_id: orderBook.user_id
        }
      });

      // Create the pending credit card sale row here
      const { data, error } = await supabase.from("credit_card_sale").insert([
        {
          user_id,
          order_book_id: orderBook.id,
          mint,
          price_sol: orderBook.price,
          price_usd: stripePrice,
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
    } catch (err: any) {
      console.log(err);
      res.status(err.statusCode || 500).send(err.message);
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
