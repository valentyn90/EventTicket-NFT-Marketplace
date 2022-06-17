import userStore from "@/mobx/UserStore";
import OrderBook from "@/types/OrderBook";
import { useToast } from "@chakra-ui/react";
import React, { useState } from "react";

const useCancelNftListing = () => {
  const toast = useToast();

  const [cancellingNft, setCancellingNft] = useState(false);

  const fetch_retry = async (url: RequestInfo, options: RequestInit | undefined, n : number) => {
    let error;
    for (let i = 0; i < n; i++) {
        try {
            const res = await fetch(url, options);
            if (res.ok) return res;
            console.log("___________FETCH RETRY___________");
        } catch (err: any) {
            console.log("Trying again")
            error = err;
        }
    }
    const res_final = await fetch(url, options);
    return res_final
  };

  async function handleCancelListing(
    nft_id: number,
    selectedSN: number,
    setSolSellPrice?: React.Dispatch<React.SetStateAction<string>>,
    setOrderBook?: React.Dispatch<React.SetStateAction<OrderBook | null>>
  ) {
    setCancellingNft(true);
    const res = await fetch_retry(`/api/marketplace/cancelOrder`, {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      credentials: "same-origin",
      body: JSON.stringify({
        serial_no: selectedSN,
        nft_id,
        currency: "sol",
        buy: false,
      }),
    },4)
      .then((res) => res.json())
      .catch((err) => {
        console.log(err);
      });
    setCancellingNft(false);

    if (res.error) {
      // error
      toast({
        position: "top",
        description: res.error || "There was an error cancelling your listing. Please try again.",
        status: "error",
        duration: 8000,
        isClosable: true,
      });
    } else if (res.success) {
      // success
      userStore.ui.refetchListingsData();
      userStore.ui.refetchMarketplaceData();
      if (setSolSellPrice) {
        setSolSellPrice("");
      }
      if (setOrderBook) {
        setOrderBook(null);
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
