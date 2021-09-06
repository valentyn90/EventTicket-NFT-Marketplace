import CreateLayout from "@/components/Create/CreateLayout";
import { nftInput } from "@/mobx/NftInput";
import { supabase } from "@/utils/supabase-client";
import { useUser } from "@/utils/useUser";
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
import { observer } from "mobx-react-lite";
import { NextApiRequest } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const StepOne = () => {
  const router = useRouter();

  const { nft, setNftObject, createNft, updateNft, deleteNft } = useUser();

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (nft) {
      if (nft.first_name) {
        nftInput.setInputValue("firstName", nft.first_name);
      }
      if (nft.last_name) {
        nftInput.setInputValue("lastName", nft.last_name);
      }
      if (nft.graduation_year) {
        nftInput.setInputValue("gradName", nft.graduation_year);
      }
    }
  }, []);

  async function handleStepOneSubmit(e: React.FormEvent) {
    e.preventDefault();

    /**
     * Check if there is an existing NFT
     * If there is
     * And values are the same as the input
     * Then push to step-2 without DB create
     *
     * Else create nft if none, or update if so
     */
    if (nft) {
      if (
        nft.first_name === nftInput.firstName &&
        nft.last_name === nftInput.lastName &&
        nft.graduation_year === nftInput.gradYear
      ) {
        // No changes, go to step 2 with no request
        router.push("/create/step-2");
      } else {
        // Changes, update and then go to step 2.
        try {
          setSubmitting(true);
          const res: any = await updateNft({
            firstName: nftInput.firstName,
            lastName: nftInput.lastName,
            gradYear: nftInput.gradYear,
            nft_id: nft?.id,
          });
          setSubmitting(false);
          if (res.error) {
            console.log(res.error);
            alert(res.error.message);
          } else {
            setNftObject(res.data[0]);
            router.push("/create/step-2");
          }
        } catch (err) {
          console.log(err);
          alert(err.message);
        }
      }
    } else {
      // Create new NFT
      try {
        setSubmitting(true);
        const res: any = await createNft({
          firstName: nftInput.firstName,
          lastName: nftInput.lastName,
          gradYear: nftInput.gradYear,
        });
        setSubmitting(false);
        if (res.error) {
          alert(res.error.message);
        } else {
          setNftObject(res.data[0]);
          router.push("/create/step-2");
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  async function handleDeleteNft() {
    if (nft) {
      if (confirm("Are you sure you want to delete your NFT?")) {
        const { error } = await deleteNft(nft.id);
        if (error) {
          alert("There was an error deleting your NFT.");
        } else {
          setNftObject(null);
          nftInput.resetValues();
          alert("Successfully deleted NFT.");
        }
      }
    } else {
      alert("No NFT to delete.");
    }
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
                It Starts With <span style={{ color: "#3182ce" }}>You</span>
              </Text>
              <Text mt="1">
                Let's get some basic info to start filling out your Verified
                Ink.
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
                    value={nftInput.firstName}
                    onChange={(e) =>
                      nftInput.setInputValue("firstName", e.target.value)
                    }
                  />
                </FormControl>
                <FormControl id="lastName">
                  <FormLabel>Last name</FormLabel>
                  <Input
                    type="text"
                    placeholder="Boucher"
                    value={nftInput.lastName}
                    onChange={(e) =>
                      nftInput.setInputValue("lastName", e.target.value)
                    }
                  />
                </FormControl>
                <FormControl id="graduationYear">
                  <FormLabel>Graduation Year</FormLabel>
                  <Input
                    type="text"
                    placeholder="`22"
                    value={
                      nftInput.gradYear !== undefined ? nftInput.gradYear : ""
                    }
                    onChange={(e) =>
                      nftInput.setInputValue("gradYear", e.target.value)
                    }
                  />
                </FormControl>
              </Stack>
            </Flex>
          </Flex>
          <Divider mt="6" mb="6" />
          {/* Button row */}
          <Flex justify="space-between">
            <Button
              colorScheme="red"
              variant="outline"
              onClick={handleDeleteNft}
            >
              Delete Existing NFT
            </Button>
            <Button colorScheme="blue" color="white" type="submit">
              {submitting ? <Spinner /> : "Next step"}
            </Button>
          </Flex>
        </Flex>
      </form>
    </CreateLayout>
  );
};

export async function getServerSideProps({ req }: { req: NextApiRequest }) {
  const { user } = await supabase.auth.api.getUserByCookie(req);
  if (!user) {
    return {
      redirect: {
        destination: "/signin?notLoggedIn=true",
        permanent: false,
      },
    };
  }
  // If there is a user continue to profile.
  return {
    props: {},
  };
}

export default observer(StepOne);
