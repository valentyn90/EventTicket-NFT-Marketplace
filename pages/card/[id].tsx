import BuyNft from "@/components/Collection/BuyNft";
import CancelNft from "@/components/Collection/CancelNft";
import SellNft from "@/components/Collection/SellNft";
import ShareButton from "@/components/Components/ShareButton";
import Card from "@/components/NftCard/Card";
import AlertModal from "@/components/ui/AlertModal";
import { CardBox } from "@/components/ui/CardBox";
import StaticVerifiedInkNft from "@/components/VerifiedInkNft/StaticVerifiedInkNft";
import getSolPrice from "@/hooks/nft/getSolPrice";
import useBuyNft from "@/hooks/nft/useBuyNft";
import useCancelNftListing from "@/hooks/nft/useCancelNftListing";
import useListNft from "@/hooks/nft/useListNft";
import useListNftNew from "@/hooks/nft/useListNftNew";
import useNftOrderBook from "@/hooks/nft/useNftOrderBook";
import userStore from "@/mobx/UserStore";
import { getSellData } from "@/supabase/marketplace";
import {
  getFileLinkFromSupabase,
  getNftById,
} from "@/supabase/supabase-client";
import Nft from "@/types/Nft";
import NftOwner from "@/types/NftOwner";
import OrderBook from "@/types/OrderBook";
import {
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  Select,
  Text,
  useColorModeValue,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";

interface Props {
  nft: Nft | null;
  publicUrl: string | undefined;
  salePrice: number | undefined;
}

const CardId: React.FC<Props> = ({ nft, publicUrl, salePrice }) => {
  if (!nft) return null;
  const toast = useToast();
  const router = useRouter();
  const { solPrice } = getSolPrice();

  const { handleBuyNftCrypto, buyingNft, publicKey, refetchOrderData } =
    useBuyNft();
  const { handleCancelListing, cancellingNft } = useCancelNftListing();
  const { handleListNftForSale, listingNft, listingStatus, setListingStatus } = useListNftNew();
  const { nftOwnerDetails, orderBooks, totalCards, mintDate } = useNftOrderBook(
    {
      nft,
    }
  );

  const [flipCard, setFlipCard] = useState(false);
  const [selectedSN, setSelectedSN] = useState(1);
  const [initFlip, setInitFlip] = useState(false);
  const [solSellPrice, setSolSellPrice] = useState("");
  const [openAlert, setOpenAlert] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderBook | null>(null);
  const [selectedOwner, setSelectedOwner] = useState<NftOwner | null>(null);
  const [mintId, setMintId] = useState("");

  const MARKET_ENABLED = process.env.NEXT_PUBLIC_ENABLE_MARKETPLACE === "true";

  const { serial_no } = router.query;
  let serial_int = serial_no === undefined ? 1 : parseInt(serial_no as string);

  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);

    if (query.get("canceled")) {
      toast({
        position: "top",
        title: "Transaction Cancelled",
        description: "Your card was not charged.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    }
  }, []);

  useEffect(() => {
    const { serial_no } = router.query;
    if (serial_no) {
      // redirect if serial no parameter doesn't work with the available serial nos
      let serial_int =
        serial_no === undefined ? 1 : parseInt(serial_no as string);
      if (serial_int < 1) {
        if (nft) {
          router.push(
            {
              pathname: `/card/${nft.id}`,
              query: { serial_no: 1 },
            },
            undefined,
            { shallow: true }
          );
          return;
        }
      }

      if (nftOwnerDetails.length > 0 && nftOwnerDetails.length < serial_int) {
        if (nft) {
          router.push(
            {
              pathname: `/card/${nft.id}`,
              query: { serial_no: nftOwnerDetails.length },
            },
            undefined,
            { shallow: true }
          );
          return;
        }
      }

      setSelectedSN(serial_int);
    } else {
      router.push(
        {
          pathname: `/card/${nft.id}`,
          query: { serial_no: 1 },
        },
        undefined,
        { shallow: true }
      );
    }
  }, [router.query, nft, nftOwnerDetails]);

  useEffect(() => {
    const owner =
      nftOwnerDetails.find((nft) => nft.serial_no === selectedSN) || null;
    setSelectedOwner(owner);
    if (owner) {
      const selectedMint = owner.mint;
      const order = orderBooks.find((order) => order.mint === selectedMint);
      if (order) {
        setSelectedOrder(order);
      } else {
        setSelectedOrder(null);
      }
    } else {
      setSelectedOrder(null);
    }
    nftOwnerDetails.forEach((card) => {
      if (card.serial_no == selectedSN) {
        setMintId(card.mint);
      }
    });
  }, [selectedSN, nftOwnerDetails, orderBooks]);

  useEffect(() => {
    if (confirmCancel) {
      if (!selectedOrder) {
        return;
      }
      if (!selectedOrder.onchain_success) {
        toast({
          position: "top",
          description: "Your NFT is still processing.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setConfirmCancel(false);
        setOpenAlert(false)
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
          duration: 5000,
          isClosable: true,
        });
        setConfirmCancel(false);
        setOpenAlert(false)
        return;
      }

      handleCancelListing(nft_id, selectedSN, setSolSellPrice, setSelectedOrder)
        .then(() => {
          setConfirmCancel(false);
          setOpenAlert(false)
        })
        .catch((err) => {
          console.log(err);
          setConfirmCancel(false);
          setOpenAlert(false)
        });
    }
  }, [confirmCancel]);

  useEffect(() => {
    setListingStatus("");
  }, [selectedSN, confirmCancel])

  useEffect(() => {
    if (listingStatus === "Error"){
      toast({
        position: "top",
        description: "There was an error listing your NFT.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setListingStatus("");
    }
  }, [listingStatus])

  let component;

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
            listingStatus={listingStatus}
          />
        );
      } else {
        component = <ShareButton id={nft.id} serial_no={selectedSN} />;
      }
    } else {
      component = <ShareButton id={nft.id} serial_no={selectedSN} />;
    }
  }

  return (
    <Container maxW={"5xl"} pt={6}>
      {nft && (
            <>
            {listingStatus === "Listed"
              &&
              <Box mb="4">
              <Box textAlign="center" mb="2">
                <Heading>Let's get this Sold!</Heading><Text> Share this link👇</Text>
              </Box>
              <Box display="flex" justifyContent="center">
                <ShareButton sale={true} id={nft.id} serial_no={selectedSN} width={["100%","25%"]} />
              </Box>
              </Box>
              }
        <Flex
          direction={["column", "column", "row"]}
          maxH={["100%", "100%", "700px"]}
          pb={["0px", "0px", "unset"]}
          // justify={"center"}
        >
          <Box flex="1" alignItems="center">
            {listingStatus === "Listed"
            &&
            <Box>
              Share this link to your fans and friends!
            </Box>
            }
            <CardBox>
              {nft.vfd_year == 2022 ?
              <Card
                nft_id={nft.id}
                db_first_name={nft.first_name}
                public_url={publicUrl}
                reverse={false}
                readOnly={true}
                serial_no={serial_int}
                flip={flipCard}
                initFlip={initFlip}
                sale_price={salePrice}
              />
            :

            <StaticVerifiedInkNft
              public_url={publicUrl}
              db_first_name={nft.first_name}
              nftId={nft.id} />

            }
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
          <VStack flex="1" mt={2} w="100%" p={[4, 4, 0]}>
            <Box mb={8} w="100%">
              <Text fontSize={["2xl", "2xl", "4xl"]}>
                {nft.first_name} {nft.last_name}
              </Text>
              {mintDate && (
                <Text fontSize={["l", "l", "2xl"]}>
                  {totalCards} Cards Minted on {mintDate}
                </Text>
              )}
              {mintId && (
                <Text
                  color={"gray"}
                  cursor={"pointer"}
                  fontSize={["sm", "sm", "sm"]}
                  onClick={() => {
                    if (process.env.NEXT_PUBLIC_SOL_ENV!.includes("mainnet")) {
                      window.open(
                        `https://solscan.io/token/${mintId}`,
                        "_blank"
                      );
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
              {nftOwnerDetails && nftOwnerDetails.length > 0 && (
                <HStack mt={6}>
                  <Text fontSize={["l", "l", "2xl"]} mr={2}>
                    View SN:
                  </Text>
                  <Select
                    w="150px"
                    onChange={(e) => {
                      router.push(
                        {
                          pathname: `/card/${nft.id}`,
                          query: { serial_no: Number(e.target.value) },
                        },
                        undefined,
                        { shallow: true }
                      );
                    }}
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
            {component}
          </VStack>
        </Flex>
        </>
      )}
      <AlertModal
        isOpen={openAlert}
        setIsOpen={setOpenAlert}
        confirmCancel={confirmCancel}
        setConfirmCancel={setConfirmCancel}
      />
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  let price = 100
  await fetch("https://verifiedink.us/api/marketplace/getPrice?mkt=SOL/USD")
      .then((res) => res.json())
      .then((result) => {
        if (result.result.price) {
          price = result.result.price;
        } 
      })
      .catch((err) => {
        console.log(err)
      });
  
  console.log(price)
  const { id } = context.params as any;

  let int_id = parseInt(id as string);

  const { data, error } = await getNftById(int_id);

  if (!data || error) {
    return {
      props: {
        nft: null,
      },
    };
  }

  const props: any = {
    nft: data,
  };

  const { publicUrl, error: error2 } = await getFileLinkFromSupabase(
    data.screenshot_file_id
  );

  if (publicUrl) {
    props.publicUrl = publicUrl;
  }

  const openOrders = await getSellData(int_id);

  if (openOrders && openOrders.length > 0) {
    const prices =
      openOrders.map((order) => {
        return order.order_book.price * price
      });

    props.salePrice = parseInt(Math.min(...prices).toFixed(0));

  }

  

  return {
    props,
  };
};

export default observer(CardId);
