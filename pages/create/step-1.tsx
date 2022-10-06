import CreateLayout from "@/components/Create/CreateLayout";
import PhotoPreviewSide from "@/components/Create/PhotoPreviewSide";
import Card from "@/components/NftCard/Card";
import userStore from "@/mobx/UserStore";
import { supabase } from "@/supabase/supabase-client";
import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Spinner,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import Cookies from "cookies";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import { NextApiRequest, NextApiResponse } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useMixpanel } from "react-mixpanel-browser";
import cookieCutter from "cookie-cutter";

const StepOne = () => {
  const router = useRouter();
  const mixpanel = useMixpanel();
  const toast = useToast();

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if(router.query.marathon){
      console.log("marathon");
      mixpanel.track("Marathon Start NFT");
      cookieCutter.set("marathon", "true", { path: "/", expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365) });

    }
  }, [router]);

  async function handleStepOneSubmit(e: React.FormEvent) {
    e.preventDefault();
    mixpanel.track("NFT - Started");

    if (
      !userStore.nftInput.first_name ||
      !userStore.nftInput.last_name ||
      !userStore.nftInput.graduation_year
    ) {
      toast({
        position: "top",
        status: "error",
        description: "You are missing some inputs.",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (userStore.nft) {
      // nft exists, update values
      if (userStore.stepOneSkip) {
        // no changes, push to step 2
        setSubmitting(true);
        router.push("/create/step-2");
      } else {
        // update NFT in db
        setSubmitting(true);
        const res = await userStore.nft.updateStepOne();
        if (res) {
          // successfully updated
          router.push("/create/step-2");
        } else {
          setSubmitting(false);
        }
      }
    } else {
      // Create new NFT
      setSubmitting(true);
      const res = await userStore.createNft();
      if (res) {
        // success
        router.push("/create/step-2");
      } else {
        setSubmitting(false);
      }
    }
  }

  async function handleDeleteNft() {
    if (userStore.nft) {
      if (confirm("Are you sure you want to delete your NFT?")) {
        const res = await userStore.nft.deleteThisNft();

        if (res) {
          alert("Successfully deleted NFT.");
        } else {
          alert("There was an error deleting your NFT.");
        }
      }
    } else {
      alert("No NFT to delete.");
    }
  }

  function paddedDigit(num: string) {
    if (num.length === 1) return `0${num}`;
    if (num.length === 2) return num;
    if (num.length === 0) return `00`;
    if (num.length > 2) return `${num[num.length - 2]}${num[num.length - 1]}`;
  }

  return (
    <CreateLayout>
      <form onSubmit={handleStepOneSubmit}>
        <Flex direction="column">
          {/* Top row */}
          <Flex direction={["column", "column", "row"]}>
            {/* Text */}
            <Flex direction="column" flex="1">
              <PhotoPreviewSide
                title="It Starts With You"
                subtitle="Let's get some basic info to start creating your VerifiedInk."
                flex="1"
                nft_id={userStore.loadedNft?.id}
                nft={userStore.loadedNft}
                emptyCard={userStore.loadedNft ? false : true}
              />
            </Flex>
            <Flex
              justify={["flex-start", "flex-start", "center"]}
              flex="1"
              mt={["4", "4", 0]}
            >
              <Stack spacing="4">
                <FormControl id="firstName">
                  <FormLabel>First name</FormLabel>
                  <Input
                    type="text"
                    placeholder="Bobby"
                    value={userStore.nftInput?.first_name || ""}
                    onChange={(e) =>
                      userStore.nftInput?.setInputValue(
                        "first_name",
                        e.target.value
                      )
                    }
                  />
                </FormControl>
                <FormControl id="lastName">
                  <FormLabel>Last name</FormLabel>
                  <Input
                    type="text"
                    placeholder="Boucher"
                    value={userStore.nftInput?.last_name || ""}
                    onChange={(e) =>
                      userStore.nftInput?.setInputValue(
                        "last_name",
                        e.target.value
                      )
                    }
                  />
                </FormControl>
                <FormControl id="graduationYear">
                  <FormLabel>Graduation Year</FormLabel>
                  <Input
                    type="text"
                    placeholder="22"
                    value={paddedDigit(
                      String(userStore.nftInput?.graduation_year)
                    )}
                    onChange={(e) => {
                      userStore.nftInput?.setInputValue(
                        "graduation_year",
                        e.target.value
                      );
                    }}
                  />
                </FormControl>
                <FormControl id="twitter">
                  <FormLabel>Twitter (Optional)</FormLabel>
                  <Input
                    type="text"
                    // disabled={!userStore.loggedIn}
                    value={userStore.nftInput?.twitter || ""}
                    onChange={(e) =>
                      userStore.nftInput?.setInputValue(
                        "twitter",
                        e.target.value
                      )
                    }
                  />
                </FormControl>
              </Stack>
            </Flex>
          </Flex>
          <Divider mt="6" mb="6" />
          {/* Button row */}
          <Flex justify="end">
            <Button
              isLoading={submitting}
              colorScheme="blue"
              color="white"
              type="submit"
              w={["100%", "fit-content"]}
            >
              Next Step
            </Button>
          </Flex>
          <Box display={["block", "block", "none"]} pt={8} alignSelf="center">
            <Card
              nft_id={userStore.loadedNft?.id}
              nft_width={375}
              reverse={false}
            />
          </Box>
        </Flex>
      </form>
    </CreateLayout>
  );
};

export async function getServerSideProps({
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}) {
  const { user } = await supabase.auth.api.getUserByCookie(req);
  const cookies = new Cookies(req, res);

  if (user) {
    const nft = await supabase
      .from("nft")
      .select("minted")
      .eq("user_id", user.id)
      .single();
    if (nft.data && nft.data.minted) {
      return {
        redirect: {
          destination: "/create/step-8",
          permanent: false,
        },
      };
    }
  }

  return {
    props: {},
  };
}

export default observer(StepOne);
