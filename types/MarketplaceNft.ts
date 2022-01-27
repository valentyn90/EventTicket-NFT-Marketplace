import Nft from "./Nft";
import SellData from "./SellData";

interface MarketplaceNft {
  nft: Nft;
  sellData: SellData[];
}

export default MarketplaceNft;
