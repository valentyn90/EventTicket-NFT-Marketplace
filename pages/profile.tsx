import { supabase } from "@/utils/supabase-client";
import { Box, Heading, useColorModeValue } from "@chakra-ui/react";
import type { NextApiRequest } from "next";
import React from "react";

interface Props {
  user: {
    id: string;
    email: string;
  };
}

const Profile: React.FC<Props> = ({ user }) => {
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
        <p>user id: {user.id}</p>
        <p>user email: {user.email}</p>
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
  return { props: { user } };
}

export default Profile;
