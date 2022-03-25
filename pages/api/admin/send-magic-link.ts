import { supabase } from "@/supabase/supabase-admin";
import type { NextApiRequest, NextApiResponse } from "next";
import { sendLoginMail } from "../outreach/send-mail";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { email } = req.body;
  let redirect_url: string = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/redirect`;
  console.log(redirect_url)

  // const { user, session, error } = await supabase.auth.signIn(
  //   {email},
  //   {redirectTo: redirect_url}
  // );

  const link :any = await supabase.auth.api.generateLink("magiclink", email, {redirectTo: redirect_url});
  
  const magic_link = link.data!.action_link.replace(/redirect_to.*/, "redirect_to=" + redirect_url);

  console.log(magic_link)

  const mail = await sendLoginMail(email, magic_link);

  if (mail.success) {
    return res.status(200).json({ sent: true });
  } else {
    return res.status(200).json({ sent: false });
  }
}
