import userStore from "@/mobx/UserStore";
import OrderBook from "@/types/OrderBook";
import { useToast } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import mixpanel from 'mixpanel-browser';
import { useIntercom } from "react-use-intercom";
import { useReward } from 'react-rewards';
import { sleep } from "@/mint/utils/various";


const useListNftNew = () => {
  const toast = useToast();
  const [listingNft, setListingNft] = useState(false);
  const [listingStatus, setListingStatus] = useState("Minting");
  mixpanel.init('b78dc989c036b821147f68e00c354313')
  const { update, trackEvent } = useIntercom();
  const { reward: confettiReward, isAnimating: isConfettiAnimating } =
    useReward('confettiReward', 'emoji', {
      zIndex: 10,
      emoji: ['🏀️', '⚽️', '🏈', '🏅', '🏐', '⚾️'],
      elementCount: 80,
      lifetime: 200,
    });


  const fetch_retry = async (url: RequestInfo, options: RequestInit | undefined, n : number) => {
    let error;
    
    // Testing Error Propagation
    // let res_error: Response = new Response(null, {"status":500, "statusText":"EROROROR"})
    // return res_error
    
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

  async function handleListNftForSale(
    solSellPrice: number,
    nft_id: number,
    selectedSN: number,
    setOrderBook: React.Dispatch<React.SetStateAction<OrderBook | null>>
  ) {
    setListingNft(true);
    setListingStatus("Minting");
    console.log(listingStatus)

    const start = Date.now();

    // await sleep(10000)


    const res = await fetch_retry(`/api/marketplace/mintInk`, {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      credentials: "same-origin",
      body: JSON.stringify({
        serial_no: selectedSN,
        nft_id,
      }),
    },3)


    if (!res.ok) {
      setListingNft(false);
      setListingStatus("Error");
      console.log(res)
      return
    }

    const mint = (await res.json()).mint.mint;

    console.log(`mint: ${mint}`)
    mixpanel.track("Mint Time", {time: (Date.now() - start) / 1000})

    setListingStatus("Updating Metadata")

    const res2 = await fetch_retry(`/api/marketplace/updateMetadata`, {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      credentials: "same-origin",
      body: JSON.stringify({
        mint: mint
      }),
    },3)

    if (!res2.ok) {
      setListingNft(false);
      setListingStatus("Error");
      console.log(res2)
      return
    }

    setListingStatus("Listing NFT")
    console.log("Listing NFT")

    const res3 = await fetch_retry(`/api/marketplace/listNft`, {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      credentials: "same-origin",
      body: JSON.stringify({
        mint: mint,
        price: solSellPrice,
        currency: "sol",
        buy: false,
      }),
    },3).then((res) => res.json())
      .catch((err) => {
        console.log(err);
      });

    console.log(res3)
    if (!res3.success) {
      setListingNft(false);
      setListingStatus("Error");
      console.log(res3)
      return
    } else {
      userStore.ui.refetchListingsData();

      mixpanel.track("List NFT for Sale", { price_sol: solSellPrice });
      update({
        customAttributes:
          { listed_nft: true }
      })
      trackEvent("List NFT for Sale", { price_sol: solSellPrice });

      toast({
        position: "top",
        description: `Successfully listed your NFT for ${solSellPrice} SOL!`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      confettiReward();

      setListingStatus("Listed");

      if (res3.order) {
        setOrderBook(res3.order);
      }
    }

    setListingNft(false);
  }

  return {
    handleListNftForSale,
    listingNft,
    listingStatus,
    setListingStatus
  };
};

export default useListNftNew;
