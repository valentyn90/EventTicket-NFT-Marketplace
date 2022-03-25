import MarketplaceNft from "@/types/MarketplaceNft";
import Nft from "@/types/Nft";
import NftOwner from "@/types/NftOwner";
import OrderBook from "@/types/OrderBook";
import SellData from "@/types/SellData";
import { supabase } from "./supabase-client";

export const getMarketplaceNfts = async (): Promise<MarketplaceNft[]> => {
  // get all minted nfts
  const { data, error } = await supabase
    .from("nft")
    .select("*")
    .eq("minted", true)
    .order("id", { ascending: false });
  // .filter("id", "in", "(104,96,115,108,110,112,113,114,115,116)");

  if (error) {
    console.log(error);
    return [];
  }

  // now get all nft owners
  const nftIds = data?.map((d) => d.id) || [];

  const { data: nftOwners, error: nftOwnersError } = await supabase
    .from("nft_owner")
    .select("*")
    .in("nft_id", nftIds);

  if (nftOwnersError) {
    console.log(nftOwnersError);
    return [];
  }

  // get all mints from nft owners
  const mints =
    nftOwners
      ?.filter((owner) => {
        if (owner.mint !== null) return true;
        else return false;
      })
      .map((owner) => owner.mint) || [];

  // now i need to get the order book data for the serial nos
  const { data: orderBook, error: orderBookError } = await supabase
    .from("order_book")
    .select("*")
    .in("mint", mints)
    .match({ active: true, buy: false });

  if (orderBookError) {
    console.log(orderBookError);
    return [];
  }

  const activeMints = (orderBook as OrderBook[])?.map((order) => order.mint);

  const ownerData = (nftOwners as NftOwner[])
    ?.filter((owner) => {
      if (activeMints?.includes(owner.mint)) return true;
      return false;
    })
    .map((owner) => {
      return {
        nft_owner: owner,
        order_book: (orderBook as OrderBook[])?.find(
          (order) => order.mint === owner.mint
        )!,
      };
    });

  const marketplaceNfts = (data as Nft[])
    ?.map((nft) => {
      return {
        nft: nft,
        sellData: ownerData?.filter(
          (owner) => owner.nft_owner.nft_id === nft.id
        ),
      };
    })
    // sort marketplace nfts by highest sol price
    .sort((a, b) => {
      if (a.sellData.length === 0 && b.sellData.length > 0) return 1;
      if (a.sellData.length > 0 && b.sellData.length === 0) return -1;
      if (a.sellData.length > 0 && b.sellData.length > 0) {
        const aHighPrice = a.sellData.sort((c, d) => {
          if (c.order_book.price < d.order_book.price) return 1;
          if (c.order_book.price > d.order_book.price) return -1;
          return 0;
        })[0].order_book.price;
        const bHighPrice = b.sellData.sort((c, d) => {
          if (c.order_book.price < d.order_book.price) return 1;
          if (c.order_book.price > d.order_book.price) return -1;
          return 0;
        })[0].order_book.price;
        if (aHighPrice < bHighPrice) return 1;
        if (aHighPrice > bHighPrice) return -1;
        return 0;
      } else {
        return 0;
      }
    });

  return marketplaceNfts;
};

export const getSellData = async (nft_id: number): Promise<SellData[]> => {
  const { data: nftOwners, error: nftOwnerError } = await supabase
    .from("nft_owner")
    .select("*")
    .match({ nft_id });

  if (nftOwnerError) {
    console.log(nftOwnerError);
    return [];
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
    return [];
  }

  const activeMints = (orderBook as OrderBook[])?.map((order) => order.mint);

  const ownerData = (nftOwners as NftOwner[])
    ?.filter((owner) => {
      if (activeMints?.includes(owner.mint)) return true;
      return false;
    })
    .map((owner) => {
      return {
        nft_owner: owner,
        order_book: (orderBook as OrderBook[])?.find(
          (order) => order.mint === owner.mint
        )!,
      };
    });

  return ownerData;
};

export const getMintedNfts = async (): Promise<Nft[]> => {
  const { data, error } = await supabase
    .from("nft")
    .select("*")
    .eq("minted", true);
  if (error) {
    return [];
  } else {
    // @ts-ignore
    return data;
  }
};

export const getNftByScreenshotId = async (id: number): Promise<Nft | null> => {
  const { data, error } = await supabase
    .from("nft")
    .select("*")
    .eq("screenshot_file_id", id)
    .maybeSingle();

  if (error) {
    alert(error.message);
    return null;
  }
  return data;
};

export const getCheckoutData = async (nft_id: number, serial_no: number) => {
  // get mintId and order_book data
  const { data: mint, error: mintError } = await supabase
    .from("nft_owner")
    .select("mint")
    .match({ nft_id, serial_no })
    .single();

  if (mintError) {
    console.log(mintError);
  }

  let mintId = "";
  if (mint) {
    mintId = mint.mint;
  }

  let orderBook = null;

  const { data: order, error: orderError } = await supabase
    .from("order_book")
    .select("*")
    .match({ mint: mintId, active: true })
    .order("id", { ascending: false });

  if (orderError) {
    console.log(orderError);
  }

  if (order && order.length > 0) {
    orderBook = order[0];
  }

  return {
    mintId,
    orderBook,
  };
};

export const getMintId = async (nft_id: number, serial_no: number) =>
  supabase
    .from("nft_owner")
    .select("mint")
    .match({ nft_id, serial_no })
    .single();

export const getCreditCardSaleByMint = async (mint: string) => {
  const { data, error } = await supabase
    .from("credit_card_sale")
    .select("*")
    .match({ mint })
    .order("id", { ascending: false });

  if (data && data.length > 0) {
    // return most recent credit card sale entry
    return data[0];
  } else {
    return null;
  }
};

export const getCreditCardSaleBySessionId= async (stripe_tx: string) => {
  const { data, error } = await supabase
    .from("credit_card_sale")
    .select("*")
    .match({ stripe_tx })
    .order("id", { ascending: false });

  if (data && data.length > 0) {
    // return most recent credit card sale entry
    return data[0];
  } else {
    return null;
  }
};
