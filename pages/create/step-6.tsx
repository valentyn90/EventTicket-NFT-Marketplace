import CreateLayout from "@/components/Create/CreateLayout";
import Card from "@/components/NftCard/Card";
import CardPlaceholder from "@/components/NftCard/CardPlaceholder";
import { useUser } from "@/utils/useUser";
import { Box, Button, Divider, Flex, Spinner, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const StepSix = () => {
  const { photoFile, nft, setNftApprovalTrue, checkPhotoFile } = useUser();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function checkPhoto() {
      await checkPhotoFile();
    }
    checkPhoto();
  }, [nft?.photo_file]);

  async function handleStepSixSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await setNftApprovalTrue();
    setSubmitting(false);
    if (res === null) {
      router.push("/create/step-7");
    } else {
      alert(res.message);
    }
  }

  return (
    <CreateLayout>
      <form onSubmit={handleStepSixSubmit}>
        <Flex direction="column">
          <Flex direction="column">
            <Text fontSize="3xl" fontWeight="bold">
              Your Verified Ink Proof
            </Text>
            <Flex direction={["column", "column", "row"]}>
              <Text
                flex="1"
                width={["100%", "100%", "75%"]}
                mt={["1rem", "1rem", 0]}
                colorScheme="gray"
              >
                That wasn’t so hard. Take a good look, ensure everything is
                right. Once you approve the proof, it’s set. We’ll kick off the
                minting process and keep you updated every step of the way.
              </Text>
              <Text
                flex="1"
                width={["100%", "100%", "75%"]}
                mt={["1rem", "1rem", 0]}
                colorScheme="gray"
              >
                If you found an issue, just go back and fix it, then come back
                to this proof page at any time.
              </Text>
            </Flex>
            <Flex
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
          </Flex>
          <Divider mt="6" mb="6" />
          <Flex justify="space-between">
            <NextLink href="/create/step-5">
              <a>
                <Button>Back</Button>
              </a>
            </NextLink>
            <Button colorScheme="blue" color="white" type="submit">
              {submitting ? <Spinner /> : "Approved!"}
            </Button>
          </Flex>
        </Flex>
      </form>
    </CreateLayout>
  );
};

export default StepSix;
