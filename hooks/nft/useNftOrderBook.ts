import userStore from "@/mobx/UserStore";
import { getAllNftOwnersAndOrderBooks } from "@/supabase/collection";
import Nft from "@/types/Nft";
import NftOwner from "@/types/NftOwner";
import OrderBook from "@/types/OrderBook";
import getFormattedDate from "@/utils/getFormattedDate";
import { useEffect, useState } from "react";

interface Props {
  nft: Nft;
}

const useNftOrderBook = ({ nft }: Props) => {
  const [nftOwnerDetails, setNftOwnerDetails] = useState<NftOwner[]>([]);
  const [orderBooks, setOrderBooks] = useState<OrderBook[]>([]);
  const [totalCards, setTotalCards] = useState(0);
  const [mintDate, setMintDate] = useState("");

  useEffect(() => {
    getAllNftOwnersAndOrderBooks(nft.id).then(({ nftOwners, ownerData }) => {
      if (nftOwners) {
        nftOwners.sort((a, b) => {
          if (a.serial_no > b.serial_no) return 1;
          if (a.serial_no < b.serial_no) return -1;
          return 0;
        });

        setNftOwnerDetails(nftOwners);
        setTotalCards(nftOwners.length);
        if (nftOwners[0]) {
          setMintDate(getFormattedDate(nftOwners[0].created_at));
        }
      }
      if (ownerData) {
        setOrderBooks(ownerData);
      }
    });
  }, [nft.id, userStore.ui.refetchMarketplace, userStore.ui.refetchListings]);

  return {
    nftOwnerDetails,
    orderBooks,
    totalCards,
    mintDate,
  };
};

export default useNftOrderBook;
