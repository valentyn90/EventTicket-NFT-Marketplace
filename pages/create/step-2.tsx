import ActionPhotoUpload from "@/components/Create/ActionPhotoUpload";
import CreateLayout from "@/components/Create/CreateLayout";
import PhotoPreviewSide from "@/components/Create/PhotoPreviewSide";
import userStore from "@/mobx/UserStore";
import { supabase } from "@/supabase/supabase-client";
import forwardMinted from "@/utils/forwardMinted";
import { checkImageSize, resizeImageFile } from "@/utils/imageFileResizer";
import { Button, Divider, Flex, Spinner } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { NextApiRequest } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";

const StepTwo = () => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleStepTwoSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (userStore.stepTwoSkip) {
      router.push("/create/step-3");
    } else {
      setSubmitting(true);
      if (userStore.nftInput?.preview_rotation !== 0) {
        // rotate image
        let photoToUse;
        if (userStore.nftInput.localPhoto === undefined) {
          // rotating pic in db.
          if (userStore.nft?.photo) {
            // convert object url to file
            photoToUse = await fetch(userStore.nft?.photo)
              .then((r) => r.blob())
              .then(
                (blobFile) =>
                  new File([blobFile], "fileNameGoesHere", {
                    type: "image/png",
                  })
              );
          }
        } else {
          photoToUse = userStore.nftInput.localPhoto;
        }
        const { width, height }: any = await checkImageSize(photoToUse);

        const photoFileToUpload = await resizeImageFile(
          photoToUse,
          width,
          height,
          100,
          userStore.nftInput.preview_rotation
        );
        userStore.nftInput.setRotation(0);
        // @ts-ignore
        userStore.nftInput.setLocalPhoto(photoFileToUpload);
      }

      const res = await userStore.nft?.uploadPhotoToSupabase();

      setSubmitting(false);
      if (res) {
        // success
        router.push("/create/step-3");
      }
    }
  }

  return (
    <CreateLayout>
      <form onSubmit={handleStepTwoSubmit}>
        <Flex direction="column">
          {/* Top Row */}
          <Flex direction={["column", "column", "row"]}>
            {/* Left side */}
            <PhotoPreviewSide
              title="In the Action"
              subtitle="Your collectible needs the perfect action shot.
              Choose a high quality photo of just you, and we’ll take care of the rest.
              If the cropping is off, we’ll fix it during our review."
              flex="1"
              nft_id={userStore.loadedNft?.id}
              nft={userStore.loadedNft}
            />

            {/* Right side */}
            <Flex flex="1" direction="column">
              <ActionPhotoUpload />
              <Button
                display="block"
                ml="auto"
                mt="2rem"
                align="end"
                colorScheme="blue"
                color="white"
                type="submit"
                disabled={userStore.nftInput?.photoUploading}
              >
                {submitting ? <Spinner /> : "Looks Good"}
              </Button>
            </Flex>
          </Flex>
          <Divider mt="6" mb="6" />
          {/* Bottom row */}
          <Flex>
            <NextLink href="/create/step-1">
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

export default observer(StepTwo);
