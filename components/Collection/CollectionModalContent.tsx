import getSolPrice from "@/hooks/nft/getSolPrice";
import useBuyNft from "@/hooks/nft/useBuyNft";
import useCancelNftListing from "@/hooks/nft/useCancelNftListing";
import useListNft from "@/hooks/nft/useListNft";
import useNftOrderBook from "@/hooks/nft/useNftOrderBook";
import userStore from "@/mobx/UserStore";
import NftOwner from "@/types/NftOwner";
import OrderBook from "@/types/OrderBook";
import { Button } from "@chakra-ui/button";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { Box, Flex, HStack, Text, VStack } from "@chakra-ui/layout";
import { Select } from "@chakra-ui/select";
import { useToast } from "@chakra-ui/toast";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import ShareButton from "../Components/ShareButton";
import Card from "../NftCard/Card";
import AlertModal from "../ui/AlertModal";
import { CardBox } from "../ui/CardBox";
import BuyNft from "./BuyNft";
import CancelNft from "./CancelNft";
import SellNft from "./SellNft";

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
  if (!userStore.ui.selectedNft) return null;
  const toast = useToast();

  const { solPrice } = getSolPrice();
  const { handleBuyNftCrypto, buyingNft, publicKey, refetchOrderData } =
    useBuyNft();
  const { handleListNftForSale, listingNft } = useListNft();
  const { handleCancelListing, cancellingNft } = useCancelNftListing();
  const { nftOwnerDetails, orderBooks, totalCards, mintDate } = useNftOrderBook(
    {
      nft: userStore.ui.selectedNft,
    }
  );

  const textColor = useColorModeValue("gray.600", "white");
  const [numCardsOwned, setNumCardsOwned] = useState(1);
  const [selectedSN, setSelectedSN] = useState(userStore.ui.selectedSN || 1);
  const [solSellPrice, setSolSellPrice] = useState("");
  const [openAlert, setOpenAlert] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [ownedNfts, setOwnedNfts] = useState<NftOwner[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<NftOwner | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderBook | null>(null);
  const [mintId, setMintId] = useState("");

  const MARKET_ENABLED = process.env.NEXT_PUBLIC_ENABLE_MARKETPLACE === "true";

  useEffect(() => {
    const owned_nfts = nftOwnerDetails.filter(
      (nft) => nft.owner_id === userStore.id
    );
    setOwnedNfts(owned_nfts);
    setNumCardsOwned(owned_nfts.length);
    if (owned_nfts.length > 0) {
      setSelectedSN(owned_nfts[0].serial_no);
    }
  }, [nftOwnerDetails, userStore.ui.collectionSellView]);

  useEffect(() => {
    const owner = ownedNfts.find((nft) => nft.serial_no === selectedSN) || null;
    setSelectedOwner(owner);

    ownedNfts.forEach((card) => {
      if (card.serial_no == selectedSN) {
        setMintId(card.mint);
      }
    });

    if (owner) {
      const order =
        orderBooks.find((order) => order.mint === owner.mint) || null;

      setSelectedOrder(order);
    }
  }, [selectedSN, ownedNfts, orderBooks, userStore.ui.collectionSellView]);

  useEffect(() => {
    if (confirmCancel) {
      if (!selectedOrder?.onchain_success) {
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
      const nft_id = ownedNfts.find(
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
      handleCancelListing(nft_id, selectedSN, setSolSellPrice, setSelectedOrder)
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
      selectedOrder &&
      selectedOrder.active &&
      selectedOrder.public_key !== userStore.publicKey &&
      userStore.ui.selectedNft?.id
    ) {
      // active order and not owned by current user = buy view
      component = (
        <BuyNft
          handleBuyNftCrypto={handleBuyNftCrypto}
          selectedOrder={selectedOrder}
          buyingNft={buyingNft}
          publicKey={publicKey}
          solPrice={solPrice}
          nft_id={userStore.ui.selectedNft?.id}
          sn={selectedSN}
        />
      );
    } else if (
      selectedOrder &&
      selectedOrder.active &&
      selectedOrder.public_key === userStore.publicKey &&
      userStore.ui.selectedNft?.id
    ) {
      // cancel view
      component = (
        <CancelNft
          selectedOrder={selectedOrder}
          solPrice={solPrice}
          nft_id={userStore.ui.selectedNft?.id}
          selectedSN={selectedSN}
          setOpenAlert={setOpenAlert}
          cancellingNft={cancellingNft}
        />
      );
    } else if (
      userStore.ui.selectedNft?.id &&
      selectedOwner &&
      selectedOwner.owner_id === userStore.id
    ) {
      // sell view
      component = (
        <SellNft
          solSellPrice={solSellPrice}
          setSolSellPrice={setSolSellPrice}
          solPrice={solPrice}
          nftOwnerDetails={ownedNfts}
          selectedSN={selectedSN}
          nft_id={userStore.ui.selectedNft?.id}
          setSelectedOrder={setSelectedOrder}
          handleListNftForSale={handleListNftForSale}
          listingNft={listingNft}
        />
      );
    } else {
      // default view
      component = (
        <ShareButton id={userStore.ui.selectedNft?.id} serial_no={selectedSN} />
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
        <Box display={["none", "none", "block"]} mb={8}>
          <Text color={textColor} fontSize={["4xl", "4xl", "6xl"]}>
            {userStore.ui.selectedNft?.first_name}{" "}
            {userStore.ui.selectedNft?.last_name}
          </Text>
          <Text color={textColor} fontSize={["l", "l", "2xl"]}>
            {totalCards} Cards Minted on {mintDate}
          </Text>
          {mintId && (
            <Text
              color={"gray"}
              cursor={"pointer"}
              fontSize={["sm", "sm", "sm"]}
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
            {ownedNfts.map((detail) => (
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
