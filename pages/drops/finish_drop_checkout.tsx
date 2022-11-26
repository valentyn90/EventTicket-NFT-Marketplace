import { DividerWithText } from "@/components/ui/DividerWithText";
import { signIn, supabase } from "@/supabase/supabase-client";
import { supabase as admin } from "@/supabase/supabase-admin";
import Cookies from "cookies";
import {
  Box,
  Button,
  Heading,
  Input,
  Spinner,
  Text,
  useColorModeValue,
  VStack,
  Image,
  Divider,
  Skeleton,
  Spacer,
  Center,
  Tooltip,
  useToast
} from "@chakra-ui/react";
import { GetServerSideProps, NextApiRequest, NextApiResponse } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { FaGoogle, FaTwitter } from "react-icons/fa";
import * as ga from "@/utils/ga";
import mixpanel from 'mixpanel-browser';
import { getUserDetailsByEmail } from "@/supabase/userDetails";
import ShareButton from "@/components/Components/ShareButton";
import Card from "@/components/NftCard/Card";
import { useReward } from "react-rewards";
import Head from "next/head";
import { ShippingInformation } from "@/components/ui/ShippingInformation";
import { CheckCircleIcon } from "@chakra-ui/icons";
import StaticCard from "@/components/NftCard/StaticCard";

interface Props {
  user_id?: string;
  pending_assignment?: boolean;
  validated_tx?: boolean;
  addressInDb?: boolean;
  drop_id?: string;
  drop_data?: any;
}

