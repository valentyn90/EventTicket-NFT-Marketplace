import ActionPhotoUpload from "@/components/Create/ActionPhotoUpload";
import CreateLayout from "@/components/Create/CreateLayout";
import PhotoPreviewSide from "@/components/Create/PhotoPreviewSide";
import { useUser } from "@/utils/useUser";
import { Button, Divider, Flex, Spinner } from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const StepTwo = () => {
  const router = useRouter();
  const { nft, nftPhoto, photoFile, uploadPhotoToSupabase, checkPhotoFile } =
    useUser();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function checkPhoto() {
      await checkPhotoFile();
    }
    checkPhoto();
  }, [nft?.photo_file]);

  async function handleStepTwoSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (photoFile) {
      if (typeof photoFile === "object") {
        setSubmitting(true);
        const res = await uploadPhotoToSupabase();
        setSubmitting(false);
        if (res === null) {
          // no errors
          router.push("/create/step-3");
        } else {
          // errors
          if (res.message) {
            alert(res.message);
          }
        }
      } else {
        router.push("/create/step-3");
      }
    } else {
      if (nftPhoto) {
        router.push("/create/step-3");
      } else {
        alert("Upload an image.");
      }
    }
  }

  /**
   * Check if image is uploaded and cropped
   * update text if so.
   */

  return (
    <CreateLayout>
      <form onSubmit={handleStepTwoSubmit}>
        <Flex direction="column">
          {/* Top Row */}
          <Flex direction={["column", "column", "row"]}>
            {/* Left side */}
            <PhotoPreviewSide
              title="Something's Missing"
              subtitle="Your Ink needs the perfect action shot. You'll be able to change
              it later, but let's get something in there now."
              flex="1"
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
              >
                {submitting ? <Spinner /> : "Let's See It"}
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

export default StepTwo;
