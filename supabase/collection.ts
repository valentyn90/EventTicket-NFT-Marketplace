import { supabase } from "./supabase-client";

export const getOwnedNfts = async (user_id: string) => {
  const { data, error } = await supabase
    .from("nft_owner")
    .select("*")
    .eq("owner_id", user_id);

  if (data) {
    const nft_arr = data.map((nft) => nft.nft_id);
    return supabase.from("nft").select("*").in("id", nft_arr);
  } else {
    return supabase.from("nft").select("*").eq("user_id", user_id);
  }
};

export const getNftOwnerRows = async (nft_id: number) =>
  supabase
    .from("nft_owner")
    .select("*")
    .eq("nft_id", nft_id);
