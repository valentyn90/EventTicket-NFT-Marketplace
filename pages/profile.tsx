import { supabase } from "@/utils/supabase-client";
import { useUser } from "@/utils/useUser";
import { Box, Heading, useColorModeValue, Button } from "@chakra-ui/react";
import type { NextApiRequest } from "next";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

interface Props {}

const Profile: React.FC<Props> = (props) => {
  const { user, signOut } = useUser();
  const router = useRouter();

  useEffect(() => {
    // This needs to be updated because
    // if you refresh, and are logged in, it pushes to /signin
    if (!user) {
      router.push("/signin");
    }
  }, [user, router]);

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
        <p>user email: {user?.email}</p>
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
  // If there is a user, return it.
  return { props: {} };
}

export default Profile;
