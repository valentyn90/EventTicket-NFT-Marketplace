import { supabase } from "@/supabase/supabase-admin";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { user_id } = req.body;
  if (!user_id) {
    return res.status(500).json({ key: null });
  }

  const { data, error } = await supabase
    .from("keys")
    .select("*")
    .eq("user_id", user_id)
    .single();

  if (data) {
    return res.status(200).json({ key: data.public_key });
  } else {
    return res.status(200).json({ key: null });
  }
}
