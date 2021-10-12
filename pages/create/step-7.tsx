import CreateLayout from "@/components/Create/CreateLayout";
import Card from "@/components/NftCard/Card";
import userStore from "@/mobx/UserStore";
import {
  Box,
  Button,
  Flex,
  Text,
  VStack,
  Input,
  Spinner,
} from "@chakra-ui/react";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";

const StepSeven = () => {
  const [referralCode, setReferralCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  async function handleRecruitClick() {
    const share_link = "https://verifiedink.us/card/" + userStore.nft?.id;

    const shareData = {
      title: "VerifiedInk",
      text: "Checkout my Verified Ink",
      url: share_link,
    };

    if (navigator.share === undefined) {
      const ta = document.createElement("textarea");
      ta.innerText = share_link;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      alert("link has been copied to your clipboard");
    } else {
      try {
        await navigator.share(shareData);
      }
      catch (err) {

      }
    }
  }

  let component;
  if (userStore.userDetails.referring_user_id) {
    component = (
      <>
        <Text colorScheme="gray">
          We’ll keep you updated on your Verified Ink Proof status. For now you
          can admire your creation. Patience is a virtue.
          <br />
          If you want some company, recruit a few teammates to Verified. You’ll
          get one of their Inks when they sign up.
        </Text>
        <Button onClick={handleRecruitClick} colorScheme="blue" color="white">
          Share my Verified Ink
        </Button>
      </>
    );
  } else {
    component = (
      <>
        <Text colorScheme="gray">Enter a referral code:</Text>
        <Flex>
          <Input
            placeholder="xxx"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
          />
          <Button
            ml={2}
            onClick={async () => {
              setSubmitting(true);
              const res = await userStore.userDetails.updateReferringUserId(
                referralCode
              );
              setSubmitting(false);
            }}
          >
            {submitting ? <Spinner /> : "Submit"}
          </Button>
        </Flex>
      </>
    );
  }

  return (
    <CreateLayout>
      <VStack spacing={4} alignItems="flex-start">
        <Text fontSize="3xl" fontWeight="bold">
          Your Verified Ink Proof
        </Text>

        {component}
      </VStack>
      <Flex
        mt={["1rem", "1rem", "5rem"]}
        direction={["column", "column", "row"]}
        justifyContent="center"
      >
        <Box
          flex={["none", "none", "1"]}
          h="750px"
          w={["none", "none", "380px"]}
        >
          <Text textAlign="center" mb="2" fontSize="2xl">
            Front
          </Text>
          <Card
            nft_id={userStore.nft?.id}
            nft={userStore.loadedNft}
            nft_width={400}
            reverse={false}
          />
        </Box>
        <Box
          flex={["none", "none", "1"]}
          h="750px"
          w={["none", "none", "380px"]}
        >
          <Text textAlign="center" mb="2" fontSize="2xl">
            Back
          </Text>
          <Card
            nft_id={userStore.nft?.id}
            nft={userStore.loadedNft}
            nft_width={400}
            reverse={true}
          />
        </Box>
      </Flex>
    </CreateLayout>
  );
};

export default observer(StepSeven);
