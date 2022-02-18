import getSolPrice from "@/hooks/nft/getSolPrice";
import useBuyNft from "@/hooks/nft/useBuyNft";
import useCancelNftListing from "@/hooks/nft/useCancelNftListing";
import useListNft from "@/hooks/nft/useListNft";
import userStore from "@/mobx/UserStore";
import {
  getNftOwnerRows,
  getSellerOrderBookByMint,
} from "@/supabase/collection";
import NftOwner from "@/types/NftOwner";
import OrderBook from "@/types/OrderBook";
import getFormattedDate from "@/utils/getFormattedDate";
import { Button } from "@chakra-ui/button";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { Box, Flex, HStack, Text, VStack } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/react";
import { Select } from "@chakra-ui/select";
import { useToast } from "@chakra-ui/toast";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import ShareButton from "../Components/ShareButton";
import Card from "../NftCard/Card";
import AlertModal from "../ui/AlertModal";
import { CardBox } from "../ui/CardBox";

interface Props {
  flipCard: boolean;
  initFlip: boolean;
  setInitFlip: React.Dispatch<React.SetStateAction<boolean>>;
  setFlipCard: React.Dispatch<React.SetStateAction<boolean>>;
}

const CollectionModalContent: React.FC<Props> = ({
  flipCard,
  initFlip,
  setInitFlip,
  setFlipCard,
}) => {
  const toast = useToast();

  const { solPrice } = getSolPrice();
  const { handleBuyNft, buyingNft, publicKey, refetchOrderData } = useBuyNft();
  const { handleListNftForSale, listingNft } = useListNft();
  const { handleCancelListing, cancellingNft } = useCancelNftListing();

  const textColor = useColorModeValue("gray.600", "white");
  const [nftOwnerDetails, setNftOwnerDetails] = useState<NftOwner[]>([]);
  const [numCardsOwned, setNumCardsOwned] = useState(1);
  const [mintDate, setMintDate] = useState("");
  const [selectedSN, setSelectedSN] = useState(userStore.ui.selectedSN || 1);
  const [totalCards, setTotalCards] = useState(1);
  const [inputSolPrice, setInputSolPrice] = useState(true);
  const [solSellPrice, setSolSellPrice] = useState("");
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
  const [openAlert, setOpenAlert] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const MARKET_ENABLED = process.env.NEXT_PUBLIC_ENABLE_MARKETPLACE === "true";

  useEffect(() => {
    if (userStore.ui.selectedNft?.id) {
      // get all owned nft serial nos for user and their nft id.
      getNftOwnerRows(userStore.ui.selectedNft?.id).then(({ data, error }) => {
        if (data) {
          const owned_nfts = data.filter(
            (nft: NftOwner) => nft.owner_id === userStore.id
          );
          setNftOwnerDetails([
            ...owned_nfts.sort((a: NftOwner, b: NftOwner) => {
              if (a.serial_no < b.serial_no) return -1;
              if (a.serial_no > b.serial_no) return 1;
              return 0;
            }),
          ]);
          setTotalCards(data.length);
          setNumCardsOwned(owned_nfts.length);
          if (owned_nfts[0]) {
            setMintDate(getFormattedDate(owned_nfts[0].created_at));
          }
        } else if (error) {
          toast({
            position: "top",
            description: error.message,
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      });
    }

    return () => {
      setNftOwnerDetails([]);
    };
  }, [userStore.ui.selectedNft?.id]);

  useEffect(() => {
    // check order book
    if (userStore.ui.collectionSellView) {
      // need to check if mint is already for sale
      const mint = nftOwnerDetails.find(
        (detail) =>
          detail.serial_no === selectedSN &&
          detail.nft_id === userStore.ui.selectedNft?.id
      )?.mint;

      if (mint) {
        getSellerOrderBookByMint(mint).then(({ data, error }) => {
          if (data && data.length > 0) {
            setOrderBook(data[0]);
            setSolSellPrice(data[0].price.toString());
          } else {
            setOrderBook(null);
            setSolSellPrice("");
          }
        });
      } else {
        // mint doesn't exists so order book doesn't exist
        setSolSellPrice("");
        setOrderBook(null);
      }
    }

    () => {
      setSolSellPrice("");
      setOrderBook(null);
    };
  }, [
    selectedSN,
    userStore.ui.selectedNft?.id,
    userStore.ui.collectionSellView,
    nftOwnerDetails,
    userStore.ui.refetchMarketplace,
    refetchOrderData,
  ]);

  useEffect(() => {
    if (confirmCancel) {
      if (!orderBook?.onchain_success) {
        toast({
          position: "top",
          description: "Your NFT is still processing.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setConfirmCancel(false);
        return;
      }

      // get serial no and nft id...
      const nft_id = nftOwnerDetails.find(
        (detail) =>
          detail.serial_no === selectedSN &&
          detail.nft_id === userStore.ui.selectedNft?.id
      )?.nft_id;

      if (!nft_id) {
        toast({
          position: "top",
          description: "There was an error finding your NFT.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setConfirmCancel(false);
        return;
      }
      handleCancelListing(nft_id, selectedSN, setSolSellPrice, setOrderBook)
        .then(() => {
          setConfirmCancel(false);
        })
        .catch((err) => {
          console.log(err);
          setConfirmCancel(false);
        });
    }
  }, [confirmCancel]);

  let component;
  if (userStore.ui.collectionSellView) {
    if (
      orderBook &&
      orderBook.active &&
      orderBook.public_key !== userStore.publicKey
    ) {
      // active order and not owned by current user = buy view
      component = (
        <VStack align={`start`} pt={6} w="100%">
          <Button
            colorScheme="blue"
            color="white"
            w="100%"
            mb={4}
            onClick={() => handleBuyNft(orderBook)}
            disabled={buyingNft}
          >
            {buyingNft ? (
              <Spinner />
            ) : (
              <>
                {!publicKey && `Connect Wallet to `} Buy for ◎ {orderBook.price}
                {solPrice !== 0 && (
                  <span className="ml-8">
                    {`($${(orderBook.price * solPrice).toFixed(2)})`}
                  </span>
                )}
              </>
            )}{" "}
          </Button>
          <HStack w="100%">
            <ShareButton
              id={userStore.ui.selectedNft?.id}
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
    } else if (
      orderBook &&
      orderBook.active &&
      orderBook.public_key === userStore.publicKey
    ) {
      // cancel view
      component = (
        <VStack align={`start`} spacing={8} w="100%">
          <HStack justify={`start`}>
            <Text color={textColor} fontSize={["l", "l", "2xl"]}>
              List Price:
            </Text>
            <Text color={textColor} fontSize={"2xl"}>
              {solSellPrice} SOL
            </Text>
            <Text
              color={"gray"}
              fontSize={"2xl"}
              onClick={() => {
                if (inputSolPrice) {
                  setInputSolPrice(false);
                }
              }}
            >
              {solPrice !== 0 &&
                `($${(solPrice * Number(solSellPrice)).toFixed(2)})`}
            </Text>
          </HStack>
          <VStack justify="center" spacing={[4, 4, 6]} w="100%">
            <ShareButton
              id={userStore.ui.selectedNft?.id}
              serial_no={selectedSN}
            />
            <Button
              px={8}
              colorScheme="red"
              onClick={() => setOpenAlert(true)}
              disabled={
                cancellingNft ||
                process.env.NEXT_PUBLIC_ENABLE_MARKETPLACE === "false"
              }
              w="100%"
            >
              {cancellingNft ? <Spinner /> : "Cancel Listing"}
            </Button>
          </VStack>
        </VStack>
      );
    } else {
      // sell view
      component = (
        <VStack align={`start`} spacing={8} w="100%">
          <HStack justify="start" w="100%">
            <Text
              flex="2"
              color={textColor}
              fontSize={["l", "l", "2xl"]}
              onClick={() => {
                if (inputSolPrice) {
                  setInputSolPrice(false);
                }
              }}
            >
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
            <Text
              flex="1"
              color={textColor}
              fontSize={"2xl"}
              textAlign={"start"}
            >
              SOL
            </Text>

            <Text
              flex="2"
              color={"gray"}
              fontSize={"2xl"}
              onClick={() => {
                if (inputSolPrice) {
                  setInputSolPrice(false);
                }
              }}
            >
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
              const nft_id = nftOwnerDetails.find(
                (detail) =>
                  detail.serial_no === selectedSN &&
                  detail.nft_id === userStore.ui.selectedNft?.id
              )?.nft_id;

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

              if (!nft_id) {
                toast({
                  position: "top",
                  description: "There was an error finding your NFT.",
                  status: "error",
                  duration: 3000,
                  isClosable: true,
                });
                return;
              }

              handleListNftForSale(
                sellSolPrice,
                nft_id,
                selectedSN,
                setOrderBook
              );
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
      );
    }
  } else {
    component = (
      <>
        <HStack w="100%" justifyContent="space-between">
          <Button
            px={10}
            colorScheme="gray"
            variant="outline"
            flex="1"
            onClick={() => {
              userStore.ui.setCollectionSellView(true);
            }}
            disabled={!MARKET_ENABLED}
          >
            Sell
          </Button>
          <Button
            px={10}
            colorScheme="gray"
            disabled
            variant="outline"
            flex="1"
          >
            Gift
          </Button>
        </HStack>

        <ShareButton id={userStore.ui.selectedNft?.id} serial_no={selectedSN} />
      </>
    );
  }

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
        <Box display={["none", "none", "block"]}>
          <Text color={textColor} fontSize={["4xl", "4xl", "6xl"]}>
            {userStore.ui.selectedNft?.first_name}{" "}
            {userStore.ui.selectedNft?.last_name}
          </Text>
          <Text color={textColor} fontSize={["l", "l", "2xl"]} mb={8}>
            {totalCards} Cards Minted on {mintDate}
          </Text>
        </Box>

        <Text
          display={["none", "none", "block"]}
          color={textColor}
          fontSize={["l", "l", "2xl"]}
          mb={8}
        >
          Own: {numCardsOwned}/{totalCards} Cards
        </Text>
        <HStack>
          <Text color={textColor} fontSize={["l", "l", "2xl"]} mr={2}>
            View SN:
          </Text>
          <Select
            color={textColor}
            w="100px"
            onChange={(e) => setSelectedSN(Number(e.target.value))}
            value={selectedSN}
          >
            {nftOwnerDetails.map((detail) => (
              <option value={detail.serial_no} key={detail.id}>
                {detail.serial_no}
              </option>
            ))}
          </Select>
        </HStack>

        {component}
      </VStack>
      <AlertModal
        isOpen={openAlert}
        setIsOpen={setOpenAlert}
        confirmCancel={confirmCancel}
        setConfirmCancel={setConfirmCancel}
      />
    </Flex>
  );
};

export default observer(CollectionModalContent);
