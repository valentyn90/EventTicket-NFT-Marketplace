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
  Divider,
  Skeleton,
  Spacer,
  Center
} from "@chakra-ui/react";
import { GetServerSideProps, NextApiRequest, NextApiResponse } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { FaGoogle, FaTwitter } from "react-icons/fa";
import * as ga from "@/utils/ga";
import mixpanel from 'mixpanel-browser';
import { getUserDetailsByEmail } from "@/supabase/userDetails";
import ShareButton from "@/components/Components/ShareButton";
import Card from "@/components/NftCard/Card";
import { ElementaryStreamTypes } from "hls.js";
import { useReward } from "react-rewards";
import Head from "next/head";

interface Props {
  user_id?: string;
  pending_assignment?: boolean;
}

const SignIn: React.FC<Props> = ({ user_id, pending_assignment }) => {
  const [loading, setLoading] = useState(false);
  const [emailLinkSent, setEmailLinkSent] = useState(false);
  const [email, setEmail] = useState("");

  const [pendingAssingment, setPendingAssignment] = useState(pending_assignment);

  const [nfts, setNfts] = useState<any[]>([]);
  const [reveal, setReveal] = useState(false);


  const router = useRouter();

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
      state: "awaiting_transfer"
    })
    if (nfts.data && nfts.data.length > 0) {
      setNfts(nfts.data);
    }
  }


  useEffect(() => {
    if (email && pending_assignment) {
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

  const meta = (
    <Head>
        <title>Reveal Your VerifiedInk</title>
        <meta
            property="og:title"
            key="title"
            content={`See which Editions I pulled from the VerifiedInk Drop.`}
        />
        <meta
            property="og:image"
            key="preview"
            content={"https://verifiedink.us/img/naas/naas-3.png"}
        />
        <meta
            property="twitter:image"
            key="twitter-image"
            content={`https://verifiedink.us/api/meta/showTwitterPreview/1160`}
        />
        <meta property="og:video" content="https://verifiedink.us/img/naas/naas-card.mp4" />
        <meta property="og:video:type" content="video/mp4" />
        <meta property="og:video:width" content="720" />
        <meta property="og:video:height" content="720" />
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
          Your Naas NFTs {nfts.length > 0 ? " are ready" : " are minting..."}
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
              <>

                <Skeleton key={index + "d"} isLoaded={reveal} speed={1.2} >
                  <Center key={index}>
                    <VStack>
                      <Card nft_id={nft.nft_id} nft_width={375} serial_no={nft.serial_no} readOnly={true} />
                      <Heading size={"md"}>{nft.nft_id === 1160 ? `Legendary ${nft.serial_no}/15` : nft.nft_id === 1161 ? `Rare ${nft.serial_no}/40` : `Common ${nft.serial_no}/445`}</Heading>
                    </VStack>
                  </Center>
                </Skeleton>
                <Box p={2} key={index}></Box>
              </>
            )
          })
          :
          <>
            <Center><Spinner size="xl" /></Center>
          </>
        }

        <Divider py={5}></Divider>

        <Heading textAlign={"center"} size={"lg"} py={3}>Share this Drop with your Friends</Heading>
        <Text textAlign={"center"} size={"md"} pb={5}>Each referral that buys increases your chances to win NFTs from future VerifiedInk drops.</Text>

        <ShareButton
          share_text="I just picked up #1 in the class of '24 Naas Cunningham's debut NFT. Tap in to get one."
          url={`https://verifiedink.us/drops/naas?utm_content=${email}`}
        />




        <Divider py={5}></Divider>
        <Heading as="h2" py={5} textAlign="center" size="md">
          Sign-in below to access your Account!
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

            <Text color="viBlue" display="inline-block">
              Athlete Sign Up
            </Text>

          </NextLink>
        </Text>
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

  const { user } = await supabase.auth.api.getUserByCookie(req);
  if (user) {
    return {
      redirect: {
        destination: "/collection",
        permanent: false,
      },
    };
  }


  if (context.query && context.query.email) {
    const { data: userData, error: userError } = await getUserDetailsByEmail(context.query.email as string);

    // Check if any credit card sales are still in completed status
    if (userData) {
      const { data: statusOfSales, error: statusOfSalesError } =
        await supabase.from("drop_credit_card_sale").select("*")
          .match({ "status": "2_payment_completed", "user_id": userData?.user_id })

      if (statusOfSales && statusOfSales.length > 0) {
        return {
          props: {
            user_id: userData.user_id,
            pending_assignment: true,
          }
        };
      }
      else {
        return {
          props: {
            user_id: userData.user_id,
            pending_assignment: false,
          }
        };
      }

    }

    return {
      props: {
        user_id: null,
      }
    };
  }
  else {
    return { props: { user_id: null } };
  }

}

export default SignIn;
