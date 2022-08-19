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
import { ElementaryStreamTypes } from "hls.js";
import { useReward } from "react-rewards";
import Head from "next/head";
import { ShippingInformation } from "@/components/ui/ShippingInformation";
import { EMPTY_OBJECT } from "mobx/dist/internal";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { is } from "cheerio/lib/api/traversing";

interface Props {
  propsEmail: string;
  validated_tx?: string;
  addressInDb?: string[];
  fc_id?: string;
  order_id?: string;
  order?: any;
  fc?: any;
  team?: any;
}

const SignIn: React.FC<Props> = ({ propsEmail, validated_tx, addressInDb, fc_id, order, fc, team }) => {
  const [loading, setLoading] = useState(false);
  const [emailLinkSent, setEmailLinkSent] = useState(false);
  const [email, setEmail] = useState("");

  const [addressRegistered, setAddressRegistered] = useState(false);
  const [addressValidated, setAddressValidated] = useState(false);
  const [addressDisplay, setAddressDisplay] = useState<string[]>();

  const [nfts, setNfts] = useState<any[]>([]);
  const [reveal, setReveal] = useState(false);

  const selectedColor = "#525AB2"


  const router = useRouter();
  const addressRef = useRef<HTMLHRElement>(null);
  const ref = useRef(null);
  const toast = useToast();



  const { reward: confettiReward, isAnimating: isConfettiAnimating } =
    useReward('RevealReward', 'emoji', {
      zIndex: 10,
      emoji: ['🏀️', '🏅'],
      elementCount: 80,
      lifetime: 150,
    });

  useEffect(() => {
    if (router) {
      const email_router = router.query.email! as string;
      setEmail(email_router);
      if (!email_router) {
        console.log("no email");
        setEmail(propsEmail as string)
        console.log(propsEmail)
      }

      const purchaseQuantity = order.quantity;
      const price = order.price;
      const team_id = order.team_id;

      if (purchaseQuantity) {
        // ga.event({
        //   action: "conversion",
        //   params: {
        //     send_to: 'AW-10929860785/zDSiCL3x6dMDELHh4dso',
        //     value: parseInt(purchaseQuantity) == 1 ? 19.99 : 59,
        //     currency: 'USD'
        //   },
        // });

        mixpanel.track("Fan Challenge - Completed Transaction", {
          price: price,
          quantity: purchaseQuantity,
          total_spend: purchaseQuantity * price,
          team_id: team_id,
          fc_id: fc_id,
        });
      }
    }

  }, [router]);


  useEffect(() => {
    if (order) {
      getNfts(order.id)
    }
  }, [order])

  async function getNfts(order_id: string) {
    const nfts = await supabase.from("fan_challenge_nfts").select('nft_id, opened, team_id').match({
      order_id: order_id
    })
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

    setAddressDisplay([empty.name, `${empty.street_1} ${empty.street_2}`, `${empty.city}, ${empty.state} ${empty.zip}`])

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
      setAddressRegistered(false);
    }
    setLoading(false)
  }


  return (
    <>
      <Box
        position={"fixed"}
        zIndex={-1}
        background={`radial-gradient(
500px 500px at top left, ${selectedColor}90, ${selectedColor}05 ), url('/img/challengeBgNew.png')`}
        backgroundRepeat="no-repeat"
        backgroundColor={"blueBlack"}
        h="100vh"
        width="100vw"
      ></Box>
      <Spacer h="56px" />
      <Box alignContent="center" mx="auto" maxW="lg">
        <Box maxW="lg" alignContent={"center"} pb={12} mx="4">
          <Heading as="h1" textAlign="center" size="2xl" fontWeight="extrabold">
            Success!
          </Heading>

          <Heading as="h2" py={5} textAlign="center" size="lg">
            Your Collectibles {nfts.length > 0 ? " are ready" : " are minting..."}
          </Heading>

          {nfts.length > 0 &&
            <Center>
              <span id="RevealReward" />
              <Button onClick={() => { setReveal(!reveal); confettiReward(); }} disabled={reveal}>Tap to Reveal</Button>
            </Center>
          }

          <Spacer p={5} />


          {nfts.length > 0 ?

            nfts.map((nft, index) => {

              return (
                <Box key={index + "dp"} >

                  <Skeleton isLoaded={reveal} speed={1.2} >
                    <Center >
                      <VStack>
                        <Card nft_id={nft.nft_id} nft_width={375} readOnly={true} />
                        <Heading size={"md"}>
                          {parseInt(nft.nft_id) === parseInt(fc.nfts[2].nft_id) ? `Legendary` : parseInt(nft.nft_id) === parseInt(fc.nfts[1].nft_id) ? `Rare` : `Common`}</Heading>
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

          <Heading textAlign={"center"} size={"lg"} py={3}>Get Your AR Card</Heading>
          <Center p={5}>                    <video width="300" autoPlay loop muted playsInline>
            <source
              src="https://epfccsgtnbatrzapewjg.supabase.co/storage/v1/object/public/private/videos/ar-card-safari.mp4"
              type='video/mp4; codecs="hvc1"' />
            <source
              src="https://epfccsgtnbatrzapewjg.supabase.co/storage/v1/object/public/private/videos/ar-card-vp9-chrome.webm"
              type="video/webm" />
          </video></Center>

          <Text textAlign={"center"} size={"md"} pb={5}>Tell us where we should send your physical AR card. We'll get it out to you within a few days.</Text>

          {(addressInDb || addressRegistered) ?
            <Box p={8} bgColor={"green.500"} textAlign="center" borderRadius={5}>
              <Heading>Check your Mailbox!</Heading>
              <Box p={3}>
                <CheckCircleIcon boxSize="40px" />
              </Box>
              <Text pb={4}>JK, we're not that fast, but your AR card is on it's way to:</Text>
              {addressInDb && <>
                <Text>{addressInDb[0]}</Text>
                <Text>{addressInDb[1]}</Text>
                <Text>{addressInDb[2]}</Text>
              </>}
              {!addressInDb && <>


              </>}

              <Text pt={4} fontStyle="italic" opacity={"50%"}>If this address is incorrect, please contact us using the blue help button below.</Text>
            </Box>
            :
            validated_tx ?
              // Is the user signed in or otherwise validated?
              <Box backdropFilter="blur(10px)">
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
                </form>
              </Box>
              :
              <Box p={6} borderRadius={5} bgColor="red.600">
                <Text textAlign={"center"} size={"md"}>Something went wrong. Please check your email or click the blue chat button below.</Text>
              </Box>
          }


          <Divider py={5}></Divider>

          <Heading textAlign={"center"} size={"lg"} py={3}>Share VerifiedInk with Fellow {team.school} Fans</Heading>
          <Text textAlign={"center"} size={"md"} pb={5}>The more {team.school} fans that support {fc.name}, the better chance he's in a {team.school} jersey next year.</Text>

          <ShareButton
            share_text={`Support ${fc.name} and ${team.school} ${fc.sport}. I just grabbed ${order.quantity > 1 ? order.quantity : "a"} risk free collectible${order.quantity > 1 ? "s" : ""}.`}
            url={`https://verifiedink.us/challenge/${fc_id}?utm_content=${email}&team_id=${order.team_id}`}
          />
        </Box>
      </Box>
    </>

  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {

  const req = context.req
  const res = context.res
  const cookies = new Cookies(req, res);

  if (context.query) {


    const { email, order_id, fc_id } = context.query

    let validated_tx = null
    let addressInDb = null


    const { data: validTx, error: validTxError } = await supabase.from("fan_challenge_orders").select("*")
      .match({ "id": order_id })

    validated_tx = validTx && validTx.length > 0

    const { data: fc } = await supabase.from("fan_challenge").select("*")
      .match({ "id": fc_id }).maybeSingle()

    const { data: team } = await supabase.from("school").select("*")
      .match({ "id": validTx![0].team_id }).maybeSingle()


    // Check if any credit card sales are still in completed status
    if (email) {
      const { data: address, error: addressError } = await admin.from("contact").select("*")
        .match({ "email": email })

      if (address && address.length > 0) {
        addressInDb = [address[0].name, `${address[0].street_1} ${address[0].street_2}`, `${address[0].city}, ${address[0].state} ${address[0].zip}`]
      }

      return {
        props: {
          addressInDb,
          validated_tx,
          propsEmail: email,
          fc_id,
          order_id,
          order: validTx![0],
          fc: fc,
          team: team
        }
      }

    }

    return {
      props: {
        addressInDb,
        validated_tx,
        fc_id,
        order_id,
        order: validTx![0],
        fc: fc
      }
    };
  }
  else {
    return { props: { user_id: null } };
  }

}

export default SignIn;
