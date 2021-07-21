import { Card } from "@/components/ui/Card";
import { DividerWithText } from "@/components/ui/DividerWithText";
import { supabase } from "@/utils/supabase-client";
import { useUser } from "@/utils/useUser";
import {
  Box,
  Button,
  Heading,
  Input,
  Text,
  useColorModeValue,
  VStack,
  Spinner,
} from "@chakra-ui/react";
import { NextApiRequest } from "next";
import NextLink from "next/link";
import React, { useState } from "react";
import { FaGoogle, FaTwitter } from "react-icons/fa";

interface Props {}

const SignUp: React.FC<Props> = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const { signIn } = useUser();

  async function handleSignin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const emailSignIn = await signIn({ email });
    setLoading(false);
    if (emailSignIn) {
      alert("Check your email for a login link.");
    }
  }

  return (
    <Box
      bg={useColorModeValue("gray.50", "inherit")}
      minH="100vh"
      py={"12"}
      px={{ base: "4", lg: "8" }}
    >
      <Box maxW="lg" mx="auto">
        <Heading textAlign="center" size="2xl" fontWeight="extrabold">
          Create your account
        </Heading>
        <Text textAlign="center" mt={4} size="l" color="gray.600">
          Already have an account?{" "}
          <NextLink href="/signin">
            <a className="blue-link">Sign in</a>
          </NextLink>
        </Text>
        <Card mt="12" py={8}>
          <VStack spacing={8}>
            <Button
              py={6}
              w="100%"
              colorScheme="twitter"
              onClick={() => {
                signIn({ provider: "twitter" });
              }}
            >
              <FaTwitter />
              <Text ml="2rem" fontWeight="normal">
                Sign up with Twitter
              </Text>
            </Button>
            <Button
              py={6}
              w="100%"
              color="currentColor"
              variant="outline"
              onClick={() => {
                signIn({ provider: "google" });
              }}
            >
              <FaGoogle />
              <Text ml="2rem" fontWeight="normal">
                Sign up with Google
              </Text>
            </Button>
          </VStack>
          <DividerWithText mt={8} mb={8}>
            or continue with
          </DividerWithText>
          <form onSubmit={handleSignin}>
            <Text fontWeight="bold">Email Address</Text>
            <Input
              value={email}
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              mt={2}
              mb={8}
            />
            <Button py={6} type="submit" width="100%" colorScheme="blue">
              {loading ? <Spinner /> : "Sign up"}
            </Button>
          </form>
        </Card>
      </Box>
    </Box>
  );
};

export async function getServerSideProps({ req }: { req: NextApiRequest }) {
  const { user } = await supabase.auth.api.getUserByCookie(req);
  if (user) {
    return {
      redirect: {
        destination: "/profile",
        permanent: false,
      },
    };
  }
  return { props: {} };
}

export default SignUp;
