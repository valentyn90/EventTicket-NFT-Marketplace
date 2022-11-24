import Footer from "@/components/Footer/Footer";
import userStore from "@/mobx/UserStore";
import Navbar from "@/components/Navbar";
import { Box, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { CookieBanner } from "components/ui/CookieBanner";
import mixpanel from "mixpanel-browser";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useCallback, useEffect } from "react";
import { useIntercom } from "react-use-intercom";

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

  const { boot, update } = useIntercom();
  mixpanel.init("b78dc989c036b821147f68e00c354313");

  mixpanel.track("Page View", {
    path: router.asPath,
    page_id: router.query.id,
    query: router.query,
  });

  const bootWithProps = useCallback(() => {
    boot();
    if (userStore.loggedIn) {
      mixpanel.identify(userStore.userDetails.id);
      mixpanel.people.set({
        $email: userStore.email,
        name: userStore.userDetails.user_name,
        twitter: userStore.userDetails.twitter,
        grad_year: userStore.nft?.graduation_year,
        state: userStore.nft?.usa_state,
        minted: userStore.nft?.minted,
      });
      update({
        name: userStore.userDetails.user_name,
        email: userStore.email,
        userId: userStore.userDetails.id,
        avatar: {
          type: "avatar",
          imageUrl: userStore.avatar_url,
        },
        customAttributes: {
          twitter: userStore.userDetails.twitter,
          grad_year: userStore.nft?.graduation_year,
          state: userStore.nft?.usa_state,
          minted: userStore.nft?.minted,
        },
      });
    }
  }, [boot, userStore.loggedIn, userStore.loaded]);

  useEffect(() => {
    bootWithProps();
  }, [router.query, userStore.loaded]);


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
