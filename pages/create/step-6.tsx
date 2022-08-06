import CreateLayout from "@/components/Create/CreateLayout";
import PhotoPreviewSide from "@/components/Create/PhotoPreviewSide";
import Card from "@/components/NftCard/Card";
import userStore from "@/mobx/UserStore";
import forwardMinted from "@/utils/forwardMinted";
import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Heading,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { NextApiRequest, NextApiResponse } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import SignaturePad from "react-signature-pad-wrapper";
import { FaGoogle, FaTwitter } from "react-icons/fa";
import cookieCutter from "cookie-cutter";
import Cookies from "cookies";
import { signIn, supabase } from "@/supabase/supabase-client";

const StepSix = () => {
  const signatureRef: any = useRef(null);

  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    // ensure the video finished processing;
    async function finish_video() {
      await userStore.nft?.getMuxAsset();
    }
    finish_video();
  }, [userStore]);

  function handleClear() {
    if (signatureRef) {
      signatureRef.current.instance.clear();
      userStore.nftInput.setLocalSignature(null);
    }
  }

  async function handleStepSixSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    if (userStore.stepSixSkip && userStore.loggedIn) {
      router.push("/create/step-7");
    } else {
      if (signatureRef.current) {
        const newSigFile = await dataUrlToFile(
          signatureRef.current.toDataURL(),
          "signaturePic.png"
        );
        const res = await userStore.nft?.uploadSignatureToSupabase(newSigFile);

        if (res) {
          // success
          userStore.nft?.setNftCardScreenshot(userStore.nft.id, userStore.id);

          if (userStore.loggedIn) {
            router.push("/create/step-7");
          } else {
            // show login buttons
            cookieCutter.set("redirect-link", "/create/step-7", { path: "/", expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365) });
            setShowSignup(true);
          }
        } else {
          setSubmitting(false);
        }
      } else {
        cookieCutter.set("redirect-link", "/create/step-7", { path: "/", expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365) });
        setShowSignup(true);
      }
    }
  }

  return !showSignup ? (
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
              <Box display={["block", "block", "none"]} pt={8} alignSelf="center">
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
  ) : (
    <Box minH="100vh" py={"12"} px={{ base: "4", lg: "8" }}>
      <Container centerContent>
        <VStack spacing={4}>

          <Heading
            fontWeight="extrabold"
            fontSize={["4xl", "4xl", "5xl"]}
            textAlign="center"
            w={["100%", "100%", "75%"]}
          >
            Create Your Account
          </Heading>
          <Box display={["block", "block", "block"]} alignSelf="center">
                <Card
                  nft_id={userStore.nft?.id}
                  nft={userStore.loadedNft}
                  nft_width={150}
                  reverse={false}
                />
          </Box>
          <Text
            fontSize="lg"
            textAlign="center"
            pt={2}
            w={["100%", "100%", "75%"]}
          >
            It looks great! Now, let's save all that hard work. Sign up with your Twitter or Google account below.
          </Text>

          <VStack spacing={8} w="90%" mt={4}>
            <Button
              py={6}
              w="100%"
              background="#1DA1F2"
              color="white"
              isLoading={loading}
              onClick={() => {
                // Set redirect to step 7 cookie here
                cookieCutter.set("redirect-link", "/create/step-7", {
                  expires: new Date(Date.now() + 1000 * 60 * 60),
                });
                setLoading(true);
                signIn({ provider: "twitter" });
              }}
            >
              <FaTwitter />
              <Text ml="2rem" fontWeight="bold">
                Sign Up with Twitter
              </Text>
            </Button>
            <Button
              py={6}
              w="100%"
              color="currentColor"
              variant="outline"
              isLoading={loading}
              onClick={() => {
                // Set redirect to step 7 cookie here
                cookieCutter.set("redirect-link", "/create/step-7", {
                  expires: new Date(Date.now() + 1000 * 60 * 60),
                });
                setLoading(true);
                signIn({ provider: "google" });
              }}
            >
              <FaGoogle />
              <Text ml="2rem" fontWeight="bold">
                Sign Up with Google
              </Text>
            </Button>
          </VStack>


        </VStack>
      </Container>
    </Box>
  );
};

export async function getServerSideProps({ req, res }: { req: NextApiRequest, res: NextApiResponse }) {
  const cookies = new Cookies(req, res);
  cookies.set("redirect-link", "/collection", {
    expires: new Date(0),
  });

  return await forwardMinted(req);
}

export default observer(StepSix);

async function dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
  const res: Response = await fetch(dataUrl);
  const blob: Blob = await res.blob();
  return new File([blob], fileName, { type: "image/png" });
}
