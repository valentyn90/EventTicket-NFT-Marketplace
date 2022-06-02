import CreateLayout from "@/components/Create/CreateLayout";
import PhotoPreviewSide from "@/components/Create/PhotoPreviewSide";
import Card from "@/components/NftCard/Card";
import userStore from "@/mobx/UserStore";
import forwardMinted from "@/utils/forwardMinted";
import { Box, Button, Divider, Flex, Spinner, Text } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { NextApiRequest } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useRef, useState } from "react";
import SignaturePad from "react-signature-pad-wrapper";

const StepSix = () => {
  const signatureRef: any = useRef(null);

  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);

  function handleClear() {
    if (signatureRef) {
      signatureRef.current.instance.clear();
      userStore.nftInput.setLocalSignature(null);
    }
  }

  async function handleStepSixSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    if (userStore.stepSixSkip) {
      router.push("/create/step-7");
    } else {
      
      const newSigFile = await dataUrlToFile(
        signatureRef.current.toDataURL(),
        "signaturePic.png"
      );
      const res = await userStore.nft?.uploadSignatureToSupabase(newSigFile);
      
      if (res) {
        // success
        userStore.nft?.setNftCardScreenshot(userStore.nft.id, userStore.id);
        router.push("/create/step-7");
      }
      else{
        setSubmitting(false);
      }
    }
  }

  return (
    <CreateLayout>
      <form onSubmit={handleStepSixSubmit}>
        <Flex direction="column">
          <Flex direction={["column", "column", "row"]}>
            <PhotoPreviewSide
              title="Signing Time"
              subtitle="Use this space to autograph your collectible.
              We recommend using your finger or a trackpad."
              flex="1"
              nft_id={userStore.nft?.id}
              nft={userStore.loadedNft}
            />
            <Flex flex="1" direction="column" position="relative">
              {userStore.signatureExists ? (
                <>
                  <Box
                    style={{
                      position: "absolute",
                      top: "35px",
                      left: "10px",
                      fontSize: "40px",
                      transform: "rotate(45deg)",
                      cursor: "pointer",
                      zIndex: 12,
                    }}
                    onClick={() => {
                      userStore.nft?.deleteThisSignature();
                    }}
                  >
                    +
                  </Box>
                  <Text mt={["4", "4", 0]}>Your Signature</Text>
                  <Box
                    border="2px solid #E2E8F0"
                    mt="2"
                    mb="2"
                    borderRadius="5px"
                  >
                    <img src={userStore.nft?.signature} alt="" />
                  </Box>
                </>
              ) : (
                <>
                  <Text>Sign Here</Text>
                  <Box
                    cursor={["pointer", "pointer", "default"]}
                    border="2px solid #E2E8F0"
                    mt="2"
                    mb="2"
                    borderRadius="5px"
                    onTouchEnd={() => {
                      userStore.nftInput.setLocalSignature(signatureRef);
                    }}
                    onClick={() => {
                      userStore.nftInput.setLocalSignature(signatureRef);
                    }}
                  >
                    <SignaturePad
                      ref={signatureRef}
                      options={{
                        minWidth: 1.5,
                        maxWidth: 3.5,
                        penColor: "black",
                        dotSize: 3,
                      }}
                    />
                  </Box>
                  <Flex mt="2" mb="2">
                    <Button onClick={handleClear}>Clear</Button>
                  </Flex>
                </>
              )}
              <Button
                colorScheme="blue"
                color="white"
                type="submit"
                alignSelf="flex-end"
                isLoading={submitting}
                w={["100%", "fit-content"]}
                mt="2"
              >
                Last Step
              </Button>
              <Box
                display={["block", "block", "none"]}
                alignSelf="center"
              >
                <Card
                  nft_id={userStore.nft?.id}
                  nft={userStore.loadedNft}
                  nft_width={400}
                  reverse={false}
                />
              </Box>

            </Flex>
          </Flex>
          <Divider mt="6" mb="6" />
          <Flex>
            <NextLink href="/create/step-5">
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

export default observer(StepSix);

async function dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
  const res: Response = await fetch(dataUrl);
  const blob: Blob = await res.blob();
  return new File([blob], fileName, { type: "image/png" });
}
