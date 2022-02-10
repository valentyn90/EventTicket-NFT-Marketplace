import { buyAndExecute } from "@/mint/marketplace-front-end";
import userStore from "@/mobx/UserStore";
import OrderBook from "@/types/OrderBook";
import { useToast } from "@chakra-ui/react";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { useCallback, useState, useEffect } from "react";

const useBuyNft = () => {
  const toast = useToast();

  const [buyingNft, setBuyingNft] = useState(false);
  const [refetchOrderData, setRefetchOrderData] = useState(false);

  const anchorWallet = useAnchorWallet();
  const { publicKey, sendTransaction } = useWallet();
  const { setVisible } = useWalletModal();
  const { connection } = useConnection();

  const AUCTION_HOUSE = process.env.NEXT_PUBLIC_AUCTION_HOUSE;

  const handleBuyNft = useCallback(
    async (orderBook: OrderBook) => {
      if (!publicKey) {
        // show select wallet modal
        setVisible(true);
        return;
      }

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: Keypair.generate().publicKey,
          lamports: 1,
        })
      );

      const auctionHouse = AUCTION_HOUSE!;
      const mint = orderBook.mint;
      const price = orderBook.price;
      const sellerKey = orderBook.public_key;

      setBuyingNft(true);
      const res = await buyAndExecute(
        auctionHouse,
        anchorWallet,
        mint,
        price,
        anchorWallet?.publicKey.toBase58()!,
        sellerKey!
      );
      console.log(res);

      if (res.txid) {
        // success
        const updateRes = await fetch(`/api/marketplace/buyOrder`, {
          method: "POST",
          headers: new Headers({ "Content-Type": "application/json" }),
          credentials: "same-origin",
          body: JSON.stringify({
            price,
            mint,
            transaction: res.txid,
            publicKey: publicKey.toBase58(),
            currency: "sol",
          }),
        })
          .then((res) => res.json())
          .catch((err) => {
            console.log(err);
          });
        setBuyingNft(false);

        if (updateRes.success) {
          if (updateRes.success === true) {
            setRefetchOrderData(!refetchOrderData);
            userStore.ui.refetchMarketplaceData();
            toast({
              position: "top",
              description: `Successfully purchased the NFT!`,
              status: "success",
              duration: 3000,
              isClosable: true,
            });
          }
        } else {
          if (updateRes.error) {
            toast({
              position: "top",
              description: updateRes.error || "There was an error.",
              status: "error",
              duration: 3000,
              isClosable: true,
            });
          }
        }
      } else {
        setBuyingNft(false);
        toast({
          position: "top",
          description: res.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    },
    [publicKey, sendTransaction, connection]
  );

  return {
    handleBuyNft,
    buyingNft,
    publicKey,
    refetchOrderData,
  };
};

export default useBuyNft;
