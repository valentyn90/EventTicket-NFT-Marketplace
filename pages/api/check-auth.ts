import { supabase } from "@/utils/supabase-client";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { user } = await supabase.auth.api.getUserByCookie(req);
  if (user) {
    res.status(200).json({ user });
  } else {
    res.status(400).end();
  }
}
