import userStore from "@/mobx/UserStore";
import { signOut } from "@/supabase/supabase-client";
import LogoLandscapeTransparent from "@/svgs/LogoLandscapeTransparent";
import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  VStack,
} from "@chakra-ui/react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import cookieCutter from "cookie-cutter";
import mixpanel from "mixpanel-browser";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import { useIntercom } from "react-use-intercom";
import { Navbar } from "./Navbar";
import { NavTabLink } from "./NavTabLink";
import { UserProfile } from "./UserProfile";

const NavIndex: React.FC = () => {
  const router = useRouter();
  const [referralString, setReferralString] = useState("");
  const { boot, update } = useIntercom();
  mixpanel.init("b78dc989c036b821147f68e00c354313");

  const MARKET_ENABLED = process.env.NEXT_PUBLIC_ENABLE_MARKETPLACE === "true";

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
    const sign_up = localStorage.getItem("sign_up");
    if (sign_up && sign_up === "completed") {
    } else {
      localStorage.setItem("sign_up", "true");
    }
    if (router.query.referralCode) {
      setReferralString(`?referralCode=${router.query.referralCode}`);
      localStorage.setItem(
        "referral_code",
        router.query.referralCode as string
      );
      cookieCutter.set("SplashBypass", "true");
    }
    if (router.query.program){
      cookieCutter.set("school", router.query.program,{ path: "/", expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365)});
    }
  }, [router.query]);

  useEffect(() => {
    bootWithProps();
  }, [router.query, userStore.loaded]);

  return (
    <>
      <Box zIndex="10000" position="absolute" left="50%">
        <span id="confettiReward" />
      </Box>
      <Navbar>
        <Navbar.Brand>
          <Link href="/">
            <a>
              <HStack
                height="100%"
                alignItems="flex-start"
                className="navbar-logo-wrapper"
              >
                <LogoLandscapeTransparent />
              </HStack>
            </a>
          </Link>
        </Navbar.Brand>
        <Navbar.Links>
          <NavTabLink>Athletes</NavTabLink>
          <NavTabLink>Marketplace</NavTabLink>
          <NavTabLink>Challenges</NavTabLink>
          <NavTabLink>Drops</NavTabLink>
          <NavTabLink>Blog</NavTabLink>
          {userStore.loggedIn && <NavTabLink>Collection</NavTabLink>}
          {userStore.loggedIn && MARKET_ENABLED && (
            <NavTabLink>Listings</NavTabLink>
          )}
        </Navbar.Links>
        {!userStore.loggedIn ? (
          <Navbar.SignIn>
            {router.pathname.toLowerCase().includes("athletes") ||
            router.pathname.toLowerCase().includes("create") ? (
              <Link href="/athletes/signin" prefetch={false}>
                <a>
                  <Button color="white" colorScheme="blue" borderRadius={1}>
                    Athlete Sign In
                  </Button>
                </a>
              </Link>
            ) : (
              <Link href="/marketplace/signin">
                <a>
                  <Button colorScheme="blue" variant="ghost" borderRadius={1}>
                    Sign In
                  </Button>
                </a>
              </Link>
            )}
            {/* <Link href={`/signup/${referralString}`}>
            <a>
            </a>
          </Link> */}

            <Box display={["none", "none", "none", "block"]}>
              {/* only show in desktop, mobile view set in Navbar.tsx */}
              {MARKET_ENABLED && router.pathname.includes("marketplace") && (
                <WalletMultiButton className="solana-wallet-multi-btn" />
              )}
            </Box>
          </Navbar.SignIn>
        ) : (
          <Navbar.UserProfile>
            <Flex
              direction={["column", "column", "column", "row"]}
              align={["flex-start", "flex-start", "flex-start", "center"]}
            >
              <Box display={["block", "block", "block", "none"]}>
                {/* Display mobile profile nav */}
                <UserProfile
                  name={userStore.userDetails.user_name}
                  avatarUrl={userStore.avatar_url}
                  email={userStore.email}
                />
                <VStack mt={4} align="start">
                  <Button
                    colorScheme="blue"
                    color="white"
                    onClick={signOut}
                    minW="93px"
                  >
                    Logout
                  </Button>
                </VStack>
              </Box>

              <Link href="/recruit">
                <a>
                  <Button
                    colorScheme="blue"
                    color="white"
                    variant="outline"
                    borderRadius={1}
                    order={{ base: 2, lg: 1 }}
                    mr={[0, 0, 0, 2]}
                    mt={[6, 6, 6, 0]}
                    mb={[2, 2, 2, 0]}
                    minW="93px"
                  >
                    Recruit
                  </Button>
                </a>
              </Link>
              <Box display={["none", "none", "none", "block"]}>
                {/* only show in desktop, mobile view set in Navbar.tsx */}
                {MARKET_ENABLED && router.pathname.includes("marketplace") && (
                  <WalletMultiButton className="solana-wallet-multi-btn" />
                )}
              </Box>

              <Box display={["none", "none", "none", "block"]}>
                {/* Display dropdown menu only in desktop */}
                <Menu>
                  <MenuButton
                    variant="transparent"
                    as={Button}
                    rightIcon={<ChevronDownIcon />}
                  >
                    <UserProfile
                      name={userStore.name}
                      avatarUrl={userStore.avatar_url}
                      email={userStore.email}
                    />
                  </MenuButton>
                  <MenuList>
                    <MenuItem>
                      <Link href="/profile">
                        <a style={{ width: "100%" }}>Profile</a>
                      </Link>
                    </MenuItem>
                    <Box w="100%" p="0.4rem 0.8rem">
                      <Button
                        colorScheme="blue"
                        color="white"
                        onClick={signOut}
                      >
                        Logout
                      </Button>
                    </Box>
                  </MenuList>
                </Menu>
              </Box>
            </Flex>
          </Navbar.UserProfile>
        )}
      </Navbar>
    </>
  );
};

export default observer(NavIndex);
