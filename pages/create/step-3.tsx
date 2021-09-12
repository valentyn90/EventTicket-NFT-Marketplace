import CreateLayout from "@/components/Create/CreateLayout";
import PhotoPreviewSide from "@/components/Create/PhotoPreviewSide";
import Card from "@/components/NftCard/Card";
import { nftInput } from "@/mobx/NftInput";
import { useUser } from "@/utils/useUser";
import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Spinner,
  Text,
  Stack,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";

const StepThree = () => {
  const { nft, photoFile, stepThreeSubmit, setNftObject } = useUser();
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);

  async function handleStepThreeSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (nft) {
      if (
        // 1. Check if the input values are the same as DB nft
        nft.high_school === nftInput.highSchool &&
        nft.usa_state === nftInput.usaState &&
        nft.sport === nftInput.sport &&
        nft.sport_position === nftInput.sportPosition &&
        nft.quotes === nftInput.choiceQuote
      ) {
        router.push("/create/step-4");
      } else {
        // first insert
        setSubmitting(true);
        const { data, error } = await stepThreeSubmit({
          highSchool: nftInput.highSchool,
          usaState: nftInput.usaState,
          sport: nftInput.sport,
          sportPosition: nftInput.sportPosition,
          choiceQuote: nftInput.choiceQuote,
          nft_id: nft.id,
        });
        setSubmitting(false);
        if (error) {
          console.log(error);
          alert(error.message);
        } else {
          setNftObject(data[0]);
          router.push("/create/step-4");
        }
      }
    }
  }

  return (
    <CreateLayout>
      <form onSubmit={handleStepThreeSubmit}>
        <Flex direction="column">
          {/* Top Row */}
          <Flex direction={["column", "column", "row"]}>
            {/* Left side */}
            <PhotoPreviewSide
              title="Just a few more details"
              subtitle="We won't ask many more questions, we know you're super important and busy."
              flex="1"
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
                    value={nftInput.highSchool}
                    onChange={(e) =>
                      nftInput.setInputValue("highSchool", e.target.value)
                    }
                  />
                </FormControl>
                <FormControl id="usaState">
                  <FormLabel>State</FormLabel>
                  <Input
                    type="text"
                    id="usState"
                    placeholder="LA"
                    value={nftInput.usaState}
                    onChange={(e) =>
                      nftInput.setInputValue("usaState", e.target.value)
                    }
                  />
                </FormControl>
                <FormControl id="sport">
                  <FormLabel>Sport</FormLabel>
                  <Input
                    type="text"
                    id="sport"
                    placeholder="Football"
                    value={nftInput.sport}
                    onChange={(e) =>
                      nftInput.setInputValue("sport", e.target.value)
                    }
                  />
                </FormControl>
                <FormControl id="sportPosition">
                  <FormLabel>Position</FormLabel>
                  <Input
                    type="text"
                    id="sportPosition"
                    placeholder="QB"
                    value={nftInput.sportPosition}
                    onChange={(e) =>
                      nftInput.setInputValue("sportPosition", e.target.value)
                    }
                  />
                </FormControl>
                <FormControl id="choiceQuote" mb={["2rem", "2rem", 0]}>
                  <FormLabel>Choice Quote</FormLabel>
                  <Input
                    type="text"
                    id="highSchool"
                    placeholder="Knibb High Football Rules!!!"
                    value={nftInput.choiceQuote}
                    onChange={(e) =>
                      nftInput.setInputValue("choiceQuote", e.target.value)
                    }
                  />
                </FormControl>
                {photoFile && (
                  <Box
                    mt={["2rem !important", "2rem !important", 0]}
                    mb={["2rem !important", "2rem !important", 0]}
                    display={["block", "block", "none"]}
                  >
                    {nft?.id ? (
                      <Card nft_id={nft?.id} nft_width={400} reverse={false} />
                    ) : (
                      <Text>Loading...</Text>
                    )}
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
