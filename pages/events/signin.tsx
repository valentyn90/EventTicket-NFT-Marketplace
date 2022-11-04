import { signIn, supabase } from "@/supabase/supabase-client";
import Cookies from "cookies";
import {
  Box,
  Button,
  Heading,
  Input,
  Spacer,
  Spinner,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { NextApiRequest, NextApiResponse } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import cookieCutter from "cookie-cutter";

interface Props {}

const SignIn: React.FC<Props> = () => {
  const [loading, setLoading] = useState(false);
  const [emailLinkSent, setEmailLinkSent] = useState(false);
  const [email, setEmail] = useState("");

  const router = useRouter();

  useEffect(() => {
    const email_router = router.query.email! as string;
    console.log(email_router);
    setEmail(email_router);

    if(!cookieCutter.get("redirect-link")){
      cookieCutter.set("redirect-link","/collection", {
        path: "/",
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365)
      });
    }
  }, []);

  async function handleSignin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // const emailSignIn = await signIn({ email });

    const res = await fetch(`/api/admin/send-magic-link`, {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      credentials: "same-origin",
      body: JSON.stringify({
        email,
      }),
    });

    const resj = await res.json();

    setLoading(false);
    if (resj) {
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
      <Spacer h="56px" />
      <Box maxW="lg" mx="auto">
        <Heading textAlign="center" size="2xl" fontWeight="extrabold">
          Access your Tickets
        </Heading>
        <Text pt={6} textAlign="center" w={["100%", "100%", "75%"]} m="0 auto">
          VerifiedInk uses “magic links” for you to access your Account. 
          Just enter your email below and we’ll send you a sign in
          link.
        </Text>

        <Box mt="12" py={8}>
          <form onSubmit={handleSignin}>
            {!emailLinkSent && (
              <>
                <Text fontWeight="bold">Email Address</Text>
                <Input
                  value={email}
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                  mt={1}
                  mb={8}
                  borderRadius={1}
                />
              </>
            )}
            {!emailLinkSent ? (
              <Button
                py={6}
                type="submit"
                width="100%"
                colorScheme="blue"
                color="white"
                borderRadius={1}
              >
                {loading ? <Spinner /> : "Sign in"}
              </Button>
            ) : (
              <VStack spacing={6}>
                <Text textAlign="center" fontSize="3xl" fontWeight="bold">
                  Check your email
                </Text>
                <Text textAlign="center">
                  A sign in link has been sent to your email. <br/>Please check your SPAM or Updates folders if you don’t see it in your Inbox.
                </Text>
              </VStack>
            )}
          </form>
        </Box>
        <Text pt={16} textAlign="center">
          Are you an athlete who has created or want to create your own
          VerifiedInk?{" "}
          <NextLink href="/athletes/signin">
            <a>
              <Text color="viBlue" display="inline-block">
                Athlete Sign Up
              </Text>
            </a>
          </NextLink>
        </Text>
      </Box>
    </Box>
  );
};

export async function getServerSideProps({
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}) {
  const cookies = new Cookies(req, res);

  const { user } = await supabase.auth.api.getUserByCookie(req);
  if (user) {
    return {
      redirect: {
        destination: "/events/1/tickets",
        permanent: false,
      },
    };
  }
  return { props: {} };
}

export default SignIn;
