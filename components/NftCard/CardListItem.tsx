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
  let marketplaceBtnColor = "gray";

  if (sellData && sellData.length > 0 && MARKET_ENABLED) {
    sellData.sort((a, b) => {
      if (a.order_book.price < b.order_book.price) return 1;
      if (a.order_book.price > b.order_book.price) return -1;
      return 0;
    });

    marketplaceBtnVariant = "solid";
    marketplaceBtnScheme = "blue";
    marketplaceBtnColor = "white";
    marketplaceBtnText = `${sellData[0].order_book.price} SOL`;
    // (<HStack justifyContent={"center"}>
    //   <svg width="15" height="14.2" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    //     <defs>
    //       <linearGradient id="paint0_linear_537_12995" x1="0.607039" y1="18.3933" x2="19.3929" y2="-0.392604" gradientUnits="userSpaceOnUse">
    //         <stop stop-color="#9945FF"/>
    //         <stop offset="0.2" stop-color="#7962E7"/>
    //         <stop offset="1" stop-color="#00D18C"/>
    //       </linearGradient>
    //     </defs>
    //     <path fill-rule="evenodd" clip-rule="evenodd" d="M3.43571 13.726C3.50026 13.655 3.57886 13.5984 3.66655 13.5595C3.75415 13.5207 3.84904 13.5006 3.94488 13.5006L19.6552 13.5134C19.7222 13.5136 19.7876 13.5331 19.8436 13.5697C19.8996 13.6063 19.9438 13.6584 19.9707 13.7196C19.9977 13.7809 20.0063 13.8487 19.9955 13.9147C19.9847 13.9807 19.9549 14.0421 19.9098 14.0916L16.5643 17.7753C16.4997 17.8463 16.421 17.903 16.3333 17.9418C16.2456 17.9807 16.1507 18.0007 16.0547 18.0007L0.344742 17.9879C0.27784 17.9877 0.212411 17.9682 0.156412 17.9316C0.100412 17.895 0.0562503 17.8428 0.029292 17.7816C0.00233376 17.7204 -0.00627258 17.6526 0.00453645 17.5866C0.0153369 17.5206 0.0450897 17.4592 0.0901601 17.4097L3.43571 13.726ZM19.9098 10.6594C19.9549 10.7089 19.9847 10.7704 19.9955 10.8364C20.0063 10.9024 19.9977 10.9702 19.9707 11.0314C19.9438 11.0926 19.8996 11.1447 19.8436 11.1813C19.7876 11.2179 19.7222 11.2374 19.6552 11.2376L3.9453 11.2505C3.84939 11.2505 3.7545 11.2304 3.66672 11.1916C3.57895 11.1527 3.50026 11.096 3.43571 11.025L0.0901601 7.33916C0.0450897 7.2897 0.0153369 7.22824 0.00453645 7.16224C-0.00627258 7.09623 0.00233376 7.02843 0.029292 6.96723C0.0562503 6.90603 0.100412 6.85391 0.156412 6.81731C0.212411 6.78071 0.27784 6.76116 0.344742 6.76099L16.0551 6.74813C16.151 6.74822 16.2458 6.76828 16.3335 6.80711C16.4212 6.84594 16.4998 6.9026 16.5643 6.97357L19.9098 10.6594ZM3.43571 0.225438C3.50026 0.154489 3.57886 0.0977866 3.66655 0.058965C3.75415 0.020152 3.84904 6.00025e-05 3.94488 0L19.6552 0.0128578C19.7222 0.0129949 19.7876 0.0325556 19.8436 0.0691657C19.8996 0.105776 19.9438 0.157858 19.9707 0.219086C19.9977 0.280323 20.0063 0.348066 19.9955 0.414086C19.9847 0.480106 19.9549 0.541565 19.9098 0.591024L16.5643 4.27475C16.4997 4.34572 16.421 4.40247 16.3333 4.4413C16.2456 4.48013 16.1507 4.50018 16.0547 4.50018L0.344742 4.48733C0.27784 4.48716 0.212411 4.46761 0.156412 4.43101C0.100412 4.39441 0.0562503 4.34229 0.029292 4.28109C0.00233376 4.21989 -0.00627258 4.15209 0.00453645 4.08608C0.0153369 4.02008 0.0450897 3.95862 0.0901601 3.90916L3.43571 0.225438Z" fill="url(#paint0_linear_537_12995)"/>
    //   </svg>
    //   <div>{sellData[0].order_book.price}</div>
    // </HStack>);
  }

  return (
    <Box
      // py={4}
      // px={2}
      mb={[6, 6, "unset"]}
      w={["180px", "225px", "250px"]}
      h={["360px", "450px", "500px"]}
      // borderWidth="1px"
      // borderRadius="lg"
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
                userStore.ui.setListView(false);
                userStore.ui.openModalWithNft(nft, listType);
              }
              if (listType === "listings") {
                userStore.ui.setListView(true);
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
              className="card-twist"
              src={screenshot}
              fallbackSrc="https://verifiedink.us/img/card-mask.png"
            />
          </Box>
          <Flex
            pt={4}
            // flexDir={["column", "column", "row"]}
            justifyContent="space-around"
            w="100%"
          >
            <Box
              w="100%"
              py="1"
              cursor="pointer"
              textAlign="center"
              className="view-btn"
              //size="sm"
              // mb={["8px", "8px", "0"]}
              // colorScheme="blue"
              // variant="outline"
              onClick={() => {
                if (listType === "collection") {
                  userStore.ui.setFieldValue("selectedSN", serial_no);
                  userStore.ui.setListView(false);
                  userStore.ui.openModalWithNft(nft, listType);
                }
                if (listType === "listings") {
                  userStore.ui.setListView(true);
                  userStore.ui.setFieldValue("selectedSN", serial_no);
                  userStore.ui.openModalWithNft(nft, listType);
                }
                if (listType === "marketplace") {
                  userStore.ui.setMarketplaceBuyCard(sellData!);
                  userStore.ui.openModalWithNft(nft, "marketplace-buy");
                }
              }}
            >
              {!price && "View"}
              {price && `◎ ${price}`}
            </Box>
            {listType === "listings" && (
              <Box
                w="100%"
                py="1"
                cursor="pointer"
                textAlign="center"
                variant="outline"
                onClick={() => {
                  if (cancellingNft || !MARKET_ENABLED) {
                    return;
                  }
                  setOpenAlert(true);
                }}
                // disabled={cancellingNft || !MARKET_ENABLED}
                colorScheme={"red"}
              >
                {cancellingNft ? <Spinner /> : "Cancel"}
              </Box>
            )}
            {listType === "marketplace" && (
              <Box
                w="100%"
                py="1"
                cursor="pointer"
                textAlign="center"
                variant={marketplaceBtnVariant}
                colorScheme={marketplaceBtnScheme}
                textColor={marketplaceBtnColor}
                // disabled={sellData?.length === 0 || !MARKET_ENABLED}
                onClick={() => {
                  if (sellData?.length === 0 || !MARKET_ENABLED) {
                    return;
                  }
                  // find cheapest SN
                  userStore.ui.setMarketplaceBuyCard(sellData!);
                  userStore.ui.openModalWithNft(nft, "marketplace-buy");
                }}
              >
                {marketplaceBtnText}
              </Box>
            )}
            {listType === "collection" && (
              <Box
                w="100%"
                py="1"
                textAlign="center"
                textColor={MARKET_ENABLED ? "white" : "gray"}
                cursor={MARKET_ENABLED ? "pointer" : "not-allowed"}
                onClick={() => {
                  if (!MARKET_ENABLED) {
                    return;
                  }
                  // userStore.ui.setFieldValue("selectedSN", 0);
                  userStore.ui.setListView(true);
                  userStore.ui.openModalWithNft(nft, listType);
                }}
              // disabled={!MARKET_ENABLED}
              >
                Sell
              </Box>
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
