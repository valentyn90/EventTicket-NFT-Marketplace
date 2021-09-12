import CreateLayout from "@/components/Create/CreateLayout";
import Card from "@/components/NftCard/Card";
import CardPlaceholder from "@/components/NftCard/CardPlaceholder";
import { useUser } from "@/utils/useUser";
import { Box, Button, Flex, Text, VStack } from "@chakra-ui/react";
import React, { useEffect } from "react";

const StepSeven = () => {
  const { photoFile, nft, checkPhotoFile } = useUser();

  useEffect(() => {
    async function checkPhoto() {
      await checkPhotoFile();
    }
    checkPhoto();
  }, [nft?.photo_file]);

  async function handleRecruitClick() {
    const share_link = 'https://verifiedink.us/cardview/' + nft?.id
    const ta = document.createElement("textarea");
    ta.innerText = share_link;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    alert('link has been copied to your clipboard')
  }

  return (
    <CreateLayout>
      <VStack spacing={4} alignItems="flex-start">
        <Text fontSize="3xl" fontWeight="bold">
          Your Verified Ink Proof
        </Text>

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
      </VStack>
      <Flex
        justifyContent={["center", "center", "space-between"]}
        mt={["1rem", "1rem", "5rem"]}
        direction={["column", "column", "row"]}
      >
        <Box flex="1">
          <Text textAlign="center" mb="2" fontSize="2xl">
            Front
          </Text>
          {nft?.id ? (
            <Card nft_id={nft?.id} nft_width={400} reverse={false} />
          ) : (
            <Text>Loading...</Text>
          )}
        </Box>
        <Box flex="1">
          <Text textAlign="center" mb="2" fontSize="2xl">
            Back
          </Text>
          {nft?.id ? (
            <Card nft_id={nft?.id} nft_width={400} reverse={true} />
          ) : (
            <Text>Loading...</Text>
          )}
        </Box>
      </Flex>
    </CreateLayout>
  );
};

export default StepSeven;
