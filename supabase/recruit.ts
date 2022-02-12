import { supabase } from "./supabase-client";

export const isReferralCodeUsed = async (
  referralCode: string
): Promise<boolean> => {
  const { data, error } = await getReferringUser(referralCode);
  if (error) return false;
  const { referral_limit, total_referred_users } = data;
  return total_referred_users >= referral_limit;
};

// TODO: Make this not so fragile
export const getReferringUser = async (referralCode: string) => {
  const { data, error } = await supabase
    .from("user_details")
    .select("*")
    .eq("referral_code", referralCode)
    .maybeSingle();

  return { data: data, error: error };
};

export const updateReferringUser = (id: string, num_referred: number) =>
  supabase
    .from("user_details")
    .update([
      {
        total_referred_users: num_referred,
      },
    ])
    .match({ id });

export const updateUserReferredUser = (id: string, user_id: string) =>
  supabase
    .from("user_details")
    .update([
      {
        referring_user_id: user_id,
        verified_user: true,
      },
    ])
    .match({ id });

export const getReferringUserNft = async (user_id: string) => {
  const { data, error } = await supabase
    .from("user_details")
    .select("referring_user_id")
    .eq("user_id", user_id)
    .single();

  if (error) {
    return null;
  } else {
    const { data: nftId, error: userDetailError } = await supabase
      .from("nft")
      .select("id")
      .eq("user_id", data.referring_user_id)
      .single();
    if (nftId) {
      return nftId;
    } else {
      return null;
    }
  }
};

export const getReferringUserNftId = async (referralCode: string) => {
  const { data: userDetails } = await getReferringUser(referralCode);

  if (userDetails) {
    // get nft id
    const { data: nftId, error: userDetailError } = await supabase
      .from("nft")
      .select("id, first_name")
      .eq("user_id", userDetails.user_id)
      .single();
    return nftId;
  } else {
    return null;
  }
};

export const getReferrerUsername = async (nft_id: number) => {
  const { data: nftData, error: nftError } = await supabase
    .from("nft")
    .select("user_id")
    .match({ id: nft_id })
    .single();

  if (nftData) {
    const user_id = nftData.user_id;

    const { data, error } = await supabase
      .from("user_details")
      .select("referring_user_id")
      .match({ user_id })
      .single();

    if (data) {
      if (data.referring_user_id === null) return "";

      const { data: referrerData, error: error2 } = await supabase
        .from("user_details")
        .select("user_name")
        .match({ user_id: data.referring_user_id })
        .single();

      if (referrerData) {
        return referrerData.user_name;
      } else {
        return "";
      }
    } else {
      return "";
    }
  } else {
    return "";
  }
};
