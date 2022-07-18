import { DividerWithText } from "@/components/ui/DividerWithText";
import { signIn, supabase } from "@/supabase/supabase-client";
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
  Link
} from "@chakra-ui/react";
import { NextApiRequest, NextApiResponse } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { FaGoogle, FaTwitter } from "react-icons/fa";
import * as ga from "@/utils/ga";
import mixpanel from 'mixpanel-browser';
import Card from "@/components/NftCard/Card";

interface Props { }

const FinishBid: React.FC<Props> = () => {

  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (router && router.query.price) {
      const priceInt = parseInt(router.query.price! as string);
      setPrice(priceInt);

      console.log(0.06* priceInt);

      ga.event({
        action: "conversion",
        params: {
          send_to: 'AW-10929860785/8pS0CIb7osoDELHh4dso',
          value: .06 * (priceInt) * 0.1,
          currency: 'USD'
        },
      });



      mixpanel.track("Naas - Bid Confirmed", { price: priceInt });
    }

  }, [router]);


  return (
    <Box
      bg={useColorModeValue("gray.50", "inherit")}
      minH="100vh"
      py={"12"}
      px={{ base: "4", lg: "8" }}
    >
      <VStack maxW="lg" mx="auto" alignContent={"center"} alignItems={"center"}>
        <Heading as="h1" textAlign="center" size="2xl" fontWeight="extrabold">
          Success
        </Heading>
        <Heading as="h2" p={2} textAlign="center" size="md">
          Your bid of ${price} is currently the winning bid!
        </Heading>
        <Link href="/drops/naas" alignSelf={"center"}>
          <Button onClick={() => { setLoading(true) }} isLoading={loading}>Back to the Drop</Button>
        </Link>
        <VStack pt={8}>
          <Card nft_id={763} readOnly={true} />
        </VStack>





      </VStack>
    </Box>
  );
};



export default FinishBid;
