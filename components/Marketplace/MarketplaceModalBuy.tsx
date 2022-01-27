import {
  buy,
  buyAndExecute,
  buyAndExecuteSale,
} from "@/mint/marketplace-front-end";
import userStore from "@/mobx/UserStore";
import { getNftOwnerRows } from "@/supabase/collection";
import { getSellData } from "@/supabase/marketplace";
import NftOwner from "@/types/NftOwner";
import getFormattedDate from "@/utils/getFormattedDate";
import { handleRecruitClick } from "@/utils/shareCard";
import ShareIcon from "@/utils/svg/ShareIcon";
import { Button } from "@chakra-ui/button";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { Box, Flex, Text, VStack, HStack } from "@chakra-ui/layout";
import { Select, Spinner, useToast } from "@chakra-ui/react";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useState, useEffect, useCallback } from "react";
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
  const toast = useToast();
  const { publicKey, sendTransaction } = useWallet();
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const [buying, setBuying] = useState(false);
  const [totalMintedCards, setTotalMintedCards] = useState(1);
  const [solPrice, setSolPrice] = useState(0);
  const [mintDate, setMintDate] = useState("");
  const [selectedSN, setSelectedSN] = useState(0);

  const MARKET_ENABLED = process.env.NEXT_PUBLIC_ENABLE_MARKETPLACE === "true";
  const sellerKey = process.env.NEXT_PUBLIC_SOL_SERVICE_KEY_PUBLIC;

  useEffect(() => {
    // refetch sell data here
    if (userStore.ui.selectedNft?.id) {
      setSelectedSN(0);
      getSellData(userStore.ui.selectedNft?.id).then((data: any) => {
        userStore.ui.setMarketplaceBuyCard(data);
      });
    }
  }, [userStore.ui.refetchMarketplace]);

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

  useEffect(() => {
    // Run once on load and set price in state
    fetch(
      "https://price-api.sonar.watch/prices/So11111111111111111111111111111111111111112"
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.price) {
          setSolPrice(data.price);
        } else {
          setSolPrice(0);
        }
      })
      .catch((err) => {
        setSolPrice(0);
      });
  }, [userStore.ui.sellData]);

  const handleBuyNft = useCallback(async () => {
    if (!publicKey) throw new WalletNotConnectedError();

    // const transaction = new Transaction().add(
    //   SystemProgram.transfer({
    //     fromPubkey: publicKey,
    //     toPubkey: Keypair.generate().publicKey,
    //     lamports: 1,
    //   })
    // );

    const auctionHouse = "zfQkKkdNbZB6Bnqe4ynEyT7gjHSd28mjj1xqPEVMAgT";
    const mint = userStore.ui.sellData[selectedSN].order_book.mint;
    const price = userStore.ui.sellData[selectedSN].order_book.price;
    // Will switch to use this once we enable anyone to sell on the marketplace
    // const sellerKey = userStore.ui.sellData[selectedSN].order_book.public_key;

    setBuying(true);
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
          publicKey: publicKey,
          currency: "sol",
        }),
      })
        .then((res) => res.json())
        .catch((err) => {
          console.log(err);
        });
      setBuying(false);

      if (updateRes.success) {
        if (updateRes.success === true) {
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
      setBuying(false);
      toast({
        position: "top",
        description: res.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [publicKey, sendTransaction, connection]);

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
            onClick={handleBuyNft}
            disabled={buying || !publicKey || !MARKET_ENABLED}
          >
            {buying ? (
              <Spinner />
            ) : (
              <>
                Buy for ◎ {userStore.ui.sellData[selectedSN].order_book.price}
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
