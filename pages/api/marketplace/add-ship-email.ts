import { getCheckoutData } from "@/supabase/marketplace";
import { supabase } from "@/supabase/supabase-admin";
import { fetchNFTMetadata } from "@/utils/web3/queries";
import { NextApiRequest, NextApiResponse } from "next";



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const {
        email,
        validated_tx
      } = req.body;


      const { data, error } = await supabase.      
      from("ar_credit_card_sale").update(
        {ship_to_email:email}
      ).match({stripe_tx:validated_tx});

      // Still need to actually send the email here
      
      
      if (data) {
        return res.status(200).json({ success: true });
      }
      else if (error) {
        res.status(500).json({success: false, message: error.message});
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
