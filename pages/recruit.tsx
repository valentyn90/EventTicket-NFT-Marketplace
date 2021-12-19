import Card from "@/components/NftCard/Card";
import userStore from "@/mobx/UserStore";
import { supabase } from "@/supabase/supabase-client";
import { handleRecruitClick } from "@/utils/recruitShareLink";
import ShareIcon from "@/utils/svg/ShareIcon";
import {
  Box,
  Button,
  Flex,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { GetServerSideProps } from "next";
import Head from "next/head";
import React from "react";

const Recruit: React.FC = () => {
  const toast = useToast();

  async function handleClick() {
    const result = await handleRecruitClick(
      userStore.userDetails.referral_code
    );
    if (result === "Clipboard") {
      toast({
        position: "top",
        description: "Your recruiting link has been copied to your clipboard",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  }

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
              Bring <span style={{ color: "#0051CA" }}>Your</span> Team
            </Text>
            <Text w={["100%", "100%", "75%"]} colorScheme="gray" mb="4">
              Invite up to five friends. <br />
              You’ll get one of their cards.
              <br />
              And one of the cards of each person they refer. (Up to 30)
            </Text>

            <Button
              onClick={handleClick}
              colorScheme="blue"
              color="white"
              mb="4"
              flex="row"
              alignItems="center"
              width={["100%", "100%", "unset"]}
            >
              <ShareIcon marginRight={"10px"} />
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { user } = await supabase.auth.api.getUserByCookie(context.req);

  if (user) {
    return {
      redirect: {
        destination: "/create/step-8",
        permanent: false,
      },
    };
  } else {
    return {
      props: {},
    };
  }

}

export default observer(Recruit);
