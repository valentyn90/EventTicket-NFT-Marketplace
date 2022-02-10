import getSolPrice from "@/hooks/nft/getSolPrice";
import useBuyNft from "@/hooks/nft/useBuyNft";
import userStore from "@/mobx/UserStore";
import { getNftOwnerRows } from "@/supabase/collection";
import { getSellData } from "@/supabase/marketplace";
import getFormattedDate from "@/utils/getFormattedDate";
import { Button } from "@chakra-ui/button";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { Box, Flex, HStack, Text, VStack } from "@chakra-ui/layout";
import { Select, Spinner, useToast } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import ShareButton from "../Components/ShareButton";
import Card from "../NftCard/Card";
import { CardBox } from "../ui/CardBox";

interface Props {
  flipCard: boolean;
  initFlip: boolean;
  setInitFlip: React.Dispatch<React.SetStateAction<boolean>>;
  setFlipCard: React.Dispatch<React.SetStateAction<boolean>>;
}

const MarketplaceModalBuy: React.FC<Props> = ({
  flipCard,
  initFlip,
  setInitFlip,
  setFlipCard,
}) => {
  const { solPrice } = getSolPrice();
  const { handleBuyNft, buyingNft, publicKey, refetchOrderData } = useBuyNft();

  const [totalMintedCards, setTotalMintedCards] = useState(1);
  const [mintDate, setMintDate] = useState("");
  const [selectedSN, setSelectedSN] = useState(0);

  const MARKET_ENABLED = process.env.NEXT_PUBLIC_ENABLE_MARKETPLACE === "true";

  useEffect(() => {
    // refetch sell data here
    if (userStore.ui.selectedNft?.id) {
      setSelectedSN(0);
      getSellData(userStore.ui.selectedNft?.id).then((data: any) => {
        userStore.ui.setMarketplaceBuyCard(data);
      });
    }
  }, [userStore.ui.refetchMarketplace, refetchOrderData]);

  useEffect(() => {
    if (userStore.ui.selectedNft?.id) {
      getNftOwnerRows(userStore.ui.selectedNft?.id).then(({ data, error }) => {
        if (data) {
          setTotalMintedCards(data.length);
          if (data[0]) {
            setMintDate(getFormattedDate(data[0].created_at));
          }
        }
      });
    }
  }, [userStore.ui.selectedNft?.id]);

  const textColor = useColorModeValue("gray.600", "white");
  return (
    <Flex
      direction={["column", "column", "row"]}
      maxH={["100%", "100%", "700px"]}
      pb={["0px", "0px", "unset"]}
    >
      <Box flex="1">
        <CardBox>
          <Card
            nft_id={userStore.ui.selectedNft?.id}
            readOnly={true}
            flip={flipCard}
            initFlip={initFlip}
          />
          <div
            className="cardbox-refreshicon-div"
            onClick={() => {
              if (!initFlip) {
                setInitFlip(true);
              }
              setFlipCard(!flipCard);
            }}
          >
            <FiRefreshCw />
          </div>
        </CardBox>
      </Box>
      <VStack flex="1" spacing={6} align="start" justify="center">
        <Box mb={8} w="100%">
          <Text color={textColor} fontSize={["4xl", "4xl", "6xl"]}>
            {userStore.ui.selectedNft?.first_name}{" "}
            {userStore.ui.selectedNft?.last_name}
          </Text>
          <Text color={textColor} fontSize={["l", "l", "2xl"]} mb={6}>
            {totalMintedCards} Cards Minted on {mintDate}
          </Text>
          {userStore.ui.sellData.length > 0 && MARKET_ENABLED && (
            <HStack>
              <Text color={textColor} fontSize={["l", "l", "2xl"]} mr={2}>
                View SN:
              </Text>
              <Select
                color={textColor}
                w="150px"
                onChange={(e) => setSelectedSN(Number(e.target.value))}
                value={selectedSN}
              >
                {userStore.ui.sellData.map((sell, i) => {
                  return (
                    <option value={i} key={i}>
                      {`${sell.nft_owner.serial_no} - ◎ ${sell.order_book.price}`}
                    </option>
                  );
                })}
              </Select>
            </HStack>
          )}
        </Box>

        {userStore.ui.sellData.length > 0 && MARKET_ENABLED && (
          <Button
            colorScheme="blue"
            color="white"
            w="100%"
            mb={4}
            onClick={() =>
              handleBuyNft(userStore.ui.sellData[selectedSN].order_book)
            }
            disabled={buyingNft || !MARKET_ENABLED}
          >
            {buyingNft ? (
              <Spinner />
            ) : (
              <>
                {!publicKey && `Connect Wallet to `} Buy for ◎{" "}
                {userStore.ui.sellData[selectedSN].order_book.price}
                {solPrice !== 0 && (
                  <span style={{ marginLeft: "8px" }}>
                    {`($${(
                      userStore.ui.sellData[selectedSN].order_book.price *
                      solPrice
                    ).toFixed(2)})`}
                  </span>
                )}
              </>
            )}{" "}
          </Button>
        )}
        <HStack w="100%">
          <ShareButton
            id={userStore.ui.selectedNft?.id}
            flex={1}
            width="unset"
            variant="outline"
            color="white"
            borderColor="white"
          />
          <Button flex={1} disabled variant={"outline"}>
            Make an offer
          </Button>
        </HStack>
      </VStack>
    </Flex>
  );
};

export default observer(MarketplaceModalBuy);
