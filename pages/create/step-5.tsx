import CreateLayout from "@/components/Create/CreateLayout";
import PhotoPreviewSide from "@/components/Create/PhotoPreviewSide";
import Card from "@/components/NftCard/Card";
import { nftInput } from "@/mobx/NftInput";
import { useUser } from "@/utils/useUser";
import { Box, Button, Divider, Flex, Spinner, Text } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import SignaturePad from "react-signature-pad-wrapper";

const StepFive = () => {
  const {
    signatureFile,
    uploadSignatureToSupabase,
    nftSignature,
    nft,
    setSignatureFileObject,
    photoFile,
    checkSignatureFile,
    deleteSignature,
  } = useUser();
  const signatureRef: any = useRef(null);

  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // check/get signature file
    async function checkSignature() {
      await checkSignatureFile();
    }
    checkSignature();
  }, [nft?.signature_file]);

  function handleClear() {
    if (signatureRef) {
      signatureRef.current.instance.clear();
      nftInput.setLocalSignature(null);
    }
  }

  async function handleStepFiveSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (signatureFile) {
      router.push("/create/step-6");
    } else {
      if (signatureRef.current.isEmpty()) {
        alert("Draw a signature.");
      } else {
        // save to db
        setSubmitting(true);
        const newSigFile = await dataUrlToFile(
          signatureRef.current.toDataURL(),
          "signaturePic.png"
        );

        // setSignatureFileObject(newSigFile);
        const res = await uploadSignatureToSupabase(newSigFile);
        setSubmitting(false);

        if (res === null) {
          await checkSignatureFile();
          nftInput.setLocalSignature(null);
          router.push("/create/step-6");
        } else {
          alert(res.message);
        }
      }
    }
  }

  return (
    <CreateLayout>
      <form onSubmit={handleStepFiveSubmit}>
        <Flex direction="column">
          <Flex direction={["column", "column", "row"]}>
            {nft && nft.id && (
              <PhotoPreviewSide
                title="Let's get your Signature"
                subtitle="You can just sign in the space with your finger or trackpad. If you want to use a mouse, best of luck to you."
                flex="1"
                nft_id={nft?.id}
                nft={nft}
              />
            )}
            <Flex flex="1" direction="column" position="relative">
              {signatureFile ? (
                <>
                  <div
                    style={{
                      position: "absolute",
                      top: "3%",
                      left: "2%",
                      fontSize: "20px",
                      transform: "rotate(45deg)",
                      cursor: "pointer",
                      zIndex: 12,
                    }}
                    onClick={() => {
                      deleteSignature();
                    }}
                  >
                    +
                  </div>
                  <Text mt={["4", "4", 0]}>Your Signature</Text>
                  <Box
                    border="2px solid #E2E8F0"
                    mt="2"
                    mb="2"
                    borderRadius="5px"
                  >
                    <img src={signatureFile} alt="" />
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
                      nftInput.setLocalSignature(signatureRef);
                    }}
                    onClick={() => {
                      nftInput.setLocalSignature(signatureRef);
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
              <Box
                mt={["2rem !important", "2rem !important", 0]}
                mb={["2rem !important", "2rem !important", 0]}
                display={["block", "block", "none"]}
              >
                <Card nft_id={nft?.id} nft_width={400} reverse={false} />
              </Box>
              <Button
                colorScheme="blue"
                color="white"
                type="submit"
                alignSelf="flex-end"
              >
                {submitting ? <Spinner /> : "Proof Time"}
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

async function dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
  const res: Response = await fetch(dataUrl);
  const blob: Blob = await res.blob();
  return new File([blob], fileName, { type: "image/png" });
}
