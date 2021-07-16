import CardPreview from "@/components/Create/CardPreview";
import CreateLayout from "@/components/Create/CreateLayout";
import { useUser } from "@/utils/useUser";
import { VStack, Text, Button, Flex, Box } from "@chakra-ui/react";
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
    alert("recruit");
  }

  return (
    <CreateLayout>
      <VStack spacing={4} alignItems="flex-start">
        <Text fontSize="3xl" fontWeight="bold">
          Your Verified Ink Proof
        </Text>

        <Text color="gray.600">
          We’ll keep you updated on your Verified Ink Proof status. For now you
          can admire your creation. Patience is a virtue.
          <br />
          If you want some company, recruit a few teammates to Verified. You’ll
          get one of their Inks when they sign up.
        </Text>
        <Button onClick={handleRecruitClick} colorScheme="blue">
          Recruit
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
          {photoFile && <CardPreview photoFile={photoFile} nft={nft} />}
        </Box>
        <Box flex="1">
          <Text textAlign="center" mb="2" fontSize="2xl">
            Back
          </Text>
          {photoFile && <CardPreview photoFile={photoFile} nft={nft} />}
        </Box>
      </Flex>
    </CreateLayout>
  );
};

export default StepSeven;
