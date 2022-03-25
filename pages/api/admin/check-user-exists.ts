import { supabase } from "@/supabase/supabase-admin";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { email } = req.body;

  let exists = false;

  const { data: users, error } = await supabase.auth.api.listUsers();

  if (!users || error) {
    console.log(error);
    return res.status(200).json({ exists });
  }

  for (var i = 0; i < users.length; i++) {
    if (users[i].email === email) {
      exists = true;
      break;
    }
  }

  return res.status(200).json({ exists });
}
