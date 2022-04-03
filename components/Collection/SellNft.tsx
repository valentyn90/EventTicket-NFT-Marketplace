import NftOwner from "@/types/NftOwner";
import OrderBook from "@/types/OrderBook";
import {
  Button,
  Flex,
  HStack,
  Spinner,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import MintingModal from "../ui/MintingModal";

interface Props {
  solSellPrice: string;
  setSolSellPrice: React.Dispatch<React.SetStateAction<string>>;
  solPrice: number;
  nftOwnerDetails: NftOwner[];
  selectedSN: number;
  nft_id: number;
  setSelectedOrder: React.Dispatch<React.SetStateAction<OrderBook | null>>;
  handleListNftForSale: (
    solSellPrice: number,
    nft_id: number,
    selectedSN: number,
    setOrderBook: React.Dispatch<React.SetStateAction<OrderBook | null>>
  ) => Promise<void>;
  listingNft: boolean;
}

const SellNft: React.FC<Props> = ({
  solSellPrice,
  setSolSellPrice,
  solPrice,
  nftOwnerDetails,
  selectedSN,
  nft_id,
  setSelectedOrder,
  handleListNftForSale,
  listingNft,
}) => {
  const toast = useToast();

  const [openBuyModal, setOpenBuyModal] = useState(false);

  return (
    <>
      <VStack align={`start`} spacing={8} w="100%">
        <HStack justify="start" w="100%">
          <Text flex="2" fontSize={["l", "l", "2xl"]}>
            List Price:
          </Text>

          <Flex flex="2" borderBottom="0.5px solid gray" align="center">
            <input
              type="number"
              className="sol-sell-price-input"
              value={solSellPrice}
              placeholder="0.1"
              onChange={(e) => setSolSellPrice(e.target.value)}
            />
          </Flex>
          <Text flex="1" fontSize={"2xl"} textAlign={"start"}>
            SOL
          </Text>

          <Text flex="2" color={"gray"} fontSize={"2xl"}>
            {solPrice !== 0 &&
              solSellPrice != "" &&
              `($${(solPrice * Number(solSellPrice)).toFixed(2)})`}
          </Text>
        </HStack>
        <Button
          w="100%"
          colorScheme={"blue"}
          color="white"
          onClick={() => {
            const sellSolPrice = Number(solSellPrice);

            if (sellSolPrice <= 0) {
              toast({
                position: "top",
                description: "Enter a sell price.",
                status: "error",
                duration: 3000,
                isClosable: true,
              });
              return;
            }

            const nftId = nftOwnerDetails.find(
              (detail) =>
                detail.serial_no === selectedSN && detail.nft_id === nft_id
            )?.nft_id;

            if (!nftId) {
              toast({
                position: "top",
                description: "There was an error finding your NFT.",
                status: "error",
                duration: 3000,
                isClosable: true,
              });
              return;
            }

            setOpenBuyModal(true);

            handleListNftForSale(
              sellSolPrice,
              nftId,
              selectedSN,
              setSelectedOrder
            )
              .then(() => {
                setOpenBuyModal(false);
                setSolSellPrice("");
              })
              .catch((err) => {
                console.log(err);
                setOpenBuyModal(false);
              });
          }}
          disabled={
            listingNft ||
            solSellPrice === "" ||
            process.env.NEXT_PUBLIC_ENABLE_MARKETPLACE === "false"
          }
        >
          {listingNft ? (
            <Spinner />
          ) : (
            `${
              solSellPrice === ""
                ? "Waiting for List Price..."
                : "List for " + solSellPrice + " SOL"
            } `
          )}
        </Button>
      </VStack>
      <MintingModal isOpen={openBuyModal} setIsOpen={setOpenBuyModal} />
    </>
  );
};

export default SellNft;
