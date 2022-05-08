import userStore from "@/mobx/UserStore";
import OrderBook from "@/types/OrderBook";
import { useToast } from "@chakra-ui/react";
import React, { useState } from "react";
import mixpanel from 'mixpanel-browser';
import { useIntercom } from "react-use-intercom";

const useListNft = () => {
  const toast = useToast();
  const [listingNft, setListingNft] = useState(false);
  mixpanel.init('b78dc989c036b821147f68e00c354313')
  const { update, trackEvent } = useIntercom();

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
        duration: null,
        isClosable: true,
      });
    } else if (res.success) {
      // Show success view
      if (res.success === true) {
        userStore.ui.refetchListingsData();
        mixpanel.track("List NFT for Sale",{price_sol: solSellPrice});
        update({
          customAttributes:
            {listed_nft: true}
        })
        trackEvent("List NFT for Sale", {price_sol: solSellPrice});
        toast({
          position: "top",
          description: `Successfully listed your NFT for ${solSellPrice} SOL!`,
          status: "success",
          duration: 8000,
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
