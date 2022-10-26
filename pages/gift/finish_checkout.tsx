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
import validateEmail from "@/utils/validateEmail";

interface Props {
  propsEmail: string;
  validated_tx?: string;
  addressInDb?: string[];
  ship: boolean;
  stripe_tx?: string;
}

const SignIn: React.FC<Props> = ({ propsEmail, validated_tx, addressInDb, ship, stripe_tx }) => {
  const [loading, setLoading] = useState(false);
  const [emailLinkSent, setEmailLinkSent] = useState(false);
  const [email, setEmail] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [emailInvalid, setEmailInvalid] = useState(true);

  const [addressRegistered, setAddressRegistered] = useState(false);
  const [addressValidated, setAddressValidated] = useState(false);
  const [addressDisplay, setAddressDisplay] = useState<string[]>();

  const [nfts, setNfts] = useState<any[]>([]);
  const [reveal, setReveal] = useState(false);


  const router = useRouter();
  const addressRef = useRef<HTMLHRElement>(null);
  const ref = useRef(null);
  const giftRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  useEffect(() => {
    if (router) {
      const email_router = router.query.email! as string;
      setEmail(email_router);
      if (!email_router) {
        console.log("no email");
        setEmail(propsEmail as string)
        console.log(propsEmail)
      }

      const purchaseQuantity = router.query.quantity! as string;

      if (purchaseQuantity) {
        ga.event({
          action: "conversion",
          params: {
            send_to: 'AW-10929860785/zDSiCL3x6dMDELHh4dso',
            value: parseInt(purchaseQuantity) == 1 ? 19.99 : 59,
            currency: 'USD'
          },
        });

        mixpanel.track("AR Card - Completed Transaction", { purchaseQuantity: purchaseQuantity, total_spend: (parseInt(purchaseQuantity) == 1 ? 19.99 : 59) });
      }
    }

  }, [router]);

  useEffect(() => {
    if (recipientEmail.trim().length != recipientEmail.length) {
      setRecipientEmail(recipientEmail.trim());
      return;
    }
    const valid = validateEmail(recipientEmail);
    if (!valid) {
      setEmailInvalid(true);
    } else {
      setEmailInvalid(false);
    }
  }, [recipientEmail]);


  useEffect(() => {
    if(!ship && giftRef && giftRef.current) {
      giftRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [ship, giftRef, router])


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

  async function handleShip(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);



    const res = await fetch(`/api/marketplace/add-ship-email`, {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      credentials: "same-origin",
      body: JSON.stringify({
        email: recipientEmail,
        validated_tx: stripe_tx,
      })

    });

    if (res.ok) {
      setEmailLinkSent(true)
    }
    else {
      toast({
        title: "Error Sending",
        description: "Please try again or contact support below.",
        status: "error",
        duration: 9000,
        position: "top",
      })
    }

    setLoading(false);
  }


  return (
    <Box
      bg={useColorModeValue("gray.50", "inherit")}

      // py={"12"}
      // px={{ base: "4", lg: "8" }}
      bgImage={"linear-gradient(to bottom, rgba(0, 0, 0, 0.3),rgba(0, 0, 0, 0.3)), url('/img/basketball-court.jpg')"}
      bgSize="cover"
      bgColor={'#000'}
      align="center"
    >
      <Box p={4} backdropFilter={"blur(4px)"}>
        <Box maxW="lg" mx="auto" alignContent={"center"} pb={12}>

          <Heading textAlign={"center"} size={"lg"} py={3}>Shipping Info</Heading>
          <Center p={5}>                    <video width="300" autoPlay loop muted playsInline>
            <source
              src="https://epfccsgtnbatrzapewjg.supabase.co/storage/v1/object/public/private/videos/ar-card-safari.mp4"
              type='video/mp4; codecs="hvc1"' />
            <source
              src="https://epfccsgtnbatrzapewjg.supabase.co/storage/v1/object/public/private/videos/ar-card-vp9-chrome.webm"
              type="video/webm" />
          </video></Center>
          <Text textAlign={"center"} size={"md"} pb={5}>Tell us where we should send your physical AR card(s). We'll get it out to you within a few days.</Text>
          {!emailLinkSent && <>
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
          </>}

          {!emailLinkSent &&

            <div>
              <Divider py={5}></Divider>

              <Heading textAlign={"center"} size={"lg"} py={3}>Want to ship elsewhere?</Heading>

              <Text textAlign={"center"} size={"md"} pb={5}>If you want to gift your AR card(s) directly to your recipient, please enter their email below.
                We'll send them a link to redeem their card(s).</Text>

              <form  onSubmit={handleShip} >
                <Input
                  maxW={"400px"}
                  mb={4}
                  autoFocus
                  isDisabled={loading}
                  placeholder="Email@gmail.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  ref={giftRef}
                />

                <Button type="submit" width="50%" py="6" colorScheme="blue" color="white" borderRadius={1}
                  disabled={emailInvalid}
                  isLoading={loading}
                >Gift Directly</Button>

              </form>
            </div>
          }
          {emailLinkSent &&
            <>
              <Box my={4} p={6} bgColor={"green.500"} textAlign="center" borderRadius={5}>
                <Heading>You made someone's day!</Heading>
                <Text>
                  We sent a link to {recipientEmail} to redeem their AR card(s).
                </Text>
              </Box>

              <Text>
                Thank you for your order. If you have any questions or concerns, please contact us using the blue help button below.
              </Text>
            </>
          }

        </Box>
      </Box>
    </Box>

  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {

  const req = context.req
  const res = context.res
  const cookies = new Cookies(req, res);

  const { user } = await supabase.auth.api.getUserByCookie(req);


  if (context.query) {


    const stripe_tx = context.query.session_id

    let validated_tx = null
    let addressInDb = null


    const { data: validTx, error: validTxError } = await supabase.from("ar_credit_card_sale").select("*")
      .match({ "stripe_tx": stripe_tx }).is("shipped", null)


    validated_tx = validTx && validTx.length > 0
    // Check if any credit card sales are still in completed status

    const email = context.query.email

    const ship = context.query.ship == "false" ? false : true

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
          ship,
          stripe_tx
        }
      }
    }



    return {
      props: {
        addressInDb,
        validated_tx,
        propsEmail: null,
        ship,
        stripe_tx
      }
    };
  }
  else {
    return { props: { user_id: null } };
  }

}

export default SignIn;
