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
  useToast,
  FormControl,
  FormLabel,
  HStack
} from "@chakra-ui/react";

import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { ShippingInformation } from "@/components/ui/ShippingInformation";
import { CheckCircleIcon } from "@chakra-ui/icons";



const SignIn: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const [addressRegistered, setAddressRegistered] = useState(false);
  const [addressValidated, setAddressValidated] = useState(false);

  const [bypassValidatedTx, setBypassValidatedTx] = useState(true);

  const router = useRouter();
  const addressRef = useRef<HTMLHRElement>(null);
  const ref = useRef(null);
  const giftRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  useEffect(() => {
    if (router) {

      const email_router = router.query.email! as string;
      email_router && setEmail(email_router.trim().replace(" ", "+"));
      
      const shippingOnly = router.query.shippingOnly! as string;
      if (shippingOnly) {
        setBypassValidatedTx(true)
      }
    }

  }, [router]);


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

    console.log(resj);

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
    <Box
      bg={useColorModeValue("gray.50", "inherit")}

      py={"12"}
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
          <Text textAlign={"left"} size={"md"} pb={5}>
            We've received your order, but need to know where to send your cards. Please fill out the form below and we'll ship your AR cards to you as soon as possible.
          </Text>

         
            {(addressRegistered) ?
              <Box p={8} bgColor={"green.500"} textAlign="center" borderRadius={5}>
                <Heading>Check your Mailbox!</Heading>
                <Box p={3}>
                  <CheckCircleIcon boxSize="40px" />
                </Box>

                <Text pb={4}>JK, we're not that fast, but your AR card will be on its way shortly.</Text>
              </Box>
              :
              (bypassValidatedTx)?
                // Is the user signed in or otherwise validated?
                <form ref={ref} onSubmit={handleAddress} onChange={handleAddressChange}>

                    <Heading size={"md"} py={8} textAlign="left">Email: {email}</Heading>
                    

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
      

        </Box>
      </Box>
    </Box>

  );
};



export default SignIn;
