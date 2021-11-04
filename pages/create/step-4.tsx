import ColorPicker from "@/components/Create/ColorPicker";
import CreateLayout from "@/components/Create/CreateLayout";
import PhotoPreviewSide from "@/components/Create/PhotoPreviewSide";
import Card from "@/components/NftCard/Card";
import { CardBox } from "@/components/ui/CardBox";
import userStore from "@/mobx/UserStore";
import {
  Button,
  Divider,
  Flex,
  Spinner,
  useToast,
  Box,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";

const StepFour = () => {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function handleStepFourSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (userStore.stepFourSkip) {
      router.push("/create/step-5");
    } else {
      setSubmitting(true);
      const res = await userStore.nft?.saveTeamColors();
      setSubmitting(false);
      if (res) {
        router.push("/create/step-5");
      } else {
        toast({
          position: "top",
          description: "Error saving team colors",
          status: "error",
          duration: 3500,
          isClosable: true,
        });
      }
    }
  }

  return (
    <CreateLayout>
      <form onSubmit={handleStepFourSubmit}>
        <Flex direction="column">
          <Flex direction={["column", "column", "row"]}>
            <PhotoPreviewSide
              title="Team Colors"
              subtitle="Make your card pop with your team's colors."
              flex="1"
              nft_id={userStore.nft?.id}
              nft={userStore.loadedNft}
            />
            <Flex flex="1" direction="column">
              <ColorPicker />
              <Box
                mt={["2rem !important", "2rem !important", 0]}
                mb={["2rem !important", "2rem !important", 0]}
                display={["block", "block", "none"]}
                h={["500x", "500x", "450px"]}
              >
                <CardBox>
                  <Card
                    nft_id={userStore.nft?.id}
                    nft={userStore.loadedNft}
                    nft_width={400}
                    reverse={false}
                  />
                </CardBox>
              </Box>
              <Button
                display="block"
                ml="auto"
                mt="2rem"
                align="end"
                colorScheme="blue"
                color="white"
                type="submit"
                disabled={submitting}
              >
                {submitting ? <Spinner /> : "Looking Good"}
              </Button>
            </Flex>
          </Flex>
          <Divider mt="6" mb="6" />
          <Flex>
            <NextLink href="/create/step-3">
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

export default observer(StepFour);
