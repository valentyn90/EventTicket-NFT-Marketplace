import { Card } from "@/components/ui/Card";
import { isReferralCodeUsed } from "@/supabase/recruit";
import { signUp, supabase } from "@/supabase/supabase-client";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Flex,
  Heading,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { NextApiRequest } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { FaGoogle, FaTwitter } from "react-icons/fa";

interface Props {}

const SignUp: React.FC<Props> = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [outOfReferrals, setOutOfReferrals] = useState(false);
  const router = useRouter();

  const { referralCode } = router.query;

  useEffect(() => {
    // Check if referral code is at its limit
    if (typeof referralCode === "string") {
      isReferralCodeUsed(referralCode).then((res) => setOutOfReferrals(res));
    }
  }, [referralCode]);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    let refer_code = typeof referralCode === "string" ? referralCode : "";
    setReferralInfo(refer_code);
    setLoading(true);
    const emailSignUp = await signUp({
      email,
    });
    setLoading(false);
    if (emailSignUp) {
      alert("Check your email for a login link.");
    }
  }

  function setReferralInfo(referralCode: string) {
    // When signing up
    // Create local storage info to tell app
    // About the sign up and to do the user detail/referral code stuff
    // And check these items in userState.initUser()
    localStorage.setItem("sign_up", "true");
    if (referralCode) {
      localStorage.setItem("referral_code", referralCode);
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
        <Text textAlign="center" mt={4} size="l" colorScheme="gray">
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
                let refer_code =
                  typeof referralCode === "string" ? referralCode : "";
                setReferralInfo(refer_code);
                signUp({
                  provider: "twitter",
                });
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
                let refer_code =
                  typeof referralCode === "string" ? referralCode : "";
                setReferralInfo(refer_code);
                signUp({
                  provider: "google",
                });
              }}
            >
              <FaGoogle />
              <Text ml="2rem" fontWeight="normal">
                Sign up with Google
              </Text>
            </Button>
          </VStack>
          {/* <DividerWithText mt={8} mb={8}>
            or continue with
          </DividerWithText>
          <form onSubmit={handleSignup}>
            <Text fontWeight="bold">Email Address</Text>
            <Input
              value={email}
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              mt={2}
              mb={8}
            />
            <Button
              py={6}
              type="submit"
              width="100%"
              colorScheme="blue"
              color="white"
            >
              {loading ? <Spinner /> : "Sign up"}
            </Button>
          </form> */}
        </Card>
        {outOfReferrals && (
          <Alert status="warning" mt={8} rounded={{ sm: "lg" }} p={8}>
            <Flex direction="column" alignItems="flex-start">
              <AlertTitle mb={4} display="flex">
                <AlertIcon mr={2} />
                Referral Code Limit Reached
              </AlertTitle>

              <AlertDescription mb={4}>
                You are welcome to sign up but it might take longer for your
                card to be approved.
              </AlertDescription>

              <Button
                colorScheme="orange"
                px={4}
                onClick={() => setOutOfReferrals(false)}
              >
                OK
              </Button>
            </Flex>
          </Alert>
        )}
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
