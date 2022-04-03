import getSolPrice from "@/hooks/nft/getSolPrice";
import useBuyNft from "@/hooks/nft/useBuyNft";
import useCancelNftListing from "@/hooks/nft/useCancelNftListing";
import useListNft from "@/hooks/nft/useListNft";
import useNftOrderBook from "@/hooks/nft/useNftOrderBook";
import userStore from "@/mobx/UserStore";
import Nft from "@/types/Nft";
import NftOwner from "@/types/NftOwner";
import OrderBook from "@/types/OrderBook";
import {
  Box,
  Button,
  Flex,
  HStack,
  Select,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import BuyNft from "../Collection/BuyNft";
import CancelNft from "../Collection/CancelNft";
import SellNft from "../Collection/SellNft";
import ShareButton from "../Components/ShareButton";
import AlertModal from "../ui/AlertModal";
import { CardBox } from "../ui/CardBox";
import Card from "./Card";

interface Props {
  nft: Nft;
  parentComponent: "marketplace-buy" | "collection";
}

const CardSerialNoFunctions: React.FC<Props> = ({ nft, parentComponent }) => {
  const MARKET_ENABLED = process.env.NEXT_PUBLIC_ENABLE_MARKETPLACE === "true";
  const toast = useToast();
  const { solPrice } = getSolPrice();

  const { handleBuyNftCrypto, buyingNft, publicKey, refetchOrderData } =
    useBuyNft();
  const { nftOwnerDetails, orderBooks, totalCards, mintDate } = useNftOrderBook(
    {
      nft,
    }
  );
  const { handleListNftForSale, listingNft } = useListNft();
  const { handleCancelListing, cancellingNft } = useCancelNftListing();

  const [flipCard, setFlipCard] = useState(false);
  const [initFlip, setInitFlip] = useState(false);
  const [selectedSN, setSelectedSN] = useState(1);
  const [numCardsOwned, setNumCardsOwned] = useState(1);
  const [openAlert, setOpenAlert] = useState(false);
  const [solSellPrice, setSolSellPrice] = useState("");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [ownedNfts, setOwnedNfts] = useState<NftOwner[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderBook | null>(null);
  const [selectedOwner, setSelectedOwner] = useState<NftOwner | null>(null);
  const [mintId, setMintId] = useState("");
  const [initLoad, setInitLoad] = useState(true);

  useEffect(() => {
    // setting initial selected sn
    if (userStore.ui.modalContentType === "listings") {
      // listing view show selected card SN
      const owned_nfts = nftOwnerDetails.filter(
        (nft) => nft.owner_id === userStore.id
      );
      setOwnedNfts(owned_nfts);
      setNumCardsOwned(owned_nfts.length);
      if (initLoad) {
        setSelectedSN(userStore.ui.selectedSN);
        setInitLoad(false);
      }
    } else if (parentComponent === "marketplace-buy") {
      // set SN to cheapest price
      if (orderBooks.length > 0) {
        orderBooks.sort((a, b) => {
          if (a.price > b.price) return 1;
          if (a.price < b.price) return -1;
          return 0;
        });
        const sn =
          nftOwnerDetails.find((owner) => owner.mint === orderBooks[0].mint)
            ?.serial_no || 1;
        if (initLoad) {
          setSelectedSN(sn);
          setInitLoad(false);
        }
      }
    } else if (parentComponent === "collection") {
      // set SN to first in owned_nfts
      const owned_nfts = nftOwnerDetails.filter(
        (nft) => nft.owner_id === userStore.id
      );
      setOwnedNfts(owned_nfts);
      setNumCardsOwned(owned_nfts.length);
      if (initLoad) {
        if (owned_nfts.length > 0) {
          // only set first selected sn on first load
          setSelectedSN(owned_nfts[0].serial_no);
          setInitLoad(false);
        }
      }
    }
  }, [parentComponent, nftOwnerDetails, orderBooks, userStore.ui.listView]);

  useEffect(() => {
    const owner =
      nftOwnerDetails.find((nft) => nft.serial_no === selectedSN) || null;
    setSelectedOwner(owner);

    // set view to manage view if user owns nft on sn change
    if (owner) {
      if (owner.owner_id === userStore.id) {
        userStore.ui.setListView(false);
      } else {
        userStore.ui.setListView(true);
      }
    } else {
      userStore.ui.setListView(true);
    }

    // set mint id
    nftOwnerDetails.forEach((card) => {
      if (card.serial_no == selectedSN) {
        setMintId(card.mint);
      }
    });
  }, [nftOwnerDetails, selectedSN]);

  useEffect(() => {
    // set selected order
    if (mintId) {
      const order = orderBooks.find((order) => order.mint === mintId) || null;
      setSelectedOrder(order);
    } else {
      setSelectedOrder(null);
    }
  }, [selectedSN, nftOwnerDetails, orderBooks, mintId]);

  useEffect(() => {
    // cancel nft use effect
    if (confirmCancel) {
      if (!selectedOrder) {
        return;
      }
      if (!selectedOrder.onchain_success) {
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
        (detail) => detail.serial_no === selectedSN && detail.nft_id === nft.id
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

  if (!userStore.ui.listView) {
    component = (
      <>
        <HStack w="100%" justifyContent="space-between">
          <Button
            px={10}
            colorScheme="gray"
            variant="outline"
            flex="1"
            onClick={() => {
              userStore.ui.setListView(true);
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
  } else {
    if (MARKET_ENABLED) {
      if (selectedOrder) {
        if (
          selectedOrder.active &&
          selectedOrder.public_key !== userStore.publicKey
        ) {
          // buy view
          component = (
            <BuyNft
              handleBuyNftCrypto={handleBuyNftCrypto}
              selectedOrder={selectedOrder}
              buyingNft={buyingNft}
              publicKey={publicKey}
              solPrice={solPrice}
              nft_id={nft.id}
              sn={selectedSN}
            />
          );
        } else if (
          selectedOrder.active &&
          selectedOrder.public_key === userStore.publicKey
        ) {
          // cancel view
          component = (
            <CancelNft
              selectedOrder={selectedOrder}
              solPrice={solPrice}
              nft_id={nft.id}
              selectedSN={selectedSN}
              setOpenAlert={setOpenAlert}
              cancellingNft={cancellingNft}
            />
          );
        } else {
          component = <ShareButton id={nft.id} serial_no={selectedSN} />;
        }
      } else {
        if (selectedOwner) {
          if (selectedOwner.owner_id === userStore.id) {
            // sell view
            component = (
              <SellNft
                solSellPrice={solSellPrice}
                setSolSellPrice={setSolSellPrice}
                solPrice={solPrice}
                nftOwnerDetails={nftOwnerDetails}
                selectedSN={selectedSN}
                nft_id={nft.id}
                setSelectedOrder={setSelectedOrder}
                handleListNftForSale={handleListNftForSale}
                listingNft={listingNft}
              />
            );
          } else {
            component = <ShareButton id={nft.id} serial_no={selectedSN} />;
          }
        } else {
          component = <ShareButton id={nft.id} serial_no={selectedSN} />;
        }
      }
    } else {
      component = <ShareButton id={nft.id} serial_no={selectedSN} />;
    }
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
            nft_id={nft.id}
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
          <Text fontSize={["4xl", "4xl", "6xl"]}>
            {nft.first_name} {nft.last_name}
          </Text>
          <Text fontSize={["l", "l", "2xl"]}>
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
          {parentComponent === "collection" && (
            <Text
              display={["none", "none", "block"]}
              fontSize={["l", "l", "2xl"]}
            >
              Own: {numCardsOwned}/{totalCards} Cards
            </Text>
          )}
          {nftOwnerDetails.length > 0 && (
            <HStack mt={6}>
              <Text fontSize={["l", "l", "2xl"]} mr={2}>
                View SN:
              </Text>
              <Select
                w="200px"
                onChange={(e) => setSelectedSN(Number(e.target.value))}
                value={selectedSN}
              >
                {parentComponent === "collection" &&
                  ownedNfts.map((owner, i) => {
                    const sell = orderBooks.find(
                      (order) => order.mint === owner.mint
                    );
                    let price = "";
                    if (sell) {
                      price = ` - ◎ ${sell.price}`;
                    }
                    return (
                      <option value={owner.serial_no} key={i}>
                        {`${owner.serial_no}${price} - owned`}
                      </option>
                    );
                  })}
                {parentComponent === "marketplace-buy" &&
                  nftOwnerDetails.map((owner, i) => {
                    const sell = orderBooks.find(
                      (order) => order.mint === owner.mint
                    );
                    let owned = "";
                    let price = "";
                    if (sell) {
                      price = ` - ◎ ${sell.price}`;
                    }
                    if (owner.owner_id === userStore.id) {
                      owned = " - owned";
                    }
                    return (
                      <option value={owner.serial_no} key={i}>
                        {`${owner.serial_no}${price}${owned}`}
                      </option>
                    );
                  })}
              </Select>
            </HStack>
          )}
        </Box>
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

export default observer(CardSerialNoFunctions);
