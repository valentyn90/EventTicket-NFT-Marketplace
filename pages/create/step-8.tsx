import CreateLayout from "@/components/Create/CreateLayout";
import Card from "@/components/NftCard/Card";
import userStore from "@/mobx/UserStore";
import { handleRecruitClick } from "@/utils/shareCard";
import { Box, Button, Flex, Text, useToast, VStack } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import React from "react";
import router from "next/router";
import ShareIcon from "@/utils/svg/ShareIcon";

const StepEight = () => {

  const toast = useToast();

  async function handleClick() {
    const result = await handleRecruitClick(userStore.nft?.id)
    if (result === "Clipboard") {
      toast({
        position: "top",
        description: "A link to your VerifiedInk has been copied to your clipboard.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  let component = (
    <>
      <Text colorScheme="gray">
        Thanks for generating your VerifiedInk collectibles.
        We’ll keep you updated on the status.
        <br />
        If you want some company, recruit a few teammates. You’ll
        get one of their VerifiedInks when they mint.
      </Text>
      <Button
        onClick={() => {
          handleClick()
        }}
        colorScheme="blue"
        color="white"
        width={["100%", "100%", "unset"]}
      >
        <ShareIcon marginRight={"10px"} />

        Share my Verified Ink
      </Button>

      <Button
        colorScheme="blue"
        color="white"
        variant="outline"
        width={["100%", "100%", "unset"]}
        onClick={() => router.push('/recruit')}
      >
        Recruit
      </Button>

    </>
  );

  return (
    <CreateLayout>
      <VStack spacing={4} alignItems="flex-start">
        <Text fontSize="3xl" fontWeight="bold">
          Your VerifiedInk Proof
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
          h={["570px", "650px", "650px"]}
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
          h={["570px", "650px", "650px"]}
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
