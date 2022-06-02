import CreateLayout from "@/components/Create/CreateLayout";
import Card from "@/components/NftCard/Card";
import userStore from "@/mobx/UserStore";
import forwardMinted from "@/utils/forwardMinted";
import { Box, Button, Divider, Flex, Spinner, Text } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { NextApiRequest } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useMixpanel } from 'react-mixpanel-browser';


const StepSeven = () => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const mixpanel = useMixpanel();


  useEffect(() => {
    userStore.nft?.setNftCardScreenshot(userStore.nft.id, userStore.id);
  }, []);

  async function handleStepSixSubmit(e: React.FormEvent) {
    mixpanel.track("NFT - User Approved")
    e.preventDefault();
    setSubmitting(true);
    userStore.nft?.setNftCardScreenshot(userStore.nft.id, userStore.id);
    const res = await userStore.nft?.stepSevenSubmit();
    const res2 = await fetch(`/api/outreach/${userStore.nft?.id}?message_type=created`);
    if (res2 && res) {

      router.push("/create/step-8");
    }
    else{
      setSubmitting(false);
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
              <Button
                display={["block", "block", "none"]}
                mt="1.5rem"
                colorScheme="blue"
                color="white"
                type="submit"
                w={["100%", "fit-content"]}
                isLoading={submitting}>
                Approved!
              </Button>
            </Flex>
            <Flex
              m={["1rem", "1rem", "5rem"]}
              direction={["column", "column", "row"]}
              gridGap={["2rem", "1rem", "none"]}
              justifyContent="space-around"
            >
              <Box
                // flex={["none", "none", "1"]}
                // h={["none", "none", "650px"]}
                // w={["none", "none", "380px"]}
                alignSelf="center"
              >
                <Text  textAlign="center" mb="1" fontSize="2xl">
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
                // flex={["none", "none", "1"]}
                // h={["none", "none", "650px"]}
                // w={["none", "none", "380px"]}
                alignSelf="center"
              >
                <Text textAlign="center" mb="1" fontSize="2xl">
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
          <Button
            colorScheme="blue"
            color="white"
            type="submit"
            w={["100%", "fit-content"]}
            isLoading={submitting}>
            Approved!
          </Button>
          <Divider mt="6" mb="6" />
          <Flex justify="space-between">
            <NextLink href="/create/step-6">
              <a>
                <Button>Back</Button>
              </a>
            </NextLink>

          </Flex>
        </Flex>
      </form>
    </CreateLayout>
  );
};

export async function getServerSideProps({ req }: { req: NextApiRequest }) {
  return await forwardMinted(req);
}

export default observer(StepSeven);
