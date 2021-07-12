import CardPreview from "@/components/Create/CardPreview";
import CreateLayout from "@/components/Create/CreateLayout";
import PhotoPreviewSide from "@/components/Create/PhotoPreviewSide";
import { useUser } from "@/utils/useUser";
import {
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Spinner,
  Box,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";

const StepThree = () => {
  const { nft, photoFile, stepThreeSubmit, setNftObject } = useUser();
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);

  const [highSchool, setHighSchool] = useState("");
  const handleHighSchool = (e: React.ChangeEvent<HTMLInputElement>) =>
    setHighSchool(e.target.value);
  const [usaState, setUsaState] = useState("");
  const handleUsaState = (e: React.ChangeEvent<HTMLInputElement>) =>
    setUsaState(e.target.value);
  const [sport, setSport] = useState<any>("");
  const handleSport = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSport(e.target.value);
  const [sportPosition, setSportPosition] = useState<any>("");
  const handleSportPosition = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSportPosition(e.target.value);
  const [choiceQuote, setChoiceQuote] = useState<any>("");
  const handleChoiceQuote = (e: React.ChangeEvent<HTMLInputElement>) =>
    setChoiceQuote(e.target.value);

  useEffect(() => {
    if (nft) {
      if (nft.high_school !== null) setHighSchool(nft.high_school);
      if (nft.usa_state) setUsaState(nft.usa_state);
      if (nft.sport) setSport(nft.sport);
      if (nft.sport_position) setSportPosition(nft.sport_position);
      if (nft.quotes) setChoiceQuote(nft.quotes);
    }
  }, [nft]);

  async function handleStepThreeSubmit(e: React.FormEvent) {
    e.preventDefault();

    // If user is at this point
    // They have an NFT object in DB
    // If not, something went wrong.

    if (nft) {
      if (
        // 1. Check if the input values are the same as DB nft
        nft.high_school === highSchool &&
        nft.usa_state === usaState &&
        nft.sport === sport &&
        nft.sport_position === sportPosition &&
        nft.quotes === choiceQuote
      ) {
        router.push("/create/step-4");
      } else {
        // first insert
        setSubmitting(true);
        const { data, error } = await stepThreeSubmit({
          highSchool,
          usaState,
          sport,
          sportPosition,
          choiceQuote,
          nft_id: nft.id,
        });
        setSubmitting(false);
        if (error) {
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
                    value={highSchool}
                    onChange={handleHighSchool}
                  />
                </FormControl>
                <FormControl id="usaState">
                  <FormLabel>State</FormLabel>
                  <Input
                    type="text"
                    id="usState"
                    placeholder="LA"
                    value={usaState}
                    onChange={handleUsaState}
                  />
                </FormControl>
                <FormControl id="sport">
                  <FormLabel>Sport</FormLabel>
                  <Input
                    type="text"
                    id="sport"
                    placeholder="Football"
                    value={sport}
                    onChange={handleSport}
                  />
                </FormControl>
                <FormControl id="sportPosition">
                  <FormLabel>Position</FormLabel>
                  <Input
                    type="text"
                    id="sportPosition"
                    placeholder="QB"
                    value={sportPosition}
                    onChange={handleSportPosition}
                  />
                </FormControl>
                <FormControl id="choiceQuote" mb={["2rem", "2rem", 0]}>
                  <FormLabel>Choice Quote</FormLabel>
                  <Input
                    type="text"
                    id="highSchool"
                    placeholder="Knibb High Football Rules!!!"
                    value={choiceQuote}
                    onChange={handleChoiceQuote}
                  />
                </FormControl>
                {photoFile && (
                  <Box
                    mt={["2rem !important", "2rem !important", 0]}
                    mb={["2rem !important", "2rem !important", 0]}
                    display={["block", "block", "none"]}
                  >
                    <CardPreview photoFile={photoFile} nft={nft} />
                  </Box>
                )}
                <Button colorScheme="blue" type="submit">
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

export default StepThree;
