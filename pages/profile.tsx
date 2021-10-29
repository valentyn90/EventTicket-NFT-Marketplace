import MintingProgress from "@/components/Profile/MintingProgress";
import PersonalInfo from "@/components/Profile/PersonalInfo";
import ReferralCode from "@/components/Profile/ReferralCode";
import VerifiedStatus from "@/components/Profile/VerifiedStatus";
import userStore from "@/mobx/UserStore";
import { signOut, supabase } from "@/supabase/supabase-client";
import {
  Box,
  Button,
  Container,
  Spinner,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import type { NextApiRequest } from "next";
import React from "react";

interface Props {}

const Profile: React.FC<Props> = (props) => {
  return (
    <Box
      bg={useColorModeValue("gray.50", "inherit")}
      minH="100vh"
      py="12"
      px={{ base: "4", lg: "8" }}
    >
      <Container maxW="container.sm">
        <VStack spacing={8} alignItems="start">
          {userStore.loaded ? (
            <>
              <PersonalInfo />
              <VerifiedStatus />
              <MintingProgress />
              <ReferralCode />
              <Button colorScheme="blue" color="white" onClick={signOut}>
                Logout
              </Button>
            </>
          ) : (
            <Spinner size="xl" alignSelf="center" mt="50%" />
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export async function getServerSideProps({ req }: { req: NextApiRequest }) {
  const { user } = await supabase.auth.api.getUserByCookie(req);
  if (!user) {
    return {
      redirect: {
        destination: "/signin",
        permanent: false,
      },
    };
  }
  // If there is a user continue to profile.
  return { props: {} };
}

export default observer(Profile);
