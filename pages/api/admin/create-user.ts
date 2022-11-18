import { supabase } from "@/supabase/supabase-admin";
import type { NextApiRequest, NextApiResponse } from "next";
import { nanoid } from "nanoid";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { email } = req.body;

  const { data: user_exists, error: user_error } = await supabase.from("user_details").select("*").eq('email', email).maybeSingle();

  if(user_exists) {
    return res.status(200).json({user:null, userDetails:user_exists})
  }

  const { data: user, error } = await supabase.auth.api.createUser({
    email,
  });

  if (user) {
    const generated_referral_code = nanoid(7);
    // create user details for this user
    const { data: userDetails, error: detailsError } = await supabase
      .from("user_details")
      .insert([
        {
          user_id: user.id,
          referral_code: generated_referral_code,
          referral_limit: 5,
          verified_user: false,
          email,
          twitter: "",
          role: "marketplace",
        },
      ])
      .single();

    return res.status(200).json({ user, userDetails });
  } else {
    console.log(error);
    return res.status(200).json({ user: null, userDetails: null });
  }
}
