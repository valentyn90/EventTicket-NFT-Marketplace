import { supabase } from "@/utils/supabase-client";
import {
  Box,
  Button,
  Flex,
  Image,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { NextApiRequest } from "next";
import NextLink from "next/link";
import Head from "next/head";
import React from "react";
import CardPlaceholder from "@/components/NftCard/CardPlaceholder";

const Create: React.FC = () => {
  return (
    <Box
      bg={useColorModeValue("gray.50", "inherit")}
      minH="100vh"
      py="12"
      px={{ base: "4", lg: "8" }}
    >
      <Head>
        <meta property="og:image" content="https://verifiedink.us/img/verified-ink-site.png" />
        <meta property="og:title" content="Create your own custom NFT with Verified Ink" />
      </Head>
      <Box maxWidth="1200px" mx="auto">
        <Flex direction={["column", "column", "row"]}>
          <Flex direction="column" spacing={4} flex="1" align="start">
            <Text colorScheme="gray" mb="4">
              GET VERIFIED
            </Text>
            <Text fontSize="4xl" fontWeight="bold" mb="4">
              Own <span style={{ color: "#0051CA" }}>your</span> image
            </Text>
            <Text w="75%" colorScheme="gray" mb="4">
              Take a few minutes to create your Verified Ink and own it for
              life. Even after you trade or sell your Verified Ink, you'll
              continue to receive royalties on all future profits.
            </Text>
            <NextLink href="/create/step-1">
              <a>
                <Button colorScheme="blue" color="white" mb="4">
                  Get Your Verified Ink
                </Button>
              </a>
            </NextLink>
            <Text colorScheme="gray">
              Don't have an account yet?{" "}
              <NextLink href="/signup">
                <a className="blue-link">Sign up</a>
              </NextLink>
            </Text>
          </Flex>
          <Box flex="1" align="center" mt={["2rem", "2rem", 0]}>
            <CardPlaceholder />
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};

export async function getServerSideProps({ req }: { req: NextApiRequest }) {
  const { user } = await supabase.auth.api.getUserByCookie(req);

  if (!user) {
    return { props: {} };
  } else {
    // check if NFT form is finished or approved.
    const user_id = user.id;
    const { data, error } = await supabase
      .from("nft")
      .select("*")
      .eq("user_id", user_id)
      .single();
    if (data) {
      if (data.finished && !data.approved) {
        return {
          redirect: {
            destination: "/create/step-6",
            permanent: false,
          },
        };
      } else if (data.finished && data.approved) {
        return {
          redirect: {
            destination: "/create/step-7",
            permanent: false,
          },
        };
      } else {
        return { props: {} };
      }
    } else {
      return { props: {} };
    }
  }
}

export default Create;
