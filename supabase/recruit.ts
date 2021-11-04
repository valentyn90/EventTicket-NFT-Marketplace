import { supabase } from "./supabase-client";

export const isReferralCodeUsed = async (
  referralCode: string
): Promise<boolean> => {
  const { data, error } = await getReferringUser(referralCode);
  if (error) return false;
  const { referral_limit, total_referred_users } = data;
  return total_referred_users >= referral_limit;
};

export const getReferringUser = (referralCode: string) =>
  supabase
    .from("user_details")
    .select("*")
    .eq("referral_code", referralCode)
    .maybeSingle();

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
