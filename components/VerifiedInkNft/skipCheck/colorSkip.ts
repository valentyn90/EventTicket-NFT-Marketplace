import Nft from "@/types/Nft";

function colorSkip(nft: Nft, color_top: string, color_bottom: string): Boolean {
  let skip = false;

  if (nft.color_top == color_top && nft.color_bottom == color_bottom) {
    skip = true;
  }

  return skip;
}

export default colorSkip;
