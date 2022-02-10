import userStore from "@/mobx/UserStore";
import OrderBook from "@/types/OrderBook";
import { useToast } from "@chakra-ui/react";
import React, { useState } from "react";

const useCancelNftListing = () => {
  const toast = useToast();

  const [cancellingNft, setCancellingNft] = useState(false);

  async function handleCancelListing(
    nft_id: number,
    selectedSN: number,
    setSolSellPrice?: React.Dispatch<React.SetStateAction<string>>,
    setOrderBook?: React.Dispatch<React.SetStateAction<OrderBook | null>>
  ) {
    setCancellingNft(true);
    const res = await fetch(`/api/marketplace/cancelOrder`, {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      credentials: "same-origin",
      body: JSON.stringify({
        serial_no: selectedSN,
        nft_id,
        currency: "sol",
        buy: false,
      }),
    })
      .then((res) => res.json())
      .catch((err) => {
        console.log(err);
      });
    setCancellingNft(false);

    if (res.error) {
      // error
      toast({
        position: "top",
        description: res.error || "There was an error.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } else if (res.success) {
      // success
      userStore.ui.refetchListingsData();
      if (setSolSellPrice) {
        setSolSellPrice("");
      }
      if (setOrderBook) {
        if (res.orderBook) {
          setOrderBook(res.orderBook);
        } else {
          setOrderBook(null);
        }
      }
      toast({
        position: "top",
        description: "Successfully cancelled your listing.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  return {
    handleCancelListing,
    cancellingNft,
  };
};

export default useCancelNftListing;
