import CreateLayout from "@/components/Create/CreateLayout";
import Card from "@/components/NftCard/Card";
import userStore from "@/mobx/UserStore";
import { Box, Button, Divider, Flex, Spinner, Text } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";

const StepSeven = () => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleStepSixSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    userStore.nft?.setNftCardScreenshot(userStore.nft.id, userStore.id);
    const res = await userStore.nft?.stepSevenSubmit();
    const res2 = await fetch(`/api/outreach/${userStore.nft?.id}?message_type=created`);
    setSubmitting(false);
    if (res2 && res) {
      
      router.push("/create/step-8");
    }
  }

  return (
    <CreateLayout>
      <form onSubmit={handleStepSixSubmit}>
        <Flex direction="column">
          <Flex direction="column">
            <Text fontSize="3xl" fontWeight="bold">
              Your VerifiedInk Proof
            </Text>
            <Flex direction={["column", "column", "row"]}>
              <Text
                flex="1"
                width={["100%", "100%", "75%"]}
                mt={["1rem", "1rem", 0]}
                colorScheme="gray"
              >
                Take a look that everything is how you want it.
                If you see any issues, you can go back and fix them.
                Once it's approved, we will start the minting process.
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
          </Flex>
          <Divider mt="6" mb="6" />
          <Flex justify="space-between">
            <NextLink href="/create/step-6">
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

export default observer(StepSeven);
