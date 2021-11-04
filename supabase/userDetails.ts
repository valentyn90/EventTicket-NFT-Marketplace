import { supabase } from "./supabase-client";

export const createUserDetails = (
  user_id: string,
  referral_code: string,
  referring_user_id: string | null,
  verified_user: boolean,
  email: string,
  twitter: string = ""
) =>
  supabase.from("user_details").insert([
    {
      user_id,
      referral_code,
      referral_limit: 5,
      referring_user_id,
      verified_user,
      email,
      twitter,
    },
  ]);

export const getUserDetails = (id: string) =>
  supabase.from("user_details").select("*").eq("user_id", id).maybeSingle();

export const updateUsername = async (user_name: string, id: string) =>
  supabase
    .from("user_details")
    .update([
      {
        user_name,
      },
    ])
    .match({ id });

export const unlockNft = (nft_id: number) =>
  supabase
    .from("nft")
    .update([{ approved: false }])
    .match({ id: nft_id });
