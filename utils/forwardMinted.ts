import { supabase } from "@/supabase/supabase-client";
import { NextApiRequest } from "next";

export default async function forwardMinted(req: NextApiRequest) {
  const { user } = await supabase.auth.api.getUserByCookie(req);
  if (user) {
    const nft = await supabase
      .from("nft")
      .select("minted")
      .eq("user_id", user.id)
      .single();
    if (nft.data && nft.data.minted) {
      return {
        redirect: {
          destination: "/create/step-8",
          permanent: false,
        },
      };
    }
  }
  return { props: {} };
}
