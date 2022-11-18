import CreateLayout from "@/components/Create/CreateLayout";
import PhotoPreviewSide from "@/components/Create/PhotoPreviewSide";
import Card from "@/components/NftCard/Card";
import userStore from "@/mobx/UserStore";
import forwardMinted from "@/utils/forwardMinted";
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
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { NextApiRequest } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import cookieCutter from "cookie-cutter";

const StepThree = () => {
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);

  async function handleStepThreeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (userStore.stepThreeSkip) {
      setSubmitting(true);
      router.push("/create/step-4");
    } else {
      // update nft
      setSubmitting(true);
      const res = await userStore.nft?.stepThreeSubmit();
      if (res) {
        router.push("/create/step-4");
      }
    }
  }

  useEffect(() => {
    if(userStore.loaded){
    if(cookieCutter.get("school") &&  userStore.nftInput.high_school=="") {
      userStore.nftInput.high_school = cookieCutter.get("school");
    }
  }
  },[router, userStore.loaded])

  return (
    <CreateLayout>
      <form onSubmit={handleStepThreeSubmit}>
        <Flex direction="column">
          {/* Top Row */}
          <Flex direction={["column", "column", "row"]} gridGap="2">
            <PhotoPreviewSide
              title="A Few More Details"
              subtitle=""
              flex="1"
              nft_id={userStore.nft?.id}
              nft={userStore.loadedNft}
            />

            {/* Right side */}
            <Flex flex="1" direction="column" >
              <Stack>
                <FormControl id="highSchool">
                  <FormLabel>School</FormLabel>
                  <Input
                    type="text"
                    id="highSchool"
                    placeholder="Vernon HS"
                    value={userStore.nftInput.high_school}
                    onChange={(e) =>
                      userStore.nftInput.setInputValue(
                        "high_school",
                        e.target.value
                      )
                    }
                  />
                </FormControl>
                <FormControl id="usaState">
                  <FormLabel>State</FormLabel>
                  <Input
                    type="text"
                    id="usState"
                    placeholder="LA"
                    value={userStore.nftInput.usa_state}
                    onChange={(e) =>
                      userStore.nftInput.setInputValue(
                        "usa_state",
                        e.target.value
                      )
                    }
                  />
                </FormControl>
                <FormControl id="sport">
                  <FormLabel>Sport</FormLabel>
                  <Input
                    type="text"
                    id="sport"
                    placeholder="Football"
                    value={userStore.nftInput.sport}
                    onChange={(e) =>
                      userStore.nftInput.setInputValue("sport", e.target.value)
                    }
                  />
                </FormControl>
                <FormControl id="sportPosition">
                  <FormLabel>Position</FormLabel>
                  <Input
                    type="text"
                    id="sportPosition"
                    placeholder="QB"
                    value={userStore.nftInput.sport_position}
                    onChange={(e) =>
                      userStore.nftInput.setInputValue(
                        "sport_position",
                        e.target.value
                      )
                    }
                  />
                </FormControl>



              </Stack>
              <Button mt="2rem" colorScheme="blue" color="white" type="submit" isLoading={submitting}>
                Next Step
              </Button>
            </Flex>

            <Box
              display={["block", "block", "none"]} pt={8}
              alignSelf="center">

              <Card
                nft_id={userStore.loadedNft?.id}
                nft_width={375}
                reverse={false}

              />
            </Box>
          </Flex>
          <Divider mt="6" mb="6" />
          {/* Bottom row */}
          <Flex>
            <NextLink href="/create/step-2">
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

export default observer(StepThree);
