import { getNftById, getScreenshot, supabase } from "@/supabase/supabase-client";
import NftOwner from "@/types/NftOwner";
import OrderBook from "@/types/OrderBook";
import {
  Box,
  Button,
  Flex,
  HStack,
  Spinner,
  Text,
  Tooltip,
  useToast,
  VStack,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
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
  listingStatus: string;
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
  listingStatus,
}) => {
  const toast = useToast();

  const [openBuyModal, setOpenBuyModal] = useState(false);

  const [gradYearDisable, setGradYearDisable] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState("");

 
  // temporary list of allowed nft ids
  const allowedNftIds: number[] = [251];

  useEffect(() => {
    // if nft_id isn't in the allowed list
    // check if the grad year is > 22 then disable buy if true
    if (!allowedNftIds.includes(nft_id)) {
      getNftById(nft_id).then(({ data, error }) => {
        if (data) {
          const gradYearNum = Number(data.graduation_year);
          const NILState = ["CA","CT","NJ","NY","LA","CO","NE","UT","AK","KS"].includes(data.usa_state) ;
          if (gradYearNum > 22 && !NILState) {
            setGradYearDisable(true);
          }
          if ([1160,1161,1162,763].includes(data.id)) {
            setGradYearDisable(true);
          }
          if(data.post_hs){
            setGradYearDisable(false);
          }
        }
      });
    } else {
      if (gradYearDisable) {
        setGradYearDisable(false);
      }
    }

    const getNftScreenshot = async () => {
      const {publicUrl} = await getScreenshot(nft_id)
      setScreenshotUrl(publicUrl!)
    }

    getNftScreenshot()
    
  }, [nft_id, allowedNftIds]);

  return (
    <>
      <VStack
        align={`start`}
        spacing={8}
        w="100%"
        className="tooltip-span-style"
      >
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
        <Tooltip
          hasArrow
          label={
            [1160,1161,1162,763].includes(nft_id) ? "You will be able to sell your Naas NFT about one week after the drop concludes." :
            "Only graduating seniors are currently able to place their VerifiedInks for sale in the marketplace."}
          shouldWrapChildren
          isDisabled={!gradYearDisable}
        >
          <Button
            w="100%"
            colorScheme={"blue"}
            color="white"
            onClick={() => {
              const sellSolPrice = Number(solSellPrice);

              if (sellSolPrice <= 0) {
                toast({
                  position: "top",
                  description: "Enter a positive list price.",
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
              process.env.NEXT_PUBLIC_ENABLE_MARKETPLACE === "false" ||
              gradYearDisable
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
        </Tooltip>
      </VStack>
      <MintingModal isOpen={openBuyModal} setIsOpen={setOpenBuyModal} listingStatus={listingStatus} screenshotUrl={screenshotUrl} />
    </>
  );
};

export default SellNft;
