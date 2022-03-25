import OrderBook from "@/types/OrderBook";
import { Button, HStack, Spinner, VStack } from "@chakra-ui/react";
import { PublicKey } from "@solana/web3.js";
import React, { useState } from "react";
import ShareButton from "../Components/ShareButton";
import SelectBuyModal from "../ui/SelectBuyModal";

interface Props {
  handleBuyNftCrypto: (orderBook: OrderBook) => void;
  selectedOrder: OrderBook;
  buyingNft: boolean;
  publicKey: PublicKey | null;
  solPrice: number;
  nft_id: number;
  sn: number;
}

const BuyNft: React.FC<Props> = ({
  handleBuyNftCrypto,
  selectedOrder,
  buyingNft,
  publicKey,
  solPrice,
  nft_id,
  sn,
}) => {
  const [openBuyModal, setOpenBuyModal] = useState(false);
  return (
    <>
      <VStack align={`start`} pt={6} w="100%">
        <Button
          colorScheme="blue"
          color="white"
          w="100%"
          mb={4}
          onClick={() => {
            setOpenBuyModal(true);
          }}
          disabled={buyingNft}
        >
          {buyingNft ? (
            <Spinner />
          ) : (
            <>
              Buy for ◎{" "}
              {selectedOrder.price}
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
      <SelectBuyModal
        selectedOrder={selectedOrder}
        isOpen={openBuyModal}
        setIsOpen={setOpenBuyModal}
        handleBuyNftCrypto={handleBuyNftCrypto}
        nft_id={nft_id}
        sn={sn}
      />
    </>
  );
};

export default BuyNft;
