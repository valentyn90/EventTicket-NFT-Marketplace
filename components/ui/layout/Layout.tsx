import React from "react";
import Navbar from "@/components/Navbar";
import Head from "next/head";
import { useRouter } from "next/router";
import { Box, useColorModeValue, useColorMode } from "@chakra-ui/react";
import { CookieBanner } from "components/ui/CookieBanner";

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const showNav = router.pathname === "/screenshot/[id]" ? false : true;
  const { colorMode, setColorMode } = useColorMode();

  if (!showNav) {
    setColorMode("dark");
  }

  return (
    <>
      <Head>
        <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico?v=2" />
        <meta property="og:title" content="Verified Ink" key="title" />
        <meta
          property="og:image"
          content="https://verifiedink.us/img/verified-ink-site.png"
          key="preview"
        />
      </Head>
      {showNav && <Navbar />}
      {/* Margin for fixed navbar position */}
      <Box
        minH="calc(100vh - 56px)"
        mt="56px"
        bg={useColorModeValue("gray.50", "inherit")}
      >
        {children}
        <Box minH="2xs">
          {showNav && <CookieBanner />}
        </Box>
      </Box>
    </>
  );
};

export default Layout;
