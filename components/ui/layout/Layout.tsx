import Footer from "@/components/Footer/Footer";
import Navbar from "@/components/Navbar";
import { Box, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { CookieBanner } from "components/ui/CookieBanner";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const showNav = router.pathname === "/screenshot/[id]" ? false : true;
  const overlayNav =
    router.pathname.includes("challenge") ||
    router.pathname.includes("drop") ||
    router.pathname.includes("marketplace")
      ? true
      : false;
  const showNavForLanding =
    router.pathname === "/ar" || router.pathname === "/screenshot/qr" || router.pathname.includes("/apparel/")
      ? false
      : true;

  const showFooterForLanding =
    router.pathname === "/ar" ||
    router.pathname === "/screenshot/qr" ||
    router.pathname === "/events/[id]/tickets" ||
    router.pathname === "/events/accept_tickets" ||
    router.pathname.includes("/apparel/")
      ? false
      : true;
  const { colorMode, setColorMode } = useColorMode();

  if (!showNav) {
    setColorMode("dark");
  }

  return (
    <>
      <Head>
        <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico?v=2" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta property="og:title" content="VerifiedInk" key="title" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:image"
          content="https://verifiedink.us/img/twitter-site-image.png"
          key="twitter-image"
        />
        {/* <meta name="twitter:site" content="" /> */}
        <meta
          property="og:image"
          content="https://verifiedink.us/img/verified-ink-site.png"
          key="preview"
        />
      </Head>
      {showNav && showNavForLanding && <Navbar />}
      {/* Margin for fixed navbar position */}
      {showNav && showNavForLanding && !overlayNav ? (
        <Box
          minH="calc(100vh - 56px - 286px)"
          mt="56px"
          bg={useColorModeValue("gray.50", "inherit")}
        >
          {children}
        </Box>
      ) : (
        <Box
          // minH="100vh"
          minH="100%"
          // mt="56px"
          bg={useColorModeValue("gray.50", "inherit")}
        >
          {children}
        </Box>
      )}
      {showNav && showFooterForLanding && <Footer />}
      {showNav && showNavForLanding && <CookieBanner />}
    </>
  );
};

export default Layout;
