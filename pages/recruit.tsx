import Card from "@/components/NftCard/Card";
import userStore from "@/mobx/UserStore";
import ShareIcon from "@/utils/svg/ShareIcon";
import { Box, Button, Flex, Text, useColorModeValue, useToast } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import Head from "next/head";
import React from "react";

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
    return "Clipboard"
  } else {
    try {
      await navigator.share(shareData);
    } catch (err) { }
  }
}

const Recruit: React.FC = () => {
  const toast = useToast();

  async function handleClick() {
    const result = await handleRecruitClick()
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
            <Text w={["100%","100%","75%"]} colorScheme="gray" mb="4">
              Invite up to five friends. <br />
              You’ll get one of their cards.<br />
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

export default observer(Recruit);
