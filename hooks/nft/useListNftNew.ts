import userStore from "@/mobx/UserStore";
import OrderBook from "@/types/OrderBook";
import { useToast } from "@chakra-ui/react";
import React, { useState } from "react";
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


  async function handleListNftForSale(
    solSellPrice: number,
    nft_id: number,
    selectedSN: number,
    setOrderBook: React.Dispatch<React.SetStateAction<OrderBook | null>>
  ) {
    setListingNft(true);
    setListingStatus("Minting");
    console.log(listingStatus)
    // Check Mint Status

    // Call Mint if not minted

    const start = Date.now();

    // await sleep(10000)


    const res = await fetch(`/api/marketplace/mintInk`, {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      credentials: "same-origin",
      body: JSON.stringify({
        serial_no: selectedSN,
        nft_id,
      }),
    })


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

    const res2 = await fetch(`/api/marketplace/updateMetadata`, {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      credentials: "same-origin",
      body: JSON.stringify({
        mint: mint
      }),
    })

    if (!res2.ok) {
      setListingNft(false);
      setListingStatus("Error");
      console.log(res2)
      return
    }

    setListingStatus("Listing NFT")
    console.log("Listing NFT")

    const res3 = await fetch(`/api/marketplace/listNft`, {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      credentials: "same-origin",
      body: JSON.stringify({
        mint: mint,
        price: solSellPrice,
        currency: "sol",
        buy: false,
      }),
    }).then((res) => res.json())
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
