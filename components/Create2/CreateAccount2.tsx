import { Box, Button, Stack, Text, VStack } from "@chakra-ui/react";
import React from "react";
import VerifiedInkNft from "../VerifiedInkNft/VerifiedInkNft";
import ShareButton from "../Components/ShareButton";
import Link from "next/link";
import { getUserNft } from "@/supabase/supabase-client";
import userStore from "@/mobx/UserStore";

interface Props {
  nftId: number | null;
}

const CreateAccount2: React.FC<Props> = ({ nftId }) => {

  // I would like to pull their email address

  return (
    <Stack direction={["column", "column", "row"]} spacing={4} p={4}>
      <Box flex={1}>
        <VerifiedInkNft nftId={nftId} />
      </Box>
      <VStack flex={1} justify="center" spacing={4}>
        <Text pt={4} fontSize={["lg", "lg", "2xl"]}>
          You're all done! Now <span className="blue-text">Share</span> your NFT!
        </Text>
        <ShareButton
          id={nftId!}
          width="100%"
          variant="outline"
          color="white"
          borderColor="#4688F1"
        />

        <Text pt={4} fontSize={["lg", "lg", "2xl"]}>
          Or         </Text>

        {userStore.loggedIn ?
          (
            <>
              <Text pt={4} fontSize={["lg", "lg", "2xl"]}>
                View Your Collection         </Text>

              <Link href="/collection">
                <Button w="100%">
                  View Collection
                </Button>
              </Link>
            </>

          )
          :
          (<>
            <Text pt={4} fontSize={["lg", "lg", "2xl"]}>
              Sign In to Manage Your Collection         </Text>

            <Link href="/marketplace/signin">
              <Button w="100%">
                Sign In
              </Button>
            </Link>
          </>
          )}
      </VStack>
    </Stack>
  );
};

export default CreateAccount2;
