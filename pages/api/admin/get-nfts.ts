import { supabase } from "@/supabase/supabase-client";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.status(200);
  // const { user } = await supabase.auth.api.getUserByCookie(req);
  // if (user) {
  // } else {
  //   res.status(400).end();
  // }
}
