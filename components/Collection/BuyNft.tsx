import OrderBook from "@/types/OrderBook";
import { Button, HStack, Spinner, VStack } from "@chakra-ui/react";
import { PublicKey } from "@solana/web3.js";
import React from "react";
import ShareButton from "../Components/ShareButton";

interface Props {
  handleBuyNft: (orderBook: OrderBook) => void;
  selectedOrder: OrderBook;
  buyingNft: boolean;
  publicKey: PublicKey | null;
  solPrice: number;
  nft_id: number;
}

const BuyNft: React.FC<Props> = ({
  handleBuyNft,
  selectedOrder,
  buyingNft,
  publicKey,
  solPrice,
  nft_id,
}) => {
  return (
    <VStack align={`start`} pt={6} w="100%">
      <Button
        colorScheme="blue"
        color="white"
        w="100%"
        mb={4}
        onClick={() => handleBuyNft(selectedOrder)}
        disabled={buyingNft}
      >
        {buyingNft ? (
          <Spinner />
        ) : (
          <>
            {!publicKey && `Connect Wallet to `} Buy for ◎ {selectedOrder.price}
            {solPrice !== 0 && (
              <span className="ml-8">
                {`($${(selectedOrder.price * solPrice).toFixed(2)})`}
              </span>
            )}
          </>
        )}{" "}
      </Button>
      <HStack w="100%">
        <ShareButton
          id={nft_id}
          flex={1}
          width="unset"
          variant="outline"
          color="white"
          borderColor="#4688F1"
        />
        <Button flex={1} disabled variant={"outline"}>
          Make an offer
        </Button>
      </HStack>
    </VStack>
  );
};

export default BuyNft;
