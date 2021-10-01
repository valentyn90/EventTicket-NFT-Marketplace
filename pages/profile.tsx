import userStore from "@/mobx/UserStore";
import { signOut, supabase } from "@/utils/supabase-client";
import { Box, Button, Heading, useColorModeValue } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import type { NextApiRequest } from "next";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

interface Props {}

const Profile: React.FC<Props> = (props) => {
  const router = useRouter();

  useEffect(() => {
    if (!userStore.loggedIn) {
      router.push("/signin");
    }
  }, [userStore.loggedIn, router]);

  return (
    <Box
      bg={useColorModeValue("gray.50", "inherit")}
      minH="100vh"
      py="12"
      px={{ base: "4", lg: "8" }}
    >
      <Box maxW="md" mx="auto">
        <Heading textAlign="center" size="xl" fontWeight="extrabold">
          Signed in.
        </Heading>
        <Button onClick={signOut}>Logout</Button>
        <p>user email: {userStore?.email}</p>
      </Box>
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
