import React from "react";
import Navbar from "@/components/Navbar";
import Head from "next/head";
import { useRouter } from "next/router";
import { Box, useColorModeValue, useColorMode } from "@chakra-ui/react";
import { CookieBanner } from "components/ui/CookieBanner";
import Footer from "@/components/Footer/Footer";
import { BetaModal } from "../BetaModal";

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const showNav = router.pathname === "/screenshot/[id]" ? false : true;
  const showNavForLanding = router.pathname === "/" ? false : true;
  const { colorMode, setColorMode } = useColorMode();

  if (!showNav) {
    setColorMode("dark");
  }

  return (
    <>
      <Head>
        <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico?v=2" />
        <meta property="og:title" content="Verified Ink" key="title" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://verifiedink.us/img/twitter-site-image.png" key="twitter-image" />
        {/* <meta name="twitter:site" content="" /> */}
        <meta
          property="og:image"
          content="https://verifiedink.us/img/verified-ink-site.png"
          key="preview"
        />
      </Head>
      {showNav && showNavForLanding && <Navbar />}
      {/* Margin for fixed navbar position */}
      {showNav && showNavForLanding ?
        <Box
          minH="calc(100vh - 56px - 286px)"
          mt="56px"
          bg={useColorModeValue("gray.50", "inherit")}
        >
          {children}
        </Box> :
        <Box
          minH="100vh"
          // mt="56px"
          bg={useColorModeValue("gray.50", "inherit")}
        >
          {children}
        </Box>
      }
      {showNav && showNavForLanding && <Footer />}
      {showNav && showNavForLanding && <CookieBanner />}
    </>
  );
};

export default Layout;
