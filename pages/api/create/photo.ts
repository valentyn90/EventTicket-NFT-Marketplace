import { supabase } from "@/supabase/supabase-admin";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { user } = await supabase.auth.api.getUserByCookie(req);

  let formData = req.body;
  console.log(formData);
  if (formData.nftId == "" && !user) {
    // check for temp user id
  }

  return res.status(200).json({
    success: true,
  });
}
