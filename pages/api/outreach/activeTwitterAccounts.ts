import { supabase } from "@/supabase/supabase-client";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function assetHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {

    const { data, error } = await supabase.from('user_details').select('twitter').neq('twitter','')

    res.send(data?.flatMap(x => x.twitter))
}