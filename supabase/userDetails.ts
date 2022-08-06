import { supabase } from "./supabase-client";

export const createUserDetails = async (
  user_id: string,
  referral_code: string,
  referring_user_id: string | null,
  verified_user: boolean,
  email: string,
  twitter: string = ""
) => {
  // first check if user details exists
  const { data, error } = await getUserDetails(user_id);

  if (data) {
    return { data, error };
  } else {
    return supabase
      .from("user_details")
      .insert([
        {
          user_id,
          referral_code,
          referral_limit: 5,
          referring_user_id,
          verified_user,
          email,
          twitter,
        },
      ])
      .single();
  }
};

export const getUserDetails = (id: string) =>
  supabase.from("user_details").select("*").eq("user_id", id).maybeSingle();

export const getUserDetailsByEmail = (email: string) =>
  supabase.from("user_details").select("*").match({ email }).single();

export const updateUsername = async (user_name: string, id: string) =>
  supabase
    .from("user_details")
    .update([
      {
        user_name,
      },
    ])
    .match({ id });

export const updateTwitter = async (twitter: string, id: string) =>
  supabase
    .from("user_details")
    .update([
      {
        twitter,
      },
    ])
    .match({ id });

export const unlockNft = (nft_id: number) =>
  supabase
    .from("nft")
    .update([{ approved: false }])
    .match({ id: nft_id });

export const updateTempUserDetails = (user_id: string, user_name: string) =>
  supabase
    .from("user_details")
    .update([
      {
        user_name,
        role: "marketplace",
      },
    ])
    .match({ user_id });
