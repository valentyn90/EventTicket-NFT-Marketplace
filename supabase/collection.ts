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
  supabase.from("nft_owner").select("*").eq("nft_id", nft_id);

export const getSellerOrderBookByMint = async (mint: string) =>
  supabase
    .from("order_book")
    .select("*")
    .order("created_at", { ascending: false })
    .match({ mint, active: true, buy: false });

export const getActiveListings = async (user_id: string) => {
  // 1. get active listings in order book
  const { data, error } = await supabase
    .from("order_book")
    .select("mint, price")
    .eq("user_id", user_id)
    .filter("buy", "eq", false)
    .filter("active", "eq", true);

  if (error) {
    console.log(error);
    return null;
  }
  // 2. get nft owner data for mints
  const mintFilter = data
    ?.map((d) => {
      if (d.mint) return d.mint;
    })
    .join();

  const { data: ownerData, error: ownerError } = await supabase
    .from("nft_owner")
    .select("nft_id, serial_no, mint")
    .eq("owner_id", user_id)
    .filter("mint", "in", `(${mintFilter})`);

  if (ownerError) {
    console.log(ownerError);
    return null;
  }

  const ownerAndPriceData = ownerData?.map((owner) => {
    return {
      nft_id: owner.nft_id,
      serial_no: owner.serial_no,
      mint: owner.mint,
      price: data?.find((d) => d.mint === owner.mint).price,
    };
  });

  const nftFilter = ownerData?.map((d) => {
    if (d.nft_id) return d.nft_id;
  });

  // 3. get nft data for owned nfts
  const { data: nftData, error: nftError } = await supabase
    .from("nft")
    .select("*")
    .in("id", nftFilter as any);

  if (nftError) {
    console.log(nftError);
    return null;
  }

  return {
    nfts: nftData,
    ownerAndPriceData,
  };
};
