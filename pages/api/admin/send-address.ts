import { supabase } from "@/supabase/supabase-admin";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  
  const {data, error} = await supabase.from('contact').insert(
    req.body
  )


  if(data) {

  return res.status(200).json({ message: "Registered!" })}
  else {
    return res.status(500).json({ message: "We already have your address" })
  }

}
