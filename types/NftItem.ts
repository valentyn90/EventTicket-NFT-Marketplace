import Nft from "./Nft";

interface NftItem {
  nft: Nft;
  nft_id: number;
  price?: number;
  screenshot_url?: string;
}

export default NftItem;
