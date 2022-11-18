import Nft from "@/types/Nft";

function basicInfoSkip(nft: Nft, nftInput: any): Boolean {
  const nftInputObj = Object.fromEntries(nftInput);

  let skip = true;
  Object.keys(nftInputObj).forEach((key) => {
    switch (key) {
      case "firstName":
        if (nftInputObj[key] != nft.first_name) {
          skip = false;
        }
        break;
      case "lastName":
        if (nftInputObj[key] != nft.last_name) {
          skip = false;
        }
        break;
      case "year":
        if (nftInputObj[key] != nft.graduation_year) {
          skip = false;
        }
        break;
      case "school":
        if (nftInputObj[key] != nft.high_school) {
          skip = false;
        }
        break;
      case "state":
        if (nftInputObj[key] != nft.usa_state) {
          skip = false;
        }
        break;
      case "sport":
        if (nftInputObj[key] != nft.sport) {
          skip = false;
        }
        break;
      case "position":
        if (nftInputObj[key] != nft.sport_position) {
          skip = false;
        }
        break;
      default:
        break;
    }
  });
  return skip;
}

export default basicInfoSkip;
