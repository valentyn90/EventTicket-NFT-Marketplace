import { supabase } from "@/supabase/supabase-admin";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { email } = req.body;

  let exists = false;

  const { data: users, error } = await supabase.from("user_details").select("*").eq('email', email);

  if (users && users.length > 0) {
    exists = true;
  }

  return res.status(200).json({ exists });
}
