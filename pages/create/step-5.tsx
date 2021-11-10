import CreateLayout from "@/components/Create/CreateLayout";
import PhotoPreviewSide from "@/components/Create/PhotoPreviewSide";
import VideoProofUpload from "@/components/Create/VideoProofUpload";
import userStore from "@/mobx/UserStore";
import { Button, Divider, Flex, Spinner } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";

const StepFive = () => {
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function handleStepFiveSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (userStore.videoExists) {
      router.push("/create/step-6");
    } else {
      alert("Upload a video before moving on.");
    }
  }

  return (
    <CreateLayout>
      <form onSubmit={handleStepFiveSubmit}>
        <Flex direction="column">
          <Flex direction={["column", "column", "row"]}>
            <PhotoPreviewSide
              title="Your Personal Highlight"
              subtitle="Just a couple more steps. Upload a short video clip showing off your skills.
              10-20 seconds is perfect, 30 seconds maximum."
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
            <NextLink href="/create/step-4">
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

export default observer(StepFive);
