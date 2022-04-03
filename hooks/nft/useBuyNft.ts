import { buyAndExecute } from "@/mint/marketplace-front-end";
import userStore from "@/mobx/UserStore";
import OrderBook from "@/types/OrderBook";
import { useToast } from "@chakra-ui/react";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useCallback, useState } from "react";

const useBuyNft = () => {
  const toast = useToast();

  const [buyingNft, setBuyingNft] = useState(false);
  const [refetchOrderData, setRefetchOrderData] = useState(false);

  const anchorWallet = useAnchorWallet();
  const { publicKey, sendTransaction } = useWallet();
  const { setVisible } = useWalletModal();
  const { connection } = useConnection();

  const AUCTION_HOUSE = process.env.NEXT_PUBLIC_AUCTION_HOUSE;

  const handleChoosePurchaseMethod = useCallback(async () => {
    // setPicker(true);
    return;
  }, []);

  const handleBuyNftWithCreditCard = useCallback(
    async (orderBook: OrderBook) => {
      // Send to stripe
      // Cancel auctionhouse order
      // Create account with stripe email (if not already created)
      // Transfer the nft to the new account
      // Record the sale in the order book
      //Later - send usdc to seller and royalty accounts
    },
    []
  );

  const handleBuyNftCrypto = useCallback(
    async (orderBook: OrderBook) => {
      if (!publicKey) {
        // show select wallet modal
        setVisible(true);
        return;
      }
      try {
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
              sellerKey: sellerKey!,
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
                description:
                  updateRes.error || "Purchase was likely unsuccessful.",
                status: "error",
                duration: 5000,
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
      } catch (err) {
        console.log(err);
        toast({
          position: "top",
          description: "Purchase was likely unsuccessful.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setBuyingNft(false);
      }
    },
    [publicKey, sendTransaction, connection]
  );

  return {
    handleBuyNftCrypto,
    buyingNft,
    publicKey,
    refetchOrderData,
  };
};

export default useBuyNft;