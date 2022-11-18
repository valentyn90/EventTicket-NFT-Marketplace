import CreateLayout from "@/components/Create/CreateLayout";
import Card from "@/components/NftCard/Card";
import userStore from "@/mobx/UserStore";
import { handleRecruitClick } from "@/utils/recruitShareLink";
import ShareIcon from "@/utils/svg/ShareIcon";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  HStack,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  width: 380px;
  height: 380px;
  position: relative;

  .minted-card-card {
    z-index: 15;
    position: absolute;
    top: 120px;
    left: 75px;
  }

  .minted-card-img-1 {
    position: absolute;
    top: 0;
    left: 0;
  }
  .minted-card-img-2 {
    position: absolute;
    top: 0;
    left: 105px;
  }
  .minted-card-img-3 {
    position: absolute;
    top: 0;
    left: 210px;
  }
  .minted-card-img-4 {
    z-index: 10;
    position: absolute;
    top: 50px;
    left: 50px;
  }
  .minted-card-img-5 {
    z-index: 10;
    position: absolute;
    top: 50px;
    left: 155px;
  }

  @media screen and (min-width: 600px) and (max-width: 48em) {
    width: 300px;
  }

  @media screen and (max-width: 600px) {
    left: -17px;
    height: 400px;
    width: 100%;

    .minted-card-card {
      z-index: 15;
      position: absolute;
      top: 120px;
      left: 65px;
    }

    .minted-card {
      width: 100px;
      height: auto;
    }

    .minted-card-img-1 {
      position: absolute;
      top: 0;
      left: 0;
    }
    .minted-card-img-2 {
      position: absolute;
      top: 0;
      left: 95px;
    }
    .minted-card-img-3 {
      position: absolute;
      top: 0;
      left: 193px;
    }
    .minted-card-img-4 {
      z-index: 10;
      position: absolute;
      top: 50px;
      left: 45px;
    }
    .minted-card-img-5 {
      z-index: 10;
      position: absolute;
      top: 50px;
      left: 145px;
    }
  }
`;

const StepEight = () => {
  const toast = useToast();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

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

  let component = (
    <>
      <Text colorScheme="gray" w={["100%", "100%", "60%"]}>
        You've made your VerifiedInk, now grow your collection by inviting friends and
        teammates to make theirs.

        <br />
        <br />
        Your referral Code: {userStore.userDetails.referral_code}
      </Text>
    </>
  );

  return (
    <CreateLayout>
      <VStack spacing={4} alignItems="flex-start">
        <Text fontSize="3xl" fontWeight="bold">
          Now, Grow <span style={{ color: "#4688F1" }}>Your</span> Team
        </Text>

        {component}
      </VStack>
      <Flex
        m={["1rem", "1rem", "2rem"]}
        direction={["column", "column", "row"]}
        align="flex-start"
        justifyContent="center"
      >
        <Box
          display={"block"}
          flex={["none", "none", "2"]}
          h={["570px", "400px", "400px"]}
          w={["none", "none", "100px"]}
        >
          <Card
            nft_id={userStore.nft?.id}
            nft={userStore.loadedNft}
            nft_width={200}
            reverse={false}
          />
        </Box>
        
      </Flex>

      <VStack px={4} alignItems="flex-start">
        <Button
          zIndex={50}
          onClick={handleClick}
          colorScheme="blue"
          color="white"
          mb="4"
          flex="row"
          alignItems="center"
          width={["100%", "100%", "unset"]}
        >
          <ShareIcon marginRight={"10px"} />
          <p>Recruit</p>
        </Button>
        <Button
          onClick={() => {
            setSubmitting(true)
            router.push(`/card/${userStore.nft?.id}`);
          }}
          isLoading={submitting}
        >
          View Your VerifiedInk
        </Button>
      </VStack>
    </CreateLayout>
  );
};

export default observer(StepEight);
