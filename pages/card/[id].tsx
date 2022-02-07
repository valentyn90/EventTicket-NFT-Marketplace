import Card from "@/components/NftCard/Card";
import Nft from "@/types/Nft";
import {
  getFileLinkFromSupabase,
  getNftById,
} from "@/supabase/supabase-client";
import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  HStack,
  Select,
  Spinner,
  Text,
  useColorModeValue,
  useToast,
  VStack,
} from "@chakra-ui/react";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React, { useState, useEffect, useCallback } from "react";
import { CardBox } from "@/components/ui/CardBox";
import { FiRefreshCw } from "react-icons/fi";
import { observer } from "mobx-react-lite";
import SellData from "@/types/SellData";
import { getSellData } from "@/supabase/marketplace";
import { getNftOwnerRows } from "@/supabase/collection";
import getFormattedDate from "@/utils/getFormattedDate";
import ShareButton from "@/components/Components/ShareButton";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { buyAndExecute } from "@/mint/marketplace-front-end";

interface Props {
  data: Nft | null;
  publicUrl: string | undefined;
}

const CardId: React.FC<Props> = ({ data, publicUrl }) => {
  const toast = useToast();
  const router = useRouter();
  const { publicKey, sendTransaction } = useWallet();
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const [flipCard, setFlipCard] = useState(false);
  const [buying, setBuying] = useState(false);
  const [solPrice, setSolPrice] = useState(0);
  const [sellData, setSellData] = useState<SellData[]>([]);
  const [selectedSN, setSelectedSN] = useState(0);
  const [refetchSellData, setRefetchSellData] = useState(false);
  const [totalMintedCards, setTotalMintedCards] = useState(0);
  const [mintDate, setMintDate] = useState("");
  const [initFlip, setInitFlip] = useState(false);

  const MARKET_ENABLED = process.env.NEXT_PUBLIC_ENABLE_MARKETPLACE === "true";
  const AUCTION_HOUSE = process.env.NEXT_PUBLIC_AUCTION_HOUSE;

  const { serial_no } = router.query;
  let serial_int = serial_no === undefined ? 1 : parseInt(serial_no as string);

  useEffect(() => {
    const { serial_no } = router.query;
    if (serial_no) {
      let serial_int =
        serial_no === undefined ? 1 : parseInt(serial_no as string);

      let serial_index = sellData.findIndex(
        (sell) => sell.nft_owner.serial_no === serial_int
      );

      setSelectedSN(serial_index === -1 ? 0 : serial_index);
    }
  }, [router.query, sellData]);

  useEffect(() => {
    if (data?.id) {
      setSelectedSN(0);
      getSellData(data?.id).then((data: any) => {
        setSellData(data);
      });
    }
  }, [data?.id, refetchSellData]);

  useEffect(() => {
    if (data?.id) {
      getNftOwnerRows(data?.id).then(({ data: ownerData, error }) => {
        if (ownerData) {
          setTotalMintedCards(ownerData.length);
          if (ownerData[0]) {
            setMintDate(getFormattedDate(ownerData[0].created_at));
          }
        }
      });
    }
  }, [data?.id]);

  useEffect(() => {
    // Run once on load and set price in state
    fetch(
      "/api/marketplace/getPrice?mkt=SOL/USD"
    )
      .then((res) => res.json())
      .then((result) => {
        if (result.result.price) {
          setSolPrice(result.result.price);
        } else {
          setSolPrice(0);
        }
      })
      .catch((err) => {
        setSolPrice(0);
      });
  }, [data?.id]);

  const handleBuyNft = useCallback(async () => {
    if (!publicKey) throw new WalletNotConnectedError();

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: Keypair.generate().publicKey,
        lamports: 1,
      })
    );

    const auctionHouse = AUCTION_HOUSE!;
    const mint = sellData[selectedSN].order_book.mint;
    const price = sellData[selectedSN].order_book.price;
    const sellerKey = sellData[selectedSN].order_book.public_key;

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
          setRefetchSellData(!refetchSellData);
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

  return (
    <Container maxW={"5xl"} pt={6}>
      {data && (
        <Flex
          direction={["column", "column", "row"]}
          maxH={["100%", "100%", "700px"]}
          pb={["0px", "0px", "unset"]}
          justify={"center"}
        >
          <Box flex="1">
            <CardBox>
              <>
                <Card
                  nft_id={data.id}
                  db_first_name={data.first_name}
                  public_url={publicUrl}
                  reverse={false}
                  readOnly={true}
                  serial_no={serial_int}
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
              </>
            </CardBox>
          </Box>
          <VStack flex="1" mt={10} w="100%" p={[4, 4, 0]}>
            <Box mb={8} w="100%">
              <Text fontSize={["2xl", "2xl", "4xl"]}>
                {data.first_name} {data.last_name}
              </Text>
              <Text fontSize={["l", "l", "2xl"]} mb={6}>
                {totalMintedCards} Cards Minted on {mintDate}
              </Text>
              {sellData.length > 0 && (
                <HStack>
                  <Text fontSize={["l", "l", "2xl"]} mr={2}>
                    View SN:
                  </Text>
                  <Select
                    w="150px"
                    onChange={(e) => setSelectedSN(Number(e.target.value))}
                    value={selectedSN}
                  >
                    {sellData.map((sell, i) => {
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
            {sellData.length > 0 && (
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
                    Buy for ◎ {sellData[selectedSN].order_book.price}
                    {solPrice !== 0 && (
                      <span style={{ marginLeft: "8px" }}>
                        {`($${(
                          sellData[selectedSN].order_book.price * solPrice
                        ).toFixed(2)})`}
                      </span>
                    )}
                  </>
                )}{" "}
              </Button>
            )}
            <HStack w="100%">
              <ShareButton
                id={data?.id}
                flex={1}
                width="unset"
                variant="outline"
                color="white"
                fill="#white"
              />
              <Button flex={1} disabled variant={"outline"}>
                Make an offer
              </Button>
            </HStack>
          </VStack>
        </Flex>
      )}
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as any;

  let int_id = parseInt(id as string);

  const { data, error } = await getNftById(int_id);

  const { publicUrl, error: error2 } = await getFileLinkFromSupabase(
    data.screenshot_file_id
  );

  if (data) {
    if (publicUrl) {
      return {
        props: {
          data,
          publicUrl,
        },
      };
    } else {
      return {
        props: {
          data,
        },
      };
    }
  } else {
    return {
      props: {
        data: null,
      },
    };
  }
};

export default observer(CardId);
