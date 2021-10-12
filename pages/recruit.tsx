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
import Card from "@/components/NftCard/Card";
import { observer } from "mobx-react-lite";
import userStore from "@/mobx/UserStore";

async function handleRecruitClick() {
  const share_link = `${process.env.NEXT_PUBLIC_FRONTEND_URL
    }/signup?referralCode=${userStore.userDetails.referral_code || "xxx"}`;

  const shareData = {
    title: "VerifiedInk",
    text: "Create your own Verified Ink",
    url: share_link,
  };

  if (navigator.share === undefined) {
    const ta = document.createElement("textarea");
    ta.innerText = share_link;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    alert("Your recruiting link has been copied to your clipboard");
  } else {
    try {
      await navigator.share(shareData);
    }
    catch (err) {

    }
  }

}

const Recruit: React.FC = () => {
  return (
    <Box
      bg={useColorModeValue("gray.50", "inherit")}
      minH="100vh"
      py="12"
      px={{ base: "4", lg: "8" }}
    >
      <Head>
        <meta
          property="og:image"
          content="https://verifiedink.us/img/verified-ink-site.png"
        />
        <meta
          property="og:title"
          content="Create your own custom NFT with Verified Ink"
        />
      </Head>
      <Box maxWidth="1200px" mx="auto">
        <Flex direction={["column", "column", "row"]}>
          <Flex direction="column" spacing={4} flex="1" align="start">
            <Text color="gray.500" mb="4" fontWeight="bold">
              RECRUIT
            </Text>
            <Text fontSize="4xl" fontWeight="bold" mb="4">
              Bring <span style={{ color: "#0051CA" }}>your</span> team
            </Text>
            <Text w="75%" colorScheme="gray" mb="4">
              Invite up to five friends to create their own Verified Ink. You
              will receive one card of each referral and one card of each of
              their referrals (up to 25 total).
            </Text>

            <Button
              onClick={handleRecruitClick}
              colorScheme="blue"
              color="white"
              mb="4"
              flex="row"
              alignItems="center"
              width={["100%", "100%", "unset"]}
            >
              <svg
                style={{ marginRight: "10px" }}
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15 8.25C14.5858 8.25 14.25 8.58579 14.25 9V15C14.25 15.1989 14.171 15.3897 14.0303 15.5303C13.8897 15.671 13.6989 15.75 13.5 15.75H4.5C4.30109 15.75 4.11032 15.671 3.96967 15.5303C3.82902 15.3897 3.75 15.1989 3.75 15V9C3.75 8.58579 3.41421 8.25 3 8.25C2.58579 8.25 2.25 8.58579 2.25 9V15C2.25 15.5967 2.48705 16.169 2.90901 16.591C3.33097 17.0129 3.90326 17.25 4.5 17.25H13.5C14.0967 17.25 14.669 17.0129 15.091 16.591C15.5129 16.169 15.75 15.5967 15.75 15V9C15.75 8.58579 15.4142 8.25 15 8.25Z"
                  fill="white"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M9.53033 0.96967C9.23744 0.676777 8.76256 0.676777 8.46967 0.96967L5.46967 3.96967C5.17678 4.26256 5.17678 4.73744 5.46967 5.03033C5.76256 5.32322 6.23744 5.32322 6.53033 5.03033L9 2.56066L11.4697 5.03033C11.7626 5.32322 12.2374 5.32322 12.5303 5.03033C12.8232 4.73744 12.8232 4.26256 12.5303 3.96967L9.53033 0.96967Z"
                  fill="white"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M9 0.75C8.58579 0.75 8.25 1.08579 8.25 1.5V11.25C8.25 11.6642 8.58579 12 9 12C9.41421 12 9.75 11.6642 9.75 11.25V1.5C9.75 1.08579 9.41421 0.75 9 0.75Z"
                  fill="white"
                />
              </svg>
              <p>Share</p>
            </Button>
            <Text colorScheme="gray">
              Your referral code: {userStore.userDetails.referral_code}
            </Text>
          </Flex>
          <Box flex="1" align="center" mt={["2rem", "2rem", 0]}>
            {userStore.loaded && (
              <Card
                nft_id={userStore.nft?.id}
                nft={userStore.nft}
                readOnly={true}
              />
            )}
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};

export default observer(Recruit);
