import ColorPicker from "@/components/Create/ColorPicker";
import CreateLayout from "@/components/Create/CreateLayout";
import PhotoPreviewSide from "@/components/Create/PhotoPreviewSide";
import Card from "@/components/NftCard/Card";
import { CardBox } from "@/components/ui/CardBox";
import userStore from "@/mobx/UserStore";
import forwardMinted from "@/utils/forwardMinted";
import {
  Button,
  Divider,
  Flex,
  Spinner,
  useToast,
  Box,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { NextApiRequest } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";

const StepFour = () => {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function handleStepFourSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSubmitting(true);
    const res = await userStore.nft?.saveTeamColors();
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
      setSubmitting(false);
    }

  }

  return (
    <CreateLayout>
      <form onSubmit={handleStepFourSubmit}>
        <Flex direction="column">
          <Flex direction={["column", "column", "row"]}>
            <PhotoPreviewSide
              title="Choose Your Colors"
              subtitle=""
              flex="1"
              nft_id={userStore.nft?.id}
              nft={userStore.loadedNft}
            />
            <Flex flex="1" direction="column">
              <ColorPicker />
              <Box
                // mt={["2rem !important", "2rem !important", 0]}
                mb={["2rem !important", "2rem !important", 0]}
                display={["block", "block", "none"]}
                h={["500x", "500x", "450px"]}
                alignSelf="center"
              >
                <CardBox>
                  <Card
                    nft_id={userStore.nft?.id}
                    nft={userStore.loadedNft}
                    nft_width={300}
                    reverse={false}
                  />
                </CardBox>
              </Box>
              <Button
                display="block"
                ml="auto"
                align="end"
                w={["100%", "fit-content"]}
                colorScheme="blue"
                color="white"
                type="submit"
                disabled={submitting}
                isLoading={submitting}
              >
                Next Step
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

export async function getServerSideProps({ req }: { req: NextApiRequest }) {
  return await forwardMinted(req);
}

export default observer(StepFour);
