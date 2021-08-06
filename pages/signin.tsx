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
import { useRouter } from "next/router";
import React, { useState } from "react";
import { FaGoogle, FaTwitter } from "react-icons/fa";

interface Props {}

const SignIn: React.FC<Props> = () => {
  const [loading, setLoading] = useState(false);
  const [emailLinkSent, setEmailLinkSent] = useState(false);
  const [email, setEmail] = useState("");
  const { signIn } = useUser();

  const router = useRouter();

  const { notLoggedIn } = router.query;

  const goToStepOne =
    notLoggedIn !== undefined ? notLoggedIn === "true" : false;

  async function handleSignin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const emailSignIn = await signIn({ email, goToStepOne });
    setLoading(false);
    if (emailSignIn) {
      setEmailLinkSent(true);
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
          Sign in to your account
        </Heading>
        <Text textAlign="center" mt={4} size="l" colorScheme="gray">
          Don't have an account?{" "}
          <NextLink href="/signup">
            <a className="blue-link">Sign up</a>
          </NextLink>
        </Text>
        <Card mt="12" py={8}>
          <VStack spacing={8}>
            <Button
              disabled={emailLinkSent}
              py={6}
              w="100%"
              colorScheme="twitter"
              onClick={() => {
                signIn({ provider: "twitter", goToStepOne });
              }}
            >
              <FaTwitter />
              <Text ml="2rem" fontWeight="normal">
                Sign in with Twitter
              </Text>
            </Button>
            <Button
              disabled={emailLinkSent}
              py={6}
              w="100%"
              color="currentColor"
              variant="outline"
              onClick={() => {
                signIn({ provider: "google", goToStepOne });
              }}
            >
              <FaGoogle />
              <Text ml="2rem" fontWeight="normal">
                Sign in with Google
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
            {!emailLinkSent ? (
              <Button
                py={6}
                type="submit"
                width="100%"
                colorScheme="blue"
                color="white"
              >
                {loading ? <Spinner /> : "Sign in"}
              </Button>
            ) : (
              <VStack spacing={6}>
                <Text textAlign="center" fontSize="3xl" fontWeight="bold">
                  Check your email
                </Text>
                <Text textAlign="center">
                  A sign in link has been sent to your email.
                </Text>
              </VStack>
            )}
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

export default SignIn;
