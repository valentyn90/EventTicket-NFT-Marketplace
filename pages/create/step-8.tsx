import CreateLayout from "@/components/Create/CreateLayout";
import Card from "@/components/NftCard/Card";
import userStore from "@/mobx/UserStore";
import { handleRecruitClick } from "@/utils/shareCard";
import { Box, Button, Flex, Text, VStack } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import React from "react";

const StepEight = () => {
  let component = (
    <>
      <Text colorScheme="gray">
        We’ll keep you updated on your Verified Ink Proof status. For now you
        can admire your creation. Patience is a virtue.
        <br />
        If you want some company, recruit a few teammates to Verified. You’ll
        get one of their Inks when they sign up.
      </Text>
      <Button
        onClick={() => handleRecruitClick(userStore.nft?.id)}
        colorScheme="blue"
        color="white"
      >
        Share my Verified Ink
      </Button>
    </>
  );

  return (
    <CreateLayout>
      <VStack spacing={4} alignItems="flex-start">
        <Text fontSize="3xl" fontWeight="bold">
          Your Verified Ink Proof
        </Text>

        {component}
      </VStack>
      <Flex
        m={["1rem", "1rem", "5rem"]}
        direction={["column", "column", "row"]}
        justifyContent="center"
      >
        <Box
          flex={["none", "none", "1"]}
          h={["570px","650px","650px"]}
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
          h={["570px","650px","650px"]}
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

export default observer(StepEight);
