import ListingData from "@/types/ListingData";
import MarketplaceNft from "@/types/MarketplaceNft";
import Nft from "@/types/Nft";
import NftItem from "@/types/NftItem";
import NftOwner from "@/types/NftOwner";
import OrderBook from "@/types/OrderBook";
import SellData from "@/types/SellData";
import { arrayExtensions } from "mobx/dist/internal";
import { getScreenshot, getScreenshots, supabase } from "./supabase-client";


export const getNftItems = async (
  sport?: string,
  graduation_year?: string,
  name?: string,
): Promise<NftItem[]> => {

  let items: NftItem[] = [];

  const { data, error } = await supabase.rpc('nft_list')
    .select('*')
    .lt('graduation_year', '27')

  if (data) {
    const nft_arr = data.map((nft) => nft.nft_id);

    const { data: nftData, error: nftError } = await supabase.from("nft").select("*").in("id", nft_arr);

    if (nftData) {

      const nft_ids = nftData.map((nft) => nft.id);
      // const screenshots = await getScreenshots(nft_ids);

      data?.map(
         (d) => {
          const nft = nftData.find((n) => n.id === d.nft_id);
          // const screenshot = screenshots.find((s) => s.nft_id === d.nft_id);
          items.push({
            nft_id: d.nft_id as number,
            nft: nft as Nft,
            price: d.price as number,
            // screenshot_url: screenshot?.public_url,
          });
        }
      )
    }
  }

  return items
}

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

export const getCreditCardSaleBySessionId = async (stripe_tx: string) => {
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
