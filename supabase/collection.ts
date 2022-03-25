import NftOwner from "@/types/NftOwner";
import OrderBook from "@/types/OrderBook";
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

export const getTotalSales = async (pubkey: string) => {
  const { data, error } = await supabase
    .from("completed_sale")
    .select("*")
    .match({ seller_public_key: pubkey });

  if (data) {
    const total = data.filter((val) => val.currency == "sol").reduce((acc, curr) => acc + curr.price, 0);
    const total_usd = data.filter((val) => val.currency == "USD").reduce((acc, curr) => acc + curr.price, 0);
    const count = data.length;
    return { total, count, total_usd };
  }
  return { total: 0, count: 0, total_usd: 0 };
};

export const getPublicKey = async (user_id: string) => {
  const { data: keyData, error: keyError } = await supabase
    .from("keys")
    .select("public_key")
    .eq("user_id", user_id)
    .single();

  console.log(keyData);

  if (keyData) {
    return keyData.public_key;
  } else {
    return null;
  }
};

export const getSellerOrderBookByMint = async (mint: string) =>
  supabase
    .from("order_book")
    .select("*")
    .order("created_at", { ascending: false })
    .match({ mint, active: true, buy: false });

export const getOrderBookByMint = async (mint: string) =>
  supabase
    .from("order_book")
    .select("*")
    .order("created_at", { ascending: false })
    .match({ mint });

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

export const getAllNftOwnersAndOrderBooks = async (
  nft_id: number
): Promise<{ nftOwners: NftOwner[]; ownerData: OrderBook[] }> => {
  // get all nft owner rows by nft id
  // and all order books for the nft owner mint
  const { data: nftOwners, error: nftError } = await getNftOwnerRows(nft_id);
  if (nftError || !nftOwners) {
    console.log(nftError);
    return {
      nftOwners: [],
      ownerData: [],
    };
  }

  const mints =
    nftOwners
      ?.filter((owner) => {
        if (owner.mint !== null) return true;
        else return false;
      })
      .map((owner) => owner.mint) || [];

  const { data: orderBook, error: orderBookError } = await supabase
    .from("order_book")
    .select("*")
    .in("mint", mints)
    .match({ active: true, buy: false });

  if (orderBookError) {
    console.log(orderBookError);
    return {
      nftOwners,
      ownerData: [],
    };
  }

  const activeMints = (orderBook as OrderBook[])?.map((order) => order.mint);

  const ownerData = (nftOwners as NftOwner[])
    ?.filter((owner) => {
      if (activeMints?.includes(owner.mint)) return true;
      return false;
    })
    .map((owner) => {
      return (orderBook as OrderBook[])?.find(
        (order) => order.mint === owner.mint
      )!;
    });

  return {
    ownerData,
    nftOwners,
  };
};

export const getNftOwnerByMint = async (mint: string) =>
  supabase
    .from("nft_owner")
    .select("*")
    .match({
      mint,
    })
    .maybeSingle();
