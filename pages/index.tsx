import { Card } from "@/components/Card";
import { Link } from "@/components/Link";
import { supabase } from "@/utils/supabase-client";
import { Box, Heading, useColorModeValue } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        fetch("/api/auth", {
          method: "POST",
          headers: new Headers({ "Content-Type": "application/json" }),
          credentials: "same-origin",
          body: JSON.stringify({ event, session }),
        }).then((res) => res.json());

        if (event === "SIGNED_IN") router.push("/profile");
      }
    );
    return () => {
      if (authListener) {
        authListener.unsubscribe();
      }
    };
  }, []);

  return (
    <Box
      bg={useColorModeValue("gray.50", "inherit")}
      minH="100vh"
      py="12"
      px={{ base: "4", lg: "8" }}
    >
      <Box maxW="md" mx="auto">
        <Heading textAlign="center" size="xl" fontWeight="extrabold">
          Sign in to your account
        </Heading>
        <Card mt="8">
          <Link href="/signin">Signin</Link>
        </Card>
      </Box>
    </Box>
  );
}
