import CreateLayout from "@/components/Create/CreateLayout";
import PhotoPreviewSide from "@/components/Create/PhotoPreviewSide";
import VideoProofUpload from "@/components/Create/VideoProofUpload";
import Card from "@/components/NftCard/Card";
import userStore from "@/mobx/UserStore";
import forwardMinted from "@/utils/forwardMinted";
import { Box, Button, Divider, Flex, Spinner, toast, useToast } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { NextApiRequest } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useMixpanel } from 'react-mixpanel-browser';


const StepFive = () => {
  const [submitting, setSubmitting] = useState(false);
  const [declinedVideo, setDeclinedVideo] = useState(false);
  const router = useRouter();
  const mixpanel = useMixpanel();
  const toast = useToast();


  async function handleStepFiveSubmit(e: React.FormEvent) {
    setSubmitting(true);
    mixpanel.track("NFT - Uploaded Video")
    e.preventDefault();
    if (userStore.videoExists || declinedVideo) {
      router.push("/create/step-6");
    } else {
      toast({
        position: "top",
        description: "Are you sure you don't want a video?",
        status: "error",
        duration: null,
        isClosable: true,
        onCloseComplete: () => {
          setDeclinedVideo(true);
        }
      });
      setSubmitting(false);
    }
  }

  return (
    <CreateLayout>
      <Flex direction="column">
        <Flex direction={["column", "column", "row"]}>
          <PhotoPreviewSide
            title="Your Personal Highlight"
            subtitle="Upload a short video clip showing off your skills.
              10-20 seconds is perfect, 30 seconds maximum."
            flex="1"
            nft_id={userStore.nft?.id}
            nft={null}
            // nft={userStore.loadedNft}
          />
          <Flex flex="1" direction="column">
            <VideoProofUpload />
            <Button
              display="block"
              ml="auto"
              mt="2rem"
              align="end"
              colorScheme="blue"
              color="white"
              onClick={handleStepFiveSubmit}
              disabled={userStore.nftInput.videoUploading}
              isLoading={submitting}
              w={["100%", "100%", "fit-content"]}
            >
              Next Step
            </Button>

            {/* <Box mt="2" display={["block", "block", "none"]} alignSelf="center">
              <Card
                nft_id={userStore.loadedNft?.id}
                nft_width={400}
                reverse={true}
                nft={userStore.loadedNft}
              />
            </Box> */}
          </Flex>
        </Flex>
        <Divider mt="6" mb="6" />
        <Flex>
          <NextLink href="/create/step-4">
            <a>
              <Button>Back</Button>
            </a>
          </NextLink>
        </Flex>
      </Flex>
    </CreateLayout>
  );
};

export async function getServerSideProps({ req }: { req: NextApiRequest }) {
  return await forwardMinted(req);
}

export default observer(StepFive);
