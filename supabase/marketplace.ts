import Nft from "@/types/Nft";
import { supabase } from "./supabase-client";

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
