import Card from "@/components/NftCard/Card";
import { CardBox } from "@/components/ui/CardBox";
import getSolPrice from "@/hooks/nft/getSolPrice";
import { getNftOwnerByMint } from "@/supabase/collection";
import Cookies from "cookies";
import {
  getCheckoutData,
  getCreditCardSaleByMint,
  getCreditCardSaleBySessionId,
} from "@/supabase/marketplace";
import {
  getFileLinkFromSupabase,
  getNftById,
  supabase,
} from "@/supabase/supabase-client";
import { getUserDetails, getUserDetailsByEmail } from "@/supabase/userDetails";
import CreditCardSale from "@/types/CreditCardSale";
import Nft from "@/types/Nft";
import NftOwner from "@/types/NftOwner";
import OrderBook from "@/types/OrderBook";
import validateEmail from "@/utils/validateEmail";
import {
  Box,
  Button,
  Center,
  Container,
  Divider,
  Flex,
  HStack,
  Input,
  Skeleton,
  SkeletonText,
  Spinner,
  Stack,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";

interface Props {
  nft: Nft | null;
  serial_no: number;
  publicUrl?: string;
}
// import {useRealtime} from "react-supabase";

// Steps of the checkout process - The credit_card_sale table is used to track this process
// 1. Buying - The user is initiating a purchase
// 2. Confirming (pending) - The user is paying for the purchase with Stripe, we're waiting for the payment to be confirmed
// 3. Completed (completed) - The payment is completed
// 3a. Rejected (rejected) - The payment rejected
// 4. Transferred (transferred) - The NFT has been transferred to the buyer
// 4a. Paid Out (closed) - Payments have been settled - this is currently not implemented
// 5. Link Sent - This is really just for the UI and isn't used as part of the checkout process.

const Checkout: React.FC<Props> = ({ nft, serial_no, publicUrl }) => {
  const router = useRouter();
  const toast = useToast();
  const { solPrice } = getSolPrice();

  const [email, setEmail] = useState("");
  const [flipCard, setFlipCard] = useState(false);
  const [initFlip, setInitFlip] = useState(false);
  const [mintId, setMintId] = useState("");
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
  const [nftOwner, setNftOwner] = useState<NftOwner | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [magicLinkSubmitting, setMagicLinkSubmitting] = useState(false);
  const [checkoutView, setCheckoutView] = useState("buying");
  const [creditCardSale, setCreditCardSale] =
    useState<CreditCardSale | null>(null);
  const [stripeSessionId, setStripeSessionId] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");


  useEffect(() => {
    if (nft) {
      getCheckoutData(nft.id, serial_no).then(({ mintId, orderBook }) => {
        setMintId(mintId);
        setOrderBook(orderBook);
      });
    }
  }, [nft, serial_no]);

  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      console.log("Order placed! You will receive an email confirmation.");
      setCheckoutView("confirming");

      const session_id = query.get("session_id");
      if (session_id ) {
        setStripeSessionId(session_id);
      }

      // Get the credit card sale table row by finding the mint of the serial no and nft
      if (mintId || session_id || stripeSessionId!=="") {
        getCreditCardSaleBySessionId(session_id!).then((data) => {
          if (data) {
            setCreditCardSale(data);
            getUserDetails(data.user_id).then((user) => {
              if (user.data) {
                setEmail(user.data.email);
                console.log(`buyer email is: ${user.data.email}`)
              }
            })
          }
        });
      }
    }
  }, [mintId]);

  useEffect(() => {

    // create credit card sale listener
    supabase
      .from(`credit_card_sale:stripe_tx=eq.${stripeSessionId}`)
      .on("UPDATE", (payload) => {
        if(payload.new.status !== "") setPaymentStatus(payload.new.status);

        if (payload.new.status === "2_payment_completed") {
          setCheckoutView("completed");
        } else if (payload.new.status === "2b_payment_rejected") {
          setCheckoutView("rejected");
        } else if (payload.new.status === "transferred") {
          setCheckoutView("transferred");
        }
      })
      .subscribe();

    if (creditCardSale) {
      if (creditCardSale.status === "2_payment_completed") {
        setCheckoutView("completed");
      } else if (creditCardSale.status === "3_onchain_listing_cancelled") {
        setCheckoutView("completed");
      } else if (creditCardSale.status === "4_transferred_no_mail") {
        setCheckoutView("completed");
      } else if (creditCardSale.status === "2b_payment_rejected") {
        setCheckoutView("rejected");
      } else if (creditCardSale.status === "transferred") {
        setCheckoutView("transferred");
      }
    }
  }, [creditCardSale]);

  useEffect(() => {
    console.log(`New Payment Status: ${paymentStatus}`);
  }, [paymentStatus]);

  useEffect(() => {
    // once credit card sale = completed
    // check for nft owner table and see if its transferred to new owner
    if (checkoutView === "completed" && mintId) {
      // get nft owner by mint and user id
    //   getNftOwnerByMint(mintId).then(({ data, error }) => {
    //     if (data) {
    //       setNftOwner(data);
    //     }
    //   });
    // }
    setTimeout(async () => {
      await retryTransfer();
    }, 10000)
    }

  }, [checkoutView, mintId]);

  // Redundant 
  // useEffect(() => {
  //   if (nftOwner && creditCardSale) {
  //     if (creditCardSale.status === "transferred") {
  //       setCheckoutView("transferred");
  //     } else if(mintId){
  //       // create listener
  //       supabase.from(`nft_owner:mint=eq.${mintId}`).on("UPDATE", (payload) => {
  //         if (payload.new.owner_id === creditCardSale.user_id) {
  //           setCheckoutView("transferred");
  //         }
  //       });
  //     }
  //   }
  // }, [nftOwner, creditCardSale, mintId]);

  async function handleBuySubmit(e: React.FormEvent) {
    e.preventDefault();

    const valid = validateEmail(email);
    if (!valid) {
      toast({
        position: "top",
        description: "Invalid email.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setSubmitting(true);

    // check if user with email exists
    const { data: userData, error: userError } = await getUserDetailsByEmail(
      email
    );
    if (userData) {
      //&& userData.role === "marketplace") {
      // user exists
      // toast({
      //   position: "top",
      //   description: "Your account exists, please sign in.",
      //   status: "error",
      //   duration: 3000,
      //   isClosable: true,
      // });
      // setSubmitting(false);
      // Temporarily not enforcing login TODO
      // return;
    } else {
      // user doesn't exist, create an account
      const createRes = await fetch(`/api/admin/create-user`, {
        method: "POST",
        headers: new Headers({ "Content-Type": "application/json" }),
        credentials: "same-origin",
        body: JSON.stringify({
          email,
        }),
      })
        .then((res) => res.json())
        .catch((err) => {
          console.log(err);
          return {
            user: null,
            error: true,
          };
        });

      if (createRes.error || !createRes.user) {
        toast({
          position: "top",
          description: "There was a server error.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setSubmitting(false);
        return;
      }
    }

    const { data: confirmedUserData, error: confirmedError } =
      await getUserDetailsByEmail(email);

    // go to stripe checkout

    const usdPrice = solPrice * orderBook!.price;
    const stripePrice = (+usdPrice * 100).toFixed(0);

    const productName = `VerifiedInk #${nft?.id} SN: ${serial_no}`;
    const stripeRes = await fetch(`/api/marketplace/stripeCheckout`, {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      credentials: "same-origin",
      body: JSON.stringify({
        name: productName,
        // Can't trust this price
        price: stripePrice,
        nft_id: nft?.id,
        sn: serial_no,
        email,
        user_id: confirmedUserData.user_id,
        order_book_id: orderBook!.id,
        mint: mintId,
        // Can't trust this price
        price_sol: orderBook?.price,
        // Can't trust this price
        price_usd: stripePrice,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.sessionUrl) {
          window.location.assign(data.sessionUrl);
        }
      })
      .catch((err) => console.log(err));

    setSubmitting(false);
  }

  async function retryTransfer() {
    if(email){
      const { data: confirmedUserData, error: confirmedError } =
        await getUserDetailsByEmail(email);

      console.log(`Retrying transfer for ${confirmedUserData.user_id}`);
      console.log(`With Email ${email}`);

      if (confirmedUserData && confirmedUserData.user_id) {
        const requestOptions = {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: confirmedUserData.user_id })
        }
        const attempt_transfer = fetch(`/api/marketplace/stripeTransfer`, requestOptions);
      }
    }
  }

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();

    const valid = validateEmail(email);
    if (!valid) {
      toast({
        position: "top",
        description: "Invalid email.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setMagicLinkSubmitting(true);
    const res = await fetch(`/api/admin/send-magic-link`, {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      credentials: "same-origin",
      body: JSON.stringify({
        email,
      }),
    });

    const resj = await res.json();

    console.log(`resj: ${resj}`);

    setMagicLinkSubmitting(false);
    if (resj.sent && resj.sent === true) {
      setCheckoutView("link-sent");
    } else {
      toast({
        position: "top",
        description: "There was an error sending your magic link.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }

  let component;
  if (checkoutView === "buying") {
    component = (
      <>
        <Text color="gray.300">Email address</Text>
        <form onSubmit={handleBuySubmit}>
          <Input
            height={["40px", "40px", "50px"]}
            bg="white"
            type="email"
            color="gray.800"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tombrady@verifiedink.us"
          />
          <Button
            type="submit"
            disabled={!orderBook}
            w="100%"
            mt={4}
            colorScheme="blue"
            color="white"
            height={["40px", "40px", "50px"]}
          >
            {submitting ? <Spinner /> : "Pay with card"}
          </Button>
        </form>
      </>
    );
  } else if (checkoutView === "confirming") {
    component = (
      <>
        <Text
          fontWeight={"bold"}
          fontSize={["2xl", "2xl", "3xl"]}
          pt={[8, 10, 20]}
          pb={[4, 8, 12]}
          textAlign="center"
        >
          Payment processing...
        </Text>
        <Spinner alignSelf={"center"} size={"xl"} />
      </>
    );
  } else if (checkoutView === "completed") {
    component = (
      <Flex
        direction="column"
        justify={"center"}
        align="center"
        pt={[8, 8, 12]}
      >
        <svg
          width="35"
          height="35"
          viewBox="0 0 35 35"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="17.5" cy="17.5" r="17.5" fill="#22C55E" />
          <path
            d="M11.5859 19.0981L15.1019 22.6141L23.8919 13.8242"
            stroke="white"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>

        <Text
          fontWeight={"bold"}
          textAlign="center"
          fontSize={["2xl", "2xl", "3xl"]}
          pt={6}
        >
          Payment processed!
        </Text>
        <Spinner mt={[8, 8, 12]} size={"xl"} />
        <Text w="75%" textAlign={"center"} color="gray.300" mt={[8, 8, 12]}>
          Transferring your NFT to your VerifiedInk Collection
        </Text>

      </Flex>
    );
  } else if (checkoutView === "rejected") {
    component = (
      <>
        <VStack align="center" spacing={6} pt={[8, 8, 12]}>
          <svg
            width="35"
            height="35"
            viewBox="0 0 35 35"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="17.5" cy="17.5" r="17.5" fill="#E53E3E" />
            <path
              d="M12.4648 23.4931L23.0128 12.9452M12.4648 12.9452L23.0128 23.4931"
              stroke="white"
              stroke-width="4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>

          <Text
            fontWeight={"bold"}
            textAlign="center"
            fontSize={["2xl", "2xl", "3xl"]}
          >
            Payment processing failure
          </Text>
          <Text w="75%" textAlign={"center"} color="gray.300">
            We were unable to process your payment. You can try again with
            another card or use a Crypto Wallet.
          </Text>
        </VStack>
        <Box w="100%" align="center" pt={[8, 8, 16]}>
          <Button
            alignSelf={"center"}
            colorScheme={"blue"}
            color="white"
            w="75%"
            height="50px"
            onClick={() =>
              router.push(`/card/${nft?.id}?serial_no=${serial_no}`)
            }
          >
            View Verifiedink
          </Button>
        </Box>
      </>
    );
  } else if (checkoutView === "transferred") {
    component = (
      <>
        <Flex
          direction="column"
          align="center"
          justify={"center"}
          pt={[8, 8, 12]}
        >
          <svg
            width="35"
            height="35"
            viewBox="0 0 35 35"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="17.5" cy="17.5" r="17.5" fill="#22C55E" />
            <path
              d="M11.5859 19.0981L15.1019 22.6141L23.8919 13.8242"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <Text
            fontWeight={"bold"}
            textAlign="center"
            fontSize={["2xl", "2xl", "3xl"]}
            mt={6}
          >
            NFT Transferred!
          </Text>
          <Text w="75%" textAlign={"center"} color="gray.300" mt={[4, 4, 8]}>
            Login with Email to view your collection
          </Text>

          <form onSubmit={handleLoginSubmit}>
            <Text w="75%" textAlign={"start"} color="gray.300" mt={[8, 8, 16]}>
              Email address
            </Text>
            <Input
              mt={4}
              height={["40px", "40px", "50px"]}
              bg="white"
              type="email"
              color="gray.800"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tombrady@verifiedink.us"
            />
            <Button
              type="submit"
              w="100%"
              mt={[6, 6, 8]}
              colorScheme="blue"
              color="white"
              height={["40px", "40px", "50px"]}
            >
              {magicLinkSubmitting ? <Spinner /> : "Send Login Link"}
            </Button>
          </form>
        </Flex>
      </>
    );
  } else if (checkoutView === "link-sent") {
    component = (
      <Flex
        direction="column"
        align="center"
        justify={"center"}
        pt={[8, 8, 12]}
      >
        <svg
          width="35"
          height="35"
          viewBox="0 0 35 35"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="17.5" cy="17.5" r="17.5" fill="#22C55E" />
          <path
            d="M11.5859 19.0981L15.1019 22.6141L23.8919 13.8242"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <Text
          fontWeight={"bold"}
          textAlign="center"
          fontSize={["2xl", "2xl", "3xl"]}
          mt={6}
        >
          Login Link Sent!
        </Text>
        <Text w="75%" textAlign={"center"} color="gray.300" mt={[4, 4, 8]}>
          Check your email for your login link.
        </Text>
      </Flex>
    );
  }

  return (
    <Container maxW="8xl" px={4} py={8}>
      <Flex
        direction={["column-reverse", "column-reverse", "row"]}
        justify="center"
        align={["center", "center", "flex-start"]}
        mt={10}
        w="100%"
      >
        <VStack align={"start"} pr={[0, 0, 16]}>
          {nft ? (
            <Box>
              <Text fontSize={["3xl", "3xl", "4xl"]} fontWeight="bold">
                {nft.first_name} {nft.last_name}
              </Text>
              <HStack spacing={0}>
                <Text fontSize={["md", "md", "lg"]} fontWeight={"bold"}>
                  SN: {serial_no}
                </Text>
                <Text fontSize={"lg"} color="gray">
                  /10
                </Text>
              </HStack>
              {mintId && (
                <Text
                  color={"gray"}
                  cursor={"pointer"}
                  fontSize={["sm", "sm", "sm"]}
                  mb={8}
                  onClick={() => {
                    if (process.env.NEXT_PUBLIC_SOL_ENV!.includes("ssc-dao")) {
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
            </Box>
          ) : (
            <SkeletonText w="100%" />
          )}
          <Box
            width={["275px", "300px", "400px"]}
            maxH={["100%", "100%", "700px"]}
          >
            {nft ? (
              <CardBox>
                <Card
                  nft_id={nft.id}
                  db_first_name={nft.first_name}
                  public_url={publicUrl}
                  reverse={false}
                  readOnly={true}
                  serial_no={serial_no}
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
            ) : (
              <Skeleton h="500px" w="100%" />
            )}
          </Box>
        </VStack>
        <Box display={["none", "none", "block"]}>
          <Center height={"800px"} py={8}>
            <Divider orientation={"vertical"} />
          </Center>
        </Box>
        <Divider
          orientation={"horizontal"}
          w="80%"
          my={12}
          display={["block", "block", "none"]}
        />
        <VStack align="start" pl={[0, 0, 16]}>
          <Text
            alignSelf="center"
            fontSize={["3xl", "3xl", "4xl"]}
            fontWeight="bold"
          >
            Checkout
          </Text>
          {component}
        </VStack>
      </Flex>
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { nft_id, serial_no } = context.query as any;

  const req = context.req
  const res = context.res

  const { user } = await supabase.auth.api.getUserByCookie(req);
  const cookies = new Cookies(req, res);

  cookies.set("redirect-link", "/collection", {
    maxAge: 1000 * 60 * 60,
  });

  if (nft_id) {
    let int_id = parseInt(nft_id as string);

    const { data, error } = await getNftById(int_id);

    if (!data || error) {
      return {
        props: {
          nft: null,
          serial_no: 1,
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

    if (serial_no) {
      props.serial_no = serial_no as number;
    }

    return {
      props,
    };
  } else {
    return {
      props: {
        nft: null,
        serial_no: 1,
      },
    };
  }
};

export default Checkout;
