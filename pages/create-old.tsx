import Card from "@/components/NftCard/Card";
import { getReferringUserNftId } from "@/supabase/recruit";
import {
  getFileLinkFromSupabase,
  getNftById,
  supabase,
} from "@/supabase/supabase-client";
import { Box, Button, Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { GetServerSideProps, NextApiRequest } from "next";
import Head from "next/head";
import NextLink from "next/link";
import React from "react";

interface Props {
  nftId?: number | null;
  referral_code?: string | null;
  publicUrl?: string | null;
  first_name?: string | null;
}

const Create: React.FC<Props> = ({
  nftId,
  referral_code,
  publicUrl,
  first_name,
}) => {
  let referralString = referral_code ? `?referralCode=${referral_code}` : "";
  let recruitShare = referralString ? true : false;
  return (
    <Box
      bg={useColorModeValue("gray.50", "inherit")}
      // minH="100vh"
      py="12"
      px={{ base: "4", lg: "8" }}
    >
      <Head>
        <meta
          property="og:image"
          content="https://verifiedink.us/img/verified-ink-site.png"
          key="preview"
        />
        <meta
          property="og:title"
          content="Create your own custom NFT with VerifiedInk"
          key="title"
        />
      </Head>
      <Box maxWidth="1200px" mx="auto">
        <Flex direction={["column", "column", "row"]}>
          <Flex direction="column" spacing={4} align="start">
            <Text colorScheme="gray" mb="4">
              THE NFT YOU ALWAYS HAVE A STAKE IN
            </Text>
            <Text fontSize="4xl" fontWeight="bold" mb="4">
              Own <span style={{ color: "#4688F1" }}>Your</span> Image
            </Text>
            {first_name && (
              <Text w="75%" colorScheme="gray" mb="4">
                {first_name} just created their VerifiedInk and has invited you
                to join them!
              </Text>
            )}
            <Text w="75%" colorScheme="gray" mb="4">
              It takes just a few minutes to create your first digital
              collectible and own it for life. Even after you trade or sell your
              VerifiedInk, you’ll continue to receive royalties on future sales.
            </Text>
            <Text w="75%" colorScheme="gray" mb="4">
              Your career is in your hands. Your collectibles should be too.
            </Text>
            <NextLink
              href="/create/step-1" //{referralString ? `/signup${referralString}` : "/create/step-1"}
            >
              <a>
                <Button colorScheme="blue" color="white" mb="4">
                  Get Your VerifiedInk
                </Button>
              </a>
            </NextLink>
            {!referralString && (
              <Text colorScheme="gray">
                Don't have an account yet?{" "}
                <NextLink href="/create/step-1">
                  <a className="blue-link">Sign up</a>
                </NextLink>
              </Text>
            )}
          </Flex>
          <Box
            align="center"
            mt={["2rem", "2rem", 0]}
            h={["500px", "650px", "650px"]}
          >
            <Card
              nft_id={nftId || 93}
              public_url={publicUrl || undefined}
              readOnly={true}
              db_first_name={first_name || undefined}
              recruit_share={recruitShare}
            />
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { user } = await supabase.auth.api.getUserByCookie(context.req);
  const { referralCode } = context.query;

  let nftId = null;
  let referral_code = null;
  let publicUrl = null;
  let first_name = null;
  if (referralCode) {
    referral_code = referralCode;
    const userNftId = await getReferringUserNftId(referralCode as string);

    if (userNftId !== null) {
      nftId = userNftId.id;
      first_name = userNftId.first_name;
    } else {
      return {
        props: {},
      };
    }

    const { data, error } = await getNftById(nftId);
    if (error) {
      console.log("no nft found");
    }

    if (data) {
      const { publicUrl: public_url, error: error2 } =
        await getFileLinkFromSupabase(data.screenshot_file_id);

      if (public_url) {
        publicUrl = public_url;
      }
    }
  }

  if (!user || nftId !== null) {
    return {
      props: {
        nftId,
        referral_code,
        publicUrl,
        first_name,
      },
    };
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
            destination: "/create/step-7",
            permanent: false,
          },
        };
      } else if (data.finished && data.approved) {
        return {
          redirect: {
            destination: "/create/step-8",
            permanent: false,
          },
        };
      } else {
        return {
          props: {
            nftId,
            referral_code,
          },
        };
      }
    } else {
      return { props: { nftId, referral_code } };
    }
  }
};

export default observer(Create);