const SignIn: React.FC<Props> = ({ user_id, pending_assignment, validated_tx, addressInDb, drop_id, drop_data }) => {
  const [loading, setLoading] = useState(false);
  const [emailLinkSent, setEmailLinkSent] = useState(false);
  const [email, setEmail] = useState("");

  const [addressRegistered, setAddressRegistered] = useState(false);
  const [addressValidated, setAddressValidated] = useState(false);

  const [pendingAssingment, setPendingAssignment] = useState(pending_assignment);

  const [nfts, setNfts] = useState<any[]>([]);
  const [reveal, setReveal] = useState(false);


  const router = useRouter();
  const addressRef = useRef<HTMLHRElement>(null);
  const ref = useRef(null);
  const toast = useToast();

  const { reward: confettiReward, isAnimating: isConfettiAnimating } =
    useReward('NaasReward', 'emoji', {
      zIndex: 10,
      emoji: ['🏀️', '🏅'],
      elementCount: 80,
      lifetime: 150,
    });

  useEffect(() => {
    if (router) {
      const email_router = router.query.email! as string;
      setEmail(email_router);

      const price = router.query.price! as string;
      const purchaseQuantity = router.query.quantity! as string;

      if (price && purchaseQuantity) {
        ga.event({
          action: "conversion",
          params: {
            send_to: 'AW-10929860785/fU-YCPWBps4DELHh4dso',
            value: .06 * (parseInt(purchaseQuantity) * parseInt(price)),
            currency: 'USD'
          },
        });

        mixpanel.track("Drop - Completed Transaction", { price: price, purchaseQuantity: purchaseQuantity, total_spend: (parseInt(purchaseQuantity) * parseInt(price)) });
      }
    }

  }, [router]);

  useEffect(() => {
    if (addressInDb) {
      setAddressRegistered(true);
    }

    if (pendingAssingment) {

      supabase.from(`drop_credit_card_sale:user_id=eq.${user_id}`).on("UPDATE",
        async (payload) => {
          if (payload.new.status) {
            await getNfts(user_id!);
          }
        }
      ).subscribe()
    }
    else {
      getNfts(user_id!);
    }

  }, []);

  async function getNfts(user_id: string) {
    const nfts = await supabase.from("nft_owner").select('nft_id, serial_no').match({
      owner_id: user_id,
      state: "awaiting_transfer",
    }).in('nft_id', [...drop_data.nfts, drop_data.premium_nft] );
    if (nfts.data && nfts.data.length > 0) {
      setNfts(nfts.data);
    }
  }

  useEffect(() => {
    if (router.query.needs_address && addressRef && addressRef.current) {
      addressRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }
    , [addressRef, router, nfts])

  useEffect(() => {
    if (email && pending_assignment) {
      // call out to Random Assignment API
      const fetchData = async () => {
        const res = await fetch(`/api/marketplace/randomAssignmentDrop`, {
          method: "POST",
          headers: new Headers({ "Content-Type": "application/json" }),
          credentials: "same-origin",
          body: JSON.stringify({
            email: email.toLowerCase(),
            drop_id: router.query.drop_id as string,
          }),
        });

      }
      fetchData();
    }

  }, [email]);

  async function handleSignin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/admin/send-magic-link`, {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      credentials: "same-origin",
      body: JSON.stringify({
        email,
      }),
    });

    const resj = await res.json();

    setLoading(false);
    if (resj) {
      setEmailLinkSent(true);
    }
  }


  async function handleAddressChange(e: React.FormEvent) {
    e.preventDefault();

    const data = new FormData(ref.current! as HTMLFormElement);
    const json_data = JSON.stringify(Object.fromEntries(data))

    const empty = JSON.parse(json_data)

    let validated = true
    //iterate over properies of the object
    for (const [key, value] of Object.entries(empty)) {
      if (value === "" && key !== "phone" && key !== "street_2") {
        validated = false
      }
    }
    setAddressValidated(validated)

  }

  async function handleAddress(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const data = new FormData(e.target as HTMLFormElement);

    let phone = data.get("phone")!.valueOf() as String;
    data.set("phone", phone.replace(/[^\d]/g, ""));
    data.set("state", (data.get("state")!.valueOf() as String).toUpperCase());

    const json_data = JSON.stringify(Object.fromEntries(data))

    const empty = JSON.parse(json_data)

    let validated = true
    //iterate over properies of the object
    for (const [key, value] of Object.entries(empty)) {
      if (value === "" && key !== "phone" && key !== "street_2") {
        validated = false
      }
    }
    setAddressValidated(validated)


    const res = await fetch(`/api/admin/send-address`, {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      credentials: "same-origin",
      body: json_data,
    });

    const resj = await res.json();

    if (res.ok) {
      setAddressRegistered(true);
    }
    else {
      toast({
        title: "Error Registering",
        description: resj.message,
        status: "error",
        duration: 9000,
        position: "top",
      })
      setAddressRegistered(true);
    }
    setLoading(false)
  }

  const meta = (
    <Head>
      <title>Reveal Your VerifiedInk</title>
      <meta
        property="og:title"
        key="title"
        content={`See which Editions I pulled from ${drop_data.player_name}'s VerifiedInk Drop.`}
      />
      <meta
        property="og:image"
        key="preview"
        content={`https://epfccsgtnbatrzapewjg.supabase.co/storage/v1/object/public/private/drops/${drop_id}-standard.png`}
      />
      <meta
        property="twitter:image"
        key="twitter-image"
        content={`https://verifiedink.us/api/meta/showTwitterPreview/${drop_data.nfts[0]}`}
      />
      {/* <meta property="og:video" content="https://verifiedink.us/img/naas/naas-card.mp4" />
      <meta property="og:video:type" content="video/mp4" />
      <meta property="og:video:width" content="720" />
      <meta property="og:video:height" content="720" /> */}
    </Head>
  )

  return (
    <>{meta}
      <Box
        bg={useColorModeValue("gray.50", "inherit")}
        minH="100vh"
        py={"12"}
        px={{ base: "4", lg: "8" }}
      >
        <Box maxW="lg" mx="auto" alignContent={"center"}>
          <Heading as="h1" textAlign="center" size="2xl" fontWeight="extrabold">
            Success!
          </Heading>

          <Heading as="h2" py={5} textAlign="center" size="lg">
            Your {drop_data.player_name} NFTs {nfts.length > 0 ? " are ready" : " are minting..."}
          </Heading>

          {nfts.length > 0 &&
            <Center>
              <span id="NaasReward" />
              <Button onClick={() => { setReveal(!reveal); confettiReward(); }} disabled={reveal}>Tap to Reveal</Button>
            </Center>
          }
          <Spacer p={5} />


          {nfts.length > 0 ?

            nfts.map((nft, index) => {

              return (
                <Box key={index+"a"}>

                  <Skeleton  isLoaded={reveal} speed={1.2} >
                    <Center >
                      <VStack>
                        <StaticCard nft_id={nft.nft_id} width={375} />
                        <Heading size={"md"}>{[drop_data.nfts[2], drop_data.premium_nft].includes(nft.nft_id) ? `Legendary #${nft.serial_no}` : nft.nft_id === drop_data.nfts[2] ? `Rare #${nft.serial_no}` : `Common #${nft.serial_no}`}</Heading>
                      </VStack>
                    </Center>
                  </Skeleton>
                  <Box p={2}></Box>
                </Box>
              )
            })
            :
            <>
              <Center><Spinner size="xl" /></Center>
            </>
          }

          <Divider ref={addressRef}  py={5}></Divider>

          <Heading textAlign={"center"} size={"lg"} py={3}>Get Your AR Card</Heading>
          <Center p={5}><video muted autoPlay playsInline loop src="/img/ar-card.mp4" width={300}></video></Center>

          <Text textAlign={"center"} size={"md"} pb={5}>Tell us where we should send your physical AR card. We'll get it out to you within a few days.</Text>

          {addressRegistered ?
            <Box p={8} bgColor={"green.500"} textAlign="center" borderRadius={5}>
              <Heading>Check your Mailbox!</Heading>
              <Box p={3}>
                <CheckCircleIcon boxSize="40px" />
              </Box>
              <Text>JK, we're not that fast, but your AR card is on it's way!</Text>
            </Box>
            :
            validated_tx ?
              // Is the user signed in or otherwise validated?
              <form ref={ref} onSubmit={handleAddress} onChange={handleAddressChange}>
                <ShippingInformation />
                <input hidden={true} readOnly name="email" id="email" type="text" value={email} />
                <Spacer p="6" />
                <Tooltip
                  hasArrow
                  label="Please fill out your address."
                  shouldWrapChildren
                  isDisabled={addressValidated}
                >
                  <Button type="submit" width="100%" py="6" colorScheme="blue" color="white" borderRadius={1}
                    disabled={!addressValidated}
                    isLoading={loading}
                  >Submit</Button>
                </Tooltip>
              </form> :
              <Box p={6} borderRadius={5} bgColor="red.600">
                <Text textAlign={"center"} size={"md"}>Something went wrong. Please check your email or click the blue chat button below.</Text>
              </Box>
          }


          <Divider py={5}></Divider>

          <Heading textAlign={"center"} size={"lg"} py={3}>Share this Drop with your Friends</Heading>
          <Text textAlign={"center"} size={"md"} pb={5}>Each referral that buys increases your chances to win NFTs from future VerifiedInk drops.</Text>

          <ShareButton
            share_text={`I just picked up ${drop_data.player_name}'s debut NFT. Tap in to get one.`}
            url={`https://verifiedink.us/drops/${drop_data.id}?utm_content=${email}`}
          />




          <Divider py={5}></Divider>
          <Heading as="h2" py={5} textAlign="center" size="md">
            Sign-in below to View your Collection!
          </Heading>

          <Text pt={6} textAlign="center" w={["100%", "100%", "75%"]} m="0 auto">
            VerifiedInk uses “magic links” for you to access your Collector
            Account. Just enter your email below and we’ll send you a sign in
            link.
          </Text>

          <Box mt="1" py={8}>
            <form onSubmit={handleSignin}>
              {!emailLinkSent && (
                <>
                  <Text fontWeight="bold">Email Address</Text>
                  <Input
                    value={email}
                    type="email"
                    onChange={(e) => setEmail(e.target.value)}
                    mt={1}
                    mb={8}
                    borderRadius={1}
                  />
                </>
              )}
              {!emailLinkSent ? (
                <Button
                  py={6}
                  type="submit"
                  width="100%"
                  colorScheme="blue"
                  color="white"
                  borderRadius={1}
                >
                  {loading ? <Spinner /> : "Sign in"}
                </Button>
              ) : (
                <VStack spacing={6}>
                  <Text textAlign="center" fontSize="3xl" fontWeight="bold">
                    Check your email
                  </Text>
                  <Text textAlign="center">
                    A sign in link has been sent to your email. <br />Please check your SPAM or Updates folders if you don’t see it in your Inbox.
                  </Text>
                </VStack>
              )}
            </form>
          </Box>
          
        </Box>
      </Box>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {

  const req = context.req
  const res = context.res
  const cookies = new Cookies(req, res);


  cookies.set("redirect-link", "/collection", {
    maxAge: 1000 * 60 * 60,
  });

  // const { user } = await supabase.auth.api.getUserByCookie(req);
  // if (user) {
  //   return {
  //     redirect: {
  //       destination: "/collection",
  //       permanent: false,
  //     },
  //   };
  // }


  if (context.query && context.query.email) {
    const { data: userData, error: userError } = await getUserDetailsByEmail(context.query.email as string);

    const stripe_tx = context.query.session_id

    let validated_tx = null
    let addressInDb = null

    // Check if any credit card sales are still in completed status
    if (userData) {
      const { data: validTx, error: validTxError } = await supabase.from("drop_credit_card_sale").select("*")
        .match({ "stripe_tx": stripe_tx, "user_id": userData?.user_id }).maybeSingle()

      if (validTx && validTx.id) {
        validated_tx = true
      }

      const { data: address, error: addressError } = await admin.from("contact").select("*")
        .match({ "email": userData?.email })

      if (address && address.length > 0) {
        addressInDb = true
      }

      const { data: statusOfSales, error: statusOfSalesError } =
        await supabase.from("drop_credit_card_sale").select("*")
          .match({ "status": "2_payment_completed", "user_id": userData?.user_id })

      let drop_id = validTx ? validTx.drop_id : null

      if (!drop_id) {
        drop_id = context.query.drop_id
      }

      const {data: drop_data} = await supabase.from("drop").select("*").match({"id": drop_id}).maybeSingle()

      console.log(drop_data)


      if (statusOfSales && statusOfSales.length > 0) {
        return {
          props: {
            user_id: userData.user_id,
            pending_assignment: true,
            validated_tx,
            addressInDb,
            drop_id: drop_id,
            drop_data
          }
        };
      }
      else {
        return {
          props: {
            user_id: userData.user_id,
            pending_assignment: false,
            validated_tx,
            addressInDb,
            drop_id: drop_id,
            drop_data
          }
        };
      }

    }

    return {
      props: {
        user_id: null,
        validated_tx,
        addressInDb
      }
    };
  }
  else {
    return { props: { user_id: null } };
  }

}

export default SignIn;
