import useCancelNftListing from "@/hooks/nft/useCancelNftListing";
import userStore from "@/mobx/UserStore";
import { getFileFromSupabase } from "@/supabase/supabase-client";
import { ModalContentType } from "@/types/ModalContentType";
import Nft from "@/types/Nft";
import SellData from "@/types/SellData";
import { Button } from "@chakra-ui/button";
import { Image } from "@chakra-ui/image";
import { Box, Flex } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/react";
import { Spinner } from "@chakra-ui/spinner";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import AlertModal from "../ui/AlertModal";

interface Props {
  nft: Nft;
  listType: ModalContentType;
  serial_no?: number;
  sellData?: SellData[];
  price?: number;
}

const CardListItem: React.FC<Props> = ({
  nft,
  listType,
  serial_no = 1,
  sellData,
  price,
}) => {
  const toast = useToast();
  const { handleCancelListing, cancellingNft } = useCancelNftListing();
  const [loaded, setLoaded] = useState(false);
  const [screenshot, setScreenshot] = useState(
    "https://verifiedink.us/img/card-mask.png"
  );
  const [openAlert, setOpenAlert] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const MARKET_ENABLED = process.env.NEXT_PUBLIC_ENABLE_MARKETPLACE === "true";

  useEffect(() => {
    if (nft.screenshot_file_id) {
      getFileFromSupabase(nft.screenshot_file_id).then((res) => {
        if (res.file) {
          const uri = URL.createObjectURL(res.file as any);
          setScreenshot(uri);
          setLoaded(true);
        }
        if (res.error) {
          console.log(res.error);
          setLoaded(true);
        }
      });
    } else {
      setLoaded(true);
    }
  }, [nft.screenshot_file_id]);

  useEffect(() => {
    if (confirmCancel) {
      if (!serial_no) {
        toast({
          position: "top",
          description: "Serial number not found.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      handleCancelListing(nft.id, serial_no)
        .then(() => {
          setConfirmCancel(false);
        })
        .catch((err) => {
          console.log(err);
          setConfirmCancel(false);
        });
    }
  }, [confirmCancel]);

  let marketplaceBtnVariant = "outline";
  let marketplaceBtnScheme = "inherit";
  let marketplaceBtnText = "Bid";
  let marketplaceBtnColor = "inherit";

  if (sellData && sellData.length > 0 && MARKET_ENABLED) {
    sellData.sort((a, b) => {
      if (a.order_book.price < b.order_book.price) return 1;
      if (a.order_book.price > b.order_book.price) return -1;
      return 0;
    });

    marketplaceBtnVariant = "solid";
    marketplaceBtnScheme = "blue";
    marketplaceBtnColor = "white";
    marketplaceBtnText = `Buy ${sellData[0].order_book.price}`;
  }

  return (
    <Box
      py={4}
      px={2}
      mb={[6, 6, "unset"]}
      w={["150px", "175px", "200px"]}
      h={["300px", "400px", "400px"]}
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="xl"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      position="relative"
    >
      {loaded ? (
        <>
          <Box
            cursor="pointer"
            w="100%"
            h="100%"
            position="relative"
            display="block"
            onClick={() => {
              if (listType === "collection") {
                userStore.ui.setFieldValue("selectedSN", serial_no);
                userStore.ui.setCollectionSellView(false);
                userStore.ui.openModalWithNft(nft, listType);
              }
              if (listType === "listings") {
                userStore.ui.setCollectionSellView(true);
                userStore.ui.setFieldValue("selectedSN", serial_no);
                userStore.ui.openModalWithNft(nft, listType);
              }
              if (listType === "marketplace") {
                userStore.ui.setMarketplaceBuyCard(sellData!);
                userStore.ui.openModalWithNft(nft, "marketplace-buy");
              }
            }}
          >
            <Image
              position="absolute"
              top={0}
              left={0}
              width="100%"
              height="100%"
              objectFit="contain"
              src={screenshot}
              fallbackSrc="https://verifiedink.us/img/card-mask.png"
            />
          </Box>
          <Flex pt={4} justifyContent="space-around" w="100%">
            <Button
              size="sm"
              colorScheme="blue"
              variant="outline"
              onClick={() => {
                if (listType === "collection") {
                  userStore.ui.setFieldValue("selectedSN", serial_no);
                  userStore.ui.setCollectionSellView(false);
                  userStore.ui.openModalWithNft(nft, listType);
                }
                if (listType === "listings") {
                  userStore.ui.setCollectionSellView(true);
                  userStore.ui.setFieldValue("selectedSN", serial_no);
                  userStore.ui.openModalWithNft(nft, listType);
                }
                if (listType === "marketplace") {
                  userStore.ui.setMarketplaceBuyCard(sellData!);
                  userStore.ui.openModalWithNft(nft, "marketplace-buy");
                }
              }}
            >
              View {listType === "listings" && price && `◎ ${price}`}
            </Button>
            {listType === "listings" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setOpenAlert(true)}
                disabled={cancellingNft || !MARKET_ENABLED}
                colorScheme={"red"}
              >
                {cancellingNft ? <Spinner /> : "Cancel"}
              </Button>
            )}
            {listType === "marketplace" && (
              <Button
                size="sm"
                variant={marketplaceBtnVariant}
                colorScheme={marketplaceBtnScheme}
                color={marketplaceBtnColor}
                disabled={sellData?.length === 0 || !MARKET_ENABLED}
                onClick={() => {
                  // find cheapest SN
                  userStore.ui.setMarketplaceBuyCard(sellData!);
                  userStore.ui.openModalWithNft(nft, "marketplace-buy");
                }}
              >
                {marketplaceBtnText}
              </Button>
            )}
            {listType === "collection" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  userStore.ui.setFieldValue("selectedSN", 1);
                  userStore.ui.setCollectionSellView(true);
                  userStore.ui.openModalWithNft(nft, listType);
                }}
                disabled={!MARKET_ENABLED}
              >
                Sell
              </Button>
            )}
          </Flex>
        </>
      ) : (
        <Spinner />
      )}
      <AlertModal
        isOpen={openAlert}
        setIsOpen={setOpenAlert}
        confirmCancel={confirmCancel}
        setConfirmCancel={setConfirmCancel}
      />
    </Box>
  );
};

export default observer(CardListItem);
