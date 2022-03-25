import { supabase } from "@/supabase/supabase-admin";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { email } = req.body;

  const { data: user, error } = await supabase.auth.api.createUser({
    email,
  });

  if (user) {
    // create user details for this user
    const { data: userDetails, error: detailsError } = await supabase
      .from("user_details")
      .insert([
        {
          user_id: user.id,
          referral_code: "",
          referral_limit: 5,
          verified_user: false,
          email,
          twitter: "",
          role: "marketplace",
        },
      ])
      .single();

    return res.status(200).json({ user });
  } else {
    console.log(error);
    return res.status(200).json({ user: null });
  }
}
