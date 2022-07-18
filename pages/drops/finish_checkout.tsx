import { Card } from "@/components/ui/Card";
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
  Image
} from "@chakra-ui/react";
import { NextApiRequest, NextApiResponse } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { FaGoogle, FaTwitter } from "react-icons/fa";
import * as ga from "@/utils/ga";
import mixpanel from 'mixpanel-browser';

interface Props { }

const SignIn: React.FC<Props> = () => {
  const [loading, setLoading] = useState(false);
  const [emailLinkSent, setEmailLinkSent] = useState(false);
  const [email, setEmail] = useState("");

  const router = useRouter();

  useEffect(() => {
    if (router) {
      const email_router = router.query.email! as string;
      console.log(email_router);
      setEmail(email_router);

      const price = router.query.price! as string;
      const purchaseQuantity = router.query.quantity! as string;

      ga.event({
        action: "conversion",
        params: {
          send_to: 'AW-10929860785/fU-YCPWBps4DELHh4dso',
          value: .06 * (parseInt(purchaseQuantity) * parseInt(price)),
          currency: 'USD'
        },
      });

      mixpanel.track("Naas - Completed Transaction", { price: price, purchaseQuantity: purchaseQuantity, total_spend: (parseInt(purchaseQuantity) * parseInt(price)) });
    }

  }, [router]);

  useEffect(() => {
    if (email) {
      // call out to Random Assignment API
      const fetchData = async () => {
        const res = await fetch(`/api/marketplace/randomAssignment`, {
          method: "POST",
          headers: new Headers({ "Content-Type": "application/json" }),
          credentials: "same-origin",
          body: JSON.stringify({
            email: email.toLowerCase(),
          }),
        });

      }
      fetchData();
    }

    // fill in email for them

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

  return (
    <Box
      bg={useColorModeValue("gray.50", "inherit")}
      minH="100vh"
      py={"12"}
      px={{ base: "4", lg: "8" }}
    >
      <Box maxW="lg" mx="auto" alignContent={"center"}>
        <Heading as="h1" textAlign="center" size="2xl" fontWeight="extrabold">
          Success
        </Heading>
        <Heading as="h2" p={2} textAlign="center" size="md">
          Sign-in below to view your Naas NFT!
        </Heading>
        <VStack>
          <Image src="/img/naas/naas-3.png" w="300px"></Image>
        </VStack>

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
        <Text pt={16} textAlign="center">
          Are you an athlete who has created or want to create your own
          VerifiedInk?{" "}
          <NextLink href="/athletes/signin">
            <a>
              <Text color="viBlue" display="inline-block">
                Athlete Sign Up
              </Text>
            </a>
          </NextLink>
        </Text>
      </Box>
    </Box>
  );
};

export async function getServerSideProps({
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}) {
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
  return { props: {} };
}

export default SignIn;
