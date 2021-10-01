import CreateLayout from "@/components/Create/CreateLayout";
import PhotoPreviewSide from "@/components/Create/PhotoPreviewSide";
import VideoProofUpload from "@/components/Create/VideoProofUpload";
import userStore from "@/mobx/UserStore";
import { Button, Divider, Flex, Spinner } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";

const StepFour = () => {
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function handleStepFourSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (userStore.videoExists) {
      router.push("/create/step-5");
    } else {
      alert("Upload a video before moving on.");
    }
  }

  return (
    <CreateLayout>
      <form onSubmit={handleStepFourSubmit}>
        <Flex direction="column">
          <Flex direction={["column", "column", "row"]}>
            <PhotoPreviewSide
              title="Video Proof"
              subtitle="Upload a short clip showing off your skills. 10-20 seconds is perfect, we'll clip it if it's over 30."
              flex="1"
              nft_id={userStore.nft?.id}
              nft={userStore.loadedNft}
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
                type="submit"
                disabled={userStore.nftInput.videoUploading}
              >
                {submitting ? <Spinner /> : "Time to Sign"}
              </Button>
            </Flex>
          </Flex>
          <Divider mt="6" mb="6" />
          <Flex>
            <NextLink href="/create/step-3">
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

export default observer(StepFour);
