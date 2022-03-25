import getSolPrice from "@/hooks/nft/getSolPrice";
import useBuyNft from "@/hooks/nft/useBuyNft";
import useNftOrderBook from "@/hooks/nft/useNftOrderBook";
import userStore from "@/mobx/UserStore";
import { getNftOwnerRows } from "@/supabase/collection";
import { getSellData } from "@/supabase/marketplace";
import NftOwner from "@/types/NftOwner";
import OrderBook from "@/types/OrderBook";
import getFormattedDate from "@/utils/getFormattedDate";
import { Button } from "@chakra-ui/button";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { Box, Flex, HStack, Text, VStack } from "@chakra-ui/layout";
import { Select, Spinner, useToast } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import BuyNft from "../Collection/BuyNft";
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
  if (!userStore.ui.selectedNft) return null;
  const { solPrice } = getSolPrice();
  const { handleBuyNftCrypto, buyingNft, publicKey, refetchOrderData } =
    useBuyNft();
  const { nftOwnerDetails, orderBooks, totalCards, mintDate } = useNftOrderBook(
    {
      nft: userStore.ui.selectedNft,
    }
  );

  const textColor = useColorModeValue("gray.600", "white");
  const [selectedSN, setSelectedSN] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<OrderBook | null>(null);
  const [mintId, setMintId] = useState("");

  const MARKET_ENABLED = process.env.NEXT_PUBLIC_ENABLE_MARKETPLACE === "true";

  useEffect(() => {
    // set selected sn as the cheapest price
    if (orderBooks.length > 0) {
      orderBooks.sort((a, b) => {
        if (a.price > b.price) return 1;
        if (a.price < b.price) return -1;
        return 0;
      });

      const sn =
        nftOwnerDetails.find((owner) => owner.mint === orderBooks[0].mint)
          ?.serial_no || 1;
      setSelectedSN(sn);
    } else {
      setSelectedSN(1);
    }
  }, [orderBooks, mintId, nftOwnerDetails]);

  useEffect(() => {
    // set mint id
    nftOwnerDetails.forEach((card) => {
      if (card.serial_no == selectedSN) {
        setMintId(card.mint);
      }
    });
  }, [nftOwnerDetails]);

  useEffect(() => {
    // set selected order
    if (mintId) {
      const order = orderBooks.find((order) => order.mint === mintId);
      if (order) {
        setSelectedOrder(order);
      } else {
        setSelectedOrder(null);
      }
    } else {
      setSelectedOrder(null);
    }
  }, [selectedSN, nftOwnerDetails, orderBooks, mintId]);

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
            serial_no={selectedSN}
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
            {totalCards} Cards Minted on {mintDate}
          </Text>
          {mintId && (
            <Text
              color={"gray"}
              cursor={"pointer"}
              fontSize={["sm", "sm", "sm"]}
              mb={8}
              onClick={() => {
                if (process.env.NEXT_PUBLIC_SOL_ENV!.includes("ssc-dao")) {
                  window.open(`https://solscan.io/token/${mintId}`, "_blank");
                } else {
                  window.open(
                    `https://solscan.io/token/${mintId}?cluster=devnet`,
                    "_blank"
                  );
                }
              }}
            >
              Solana Mint: {mintId.substring(0, 8)}...
            </Text>
          )}
          {nftOwnerDetails.length > 0 && (
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
                {nftOwnerDetails.map((owner, i) => {
                  const sell = orderBooks.find(
                    (order) => order.mint === owner.mint
                  );
                  let price = "";
                  if (sell) {
                    price = ` - ◎ ${sell.price}`;
                  }
                  return (
                    <option value={owner.serial_no} key={i}>
                      {`${owner.serial_no}${price}`}
                    </option>
                  );
                })}
              </Select>
            </HStack>
          )}
        </Box>
        {MARKET_ENABLED && userStore.ui.selectedNft?.id && selectedOrder && (
          <BuyNft
            handleBuyNftCrypto={handleBuyNftCrypto}
            selectedOrder={selectedOrder}
            buyingNft={buyingNft}
            publicKey={publicKey}
            solPrice={solPrice}
            nft_id={userStore.ui.selectedNft?.id}
            sn={selectedSN}
          />
        )}
        <ShareButton id={userStore.ui.selectedNft?.id} serial_no={selectedSN} />
      </VStack>
    </Flex>
  );
};

export default observer(MarketplaceModalBuy);
