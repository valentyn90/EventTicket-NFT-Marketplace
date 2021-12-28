import { supabase } from "@/supabase/supabase-admin";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const user_details_id = req.query.user_details_id as string;
  const twitter = req.query.twitter as string;


  const updateTwitter = await supabase
    .from("user_details")
    .update({twitter: twitter})
    .match({id: user_details_id});

  res.status(200).json(updateTwitter)

  return res ;



}
