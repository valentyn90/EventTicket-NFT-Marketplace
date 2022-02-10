import userStore from "@/mobx/UserStore";
import OrderBook from "@/types/OrderBook";
import { useToast } from "@chakra-ui/react";
import React, { useState } from "react";

const useListNft = () => {
  const toast = useToast();
  const [listingNft, setListingNft] = useState(false);

  async function handleListNftForSale(
    solSellPrice: number,
    nft_id: number,
    selectedSN: number,
    setOrderBook: React.Dispatch<React.SetStateAction<OrderBook | null>>
  ) {
    setListingNft(true);
    const res = await fetch(`/api/marketplace/sellCustodiedInk`, {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      credentials: "same-origin",
      body: JSON.stringify({
        serial_no: selectedSN,
        nft_id,
        price: solSellPrice,
        currency: "sol",
        buy: false,
      }),
    })
      .then((res) => res.json())
      .catch((err) => {
        console.log(err);
      });
    setListingNft(false);

    if (res.error) {
      toast({
        position: "top",
        description: res.error || "There was an error selling your ink.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } else if (res.success) {
      // Show success view
      if (res.success === true) {
        userStore.ui.refetchListingsData();
        toast({
          position: "top",
          description: `Successfully listed your NFT for ${solSellPrice} SOL!`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        if (res.order) {
          setOrderBook(res.order);
        }
      }
    }
  }

  return {
    handleListNftForSale,
    listingNft,
  };
};

export default useListNft;
