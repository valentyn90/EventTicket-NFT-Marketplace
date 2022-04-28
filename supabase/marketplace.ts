import MarketplaceNft from "@/types/MarketplaceNft";
import Nft from "@/types/Nft";
import NftOwner from "@/types/NftOwner";
import OrderBook from "@/types/OrderBook";
import SellData from "@/types/SellData";
import { arrayExtensions } from "mobx/dist/internal";
import { supabase } from "./supabase-client";

export const getMarketplaceNfts = async (): Promise<MarketplaceNft[]> => {
  // get all minted nfts
  const { data: nfts, error } = await supabase
    .from("nft")
    .select("*")
    .eq("minted", true)
    .order("id", { ascending: false });

  if (error) {
    console.log(error);
    return [];
  }

  // now get all nft owners
  const nftIds = nfts?.map((d) => d.id) || [];

  // This isn't paginating
  const { data: nftOwners, error: nftOwnersError } = await supabase
    .from("nft_owner")
    .select("*")
    .neq("mint", null)
    .in("nft_id", nftIds);

  if (nftOwnersError) {
    console.log(nftOwnersError);
    return [];
  }

  const { data: orderNew, error: orderNewError } = await supabase
    .from("order_book")
    .select(`*, nft_owner!inner(nft_id)`)
    .eq("active", true)
    .eq("buy", false)
    .order("price")



  const flattenObject = (obj: any) => {
    const flattened: any = {}

    Object.keys(obj).forEach((key) => {
      const value = obj[key]

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(flattened, flattenObject(value))
      } else {
        flattened[key] = value
      }
    })
    return flattened
  }

  const groupBy = function (xs: Array<any>, key: any) {
    return xs.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };

  const objectMap = (obj: any, fn: any) =>
  Object.fromEntries(
    Object.entries(obj).map(
      ([k, v], i) => [k, fn(v, k, i)]
    )
  )

  const ordersFlat = orderNew?.map((order) => { return flattenObject(order) })
  const groupedOrders = groupBy(ordersFlat!, 'nft_id')

  const nftValues = objectMap(groupedOrders, (group: any) => {
    return {
      min: Math.min.apply(Math, group.map(function (o: any) { return o.price })),
      mint: group[0].mint,
    }
  })


  const allMktplaceNfts = (nfts as Nft[])?.map((nft) => {
    return {
      nft: nft,
      price: nftValues[nft.id] ? nftValues[nft.id].min : 0,
      sellData: nftValues[nft.id] ? [{
        nft_owner:  nftOwners?.find((owner) => owner.mint === nftValues[nft.id].mint )!,
        order_book:
          ordersFlat?.find((order) => order.nft_id === nft.id && order.price === nftValues[nft.id]?.min)
      }] : [],
    }
  })

  const mktplaceNfts = allMktplaceNfts?.filter((nft) => {
    return nft.price > 0
  }).sort((a, b) => {
    return a.price - b.price
  }).concat(allMktplaceNfts?.filter((nft) => {return nft.price == 0}))

  return mktplaceNfts;
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
