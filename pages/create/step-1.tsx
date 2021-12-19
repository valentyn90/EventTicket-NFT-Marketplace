import CreateLayout from "@/components/Create/CreateLayout";
import userStore from "@/mobx/UserStore";
import { supabase } from "@/supabase/supabase-client";
import {
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import Cookies from "cookies";
import { observer } from "mobx-react-lite";
import { NextApiRequest, NextApiResponse } from "next";
import { useRouter } from "next/router";
import React, { useState } from "react";

const StepOne = () => {
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);

  async function handleStepOneSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (userStore.nft) {
      // nft exists, update values
      if (userStore.stepOneSkip) {
        // no changes, push to step 2
        router.push("/create/step-2");
      } else {
        // update NFT in db
        setSubmitting(true);
        const res = await userStore.nft.updateStepOne();
        setSubmitting(false);
        if (res) {
          // successfully updated
          router.push("/create/step-2");
        }
      }
    } else {
      // Create new NFT
      setSubmitting(true);
      const res = await userStore.createNft();
      setSubmitting(false);
      if (res) {
        // success
        router.push("/create/step-2");
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
              <Text fontSize="3xl" fontWeight="bold">
                It Starts With <span style={{ color: "blue:500" }}>You</span>
              </Text>
              <Text mt="1">
                Let's get some basic info to start creating your VerifiedInk.
              </Text>
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
              </Stack>
            </Flex>
          </Flex>
          <Divider mt="6" mb="6" />
          {/* Button row */}
          <Flex justify="space-between">
            <Button colorScheme="blue" color="white" type="submit">
              {submitting ? <Spinner /> : "Next step"}
            </Button>
          </Flex>
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
  
  if (!user) {
    cookies.set("redirect-step-1", true, {
      maxAge: 1000 * 60 * 60,
    });

    return {
      redirect: {
        destination: "/signup",
        permanent: false,
      },
    };
  }
  else {
    cookies.set("redirect-step-1", false, {
      maxAge: 1000 * 60 * 60,
    });
  }

  return {
    props: {},
  };
}

export default observer(StepOne);
