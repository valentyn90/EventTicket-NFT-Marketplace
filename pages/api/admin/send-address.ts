import { supabase } from "@/supabase/supabase-admin";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  
  const {data, error} = await supabase.from('contact').insert(
    req.body
  )
  console.log(error)

  if(error){
    if(error.details.includes('is not present in table "user_details"')){
      return res.status(500).json({message: "We do not have this email address on file."})
    }
    else{ 
      // duplicate key contrain violated means we already have their address.
      return res.status(200).json({ message: "Registered!" })
    }
  }

  else{

  return res.status(200).json({ message: "Registered!" })}


}
