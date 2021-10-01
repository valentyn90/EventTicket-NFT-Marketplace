import CreateLayout from "@/components/Create/CreateLayout";
import PhotoPreviewSide from "@/components/Create/PhotoPreviewSide";
import Card from "@/components/NftCard/Card";
import userStore from "@/mobx/UserStore";
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
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";

const StepThree = () => {
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);

  async function handleStepThreeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (userStore.stepThreeSkip) {
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

  return (
    <CreateLayout>
      <form onSubmit={handleStepThreeSubmit}>
        <Flex direction="column">
          {/* Top Row */}
          <Flex direction={["column", "column", "row"]}>
            <PhotoPreviewSide
              title="Just a few more details"
              subtitle="We won't ask many more questions, we know you're super important and busy."
              flex="1"
              nft_id={userStore.nft?.id}
              nft={userStore.loadedNft}
            />

            {/* Right side */}
            <Flex flex="1" direction="column" mt={["4", "4", 0]}>
              <Stack>
                <FormControl id="highSchool">
                  <FormLabel>High School</FormLabel>
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
                <FormControl id="choiceQuote" mb={["2rem", "2rem", 0]}>
                  <FormLabel>Choice Quote</FormLabel>
                  <Input
                    type="text"
                    id="highSchool"
                    placeholder="Knibb High Football Rules!!!"
                    value={userStore.nftInput.quotes}
                    onChange={(e) =>
                      userStore.nftInput.setInputValue("quotes", e.target.value)
                    }
                  />
                </FormControl>
                {userStore.nft?.photo && (
                  <Box
                    mt={["2rem !important", "2rem !important", 0]}
                    mb={["2rem !important", "2rem !important", 0]}
                    display={["block", "block", "none"]}
                  >
                    <Card
                      nft_id={userStore.nft?.id}
                      nft_width={400}
                      reverse={false}
                    />
                  </Box>
                )}
                <Button colorScheme="blue" color="white" type="submit">
                  {submitting ? <Spinner /> : "Looking Good"}
                </Button>
              </Stack>
            </Flex>
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

export default observer(StepThree);
