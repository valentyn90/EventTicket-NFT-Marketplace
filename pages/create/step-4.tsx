import React, { useEffect, useState } from "react";
import CreateLayout from "@/components/Create/CreateLayout";
import { Flex, Button, Divider, Spinner } from "@chakra-ui/react";
import PhotoPreviewSide from "@/components/Create/PhotoPreviewSide";
import VideoProofUpload from "@/components/Create/VideoProofUpload";
import { useUser } from "@/utils/useUser";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { nftInput } from "@/mobx/NftInput";
import { observer } from "mobx-react-lite";

const StepFour = () => {
  const {
    nft,
    nftVideo,
    videoFile,
    photoFile,
    uploadVideoToSupabase,
    checkVideoFile,
  } = useUser();
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // check/get video
    async function checkVideo() {
      await checkVideoFile();
    }
    checkVideo();
  }, [nft?.clip_file]);

  async function handleStepFourSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (nftInput.localVideo) {
      setSubmitting(true);
      nftInput.setVideoUploading(true);
      const res = await uploadVideoToSupabase(nftInput.localVideo);
      nftInput.setVideoUploading(false);
      setSubmitting(false);
      if (res === null) {
        // no errors
        router.push("/create/step-5");
      } else {
        if (res.message) {
          alert(res.message);
        }
      }
      nftInput.resetLocalVideo();
    } else {
      router.push("/create/step-5");
    }
  }

  return (
    <CreateLayout>
      <form onSubmit={handleStepFourSubmit}>
        <Flex direction="column">
          <Flex direction={["column", "column", "row"]}>
            {nft && nft.id && (
              <PhotoPreviewSide
                title="Video Proof"
                subtitle="Upload a short clip showing off your skills. 10-20 seconds is perfect, we'll clip it if it's over 30."
                flex="1"
                nft_id={nft?.id}
                nft={nft}
              />
            )}
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
                disabled={nftInput.videoUploading}
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
