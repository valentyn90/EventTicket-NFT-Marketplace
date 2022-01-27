import userStore from "@/mobx/UserStore";
import { signOut } from "@/supabase/supabase-client";
import { ChevronDownIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import {
  Button,
  Flex,
  HStack,
  Box,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  VStack,
  useColorMode,
  Text,
  useColorModeValue,
  StylesProvider,
  styled,
} from "@chakra-ui/react";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { observer } from "mobx-react-lite";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import ViLogo from "../ui/logos/ViLogo";
import { Navbar } from "./Navbar";
import { NavTabLink } from "./NavTabLink";
import { UserProfile } from "./UserProfile";

const NavIndex: React.FC = () => {
  const router = useRouter();
  const logoColor = useColorModeValue("blue", "white");
  const { colorMode, toggleColorMode } = useColorMode();
  const [referralString, setReferralString] = useState("");

  const MARKET_ENABLED = process.env.NEXT_PUBLIC_ENABLE_MARKETPLACE === "true";

  useEffect(() => {
    if (router.query.referralCode) {
      setReferralString(`?referralCode=${router.query.referralCode}`);
    }
  }, [router.query]);

  return (
    <Navbar>
      <Navbar.Brand>
        <NextLink href="/">
          <a>
            <HStack height="100%">
              <ViLogo width="25px" height="25px" />
              <Flex align="center">
                <Text
                  color={logoColor}
                  textTransform="uppercase"
                  fontWeight="semibold"
                  fontSize="2xl"
                  ml={2}
                >
                  Verified
                </Text>
                <Text
                  marginTop="unset"
                  fontWeight="light"
                  alignSelf="flex-start"
                  textTransform="uppercase"
                  fontSize="2xl"
                >
                  Ink
                </Text>
              </Flex>
            </HStack>
          </a>
        </NextLink>
      </Navbar.Brand>
      <Navbar.Links>
        <NavTabLink>Create</NavTabLink>
        <NavTabLink>Marketplace</NavTabLink>
        {userStore.loggedIn && <NavTabLink>Collection</NavTabLink>}
        {userStore.loggedIn && MARKET_ENABLED && (
          <NavTabLink>Listings</NavTabLink>
        )}
      </Navbar.Links>
      {/* <Navbar.ColorMode>
        <Button
          mr={2}
          onClick={toggleColorMode}
          colorScheme="blue"
          variant="ghost"
          display={["none", "none", "block"]}
        >
          {colorMode === "light" ? <SunIcon /> : <MoonIcon />}
        </Button>
      </Navbar.ColorMode> */}
      {!userStore.loggedIn ? (
        <Navbar.SignIn>
          <NextLink href="/signin">
            <a>
              <Button variant="ghost" colorScheme="blue">
                Sign In
              </Button>
            </a>
          </NextLink>
          <NextLink href={`/signup/${referralString}`}>
            <a>
              <Button colorScheme="blue" color="white">
                Sign Up For Free
              </Button>
            </a>
          </NextLink>

          <Box display={["none", "none", "none", "block"]}>
            {/* only show in desktop, mobile view set in Navbar.tsx */}
            {MARKET_ENABLED && (
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

            <NextLink href="/recruit">
              <a>
                <Button
                  colorScheme="blue"
                  color="white"
                  variant="outline"
                  order={{ base: 2, lg: 1 }}
                  mr={[0, 0, 0, 2]}
                  mt={[6, 6, 6, 0]}
                  mb={[2, 2, 2, 0]}
                  minW="93px"
                >
                  Recruit
                </Button>
              </a>
            </NextLink>
            <Box display={["none", "none", "none", "block"]}>
              {/* only show in desktop, mobile view set in Navbar.tsx */}
              {MARKET_ENABLED && (
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
                    <NextLink href="/profile">
                      <a style={{ width: "100%" }}>Profile</a>
                    </NextLink>
                  </MenuItem>
                  <Box w="100%" p="0.4rem 0.8rem">
                    <Button colorScheme="blue" color="white" onClick={signOut}>
                      Logout
                    </Button>
                  </Box>
                </MenuList>
              </Menu>
            </Box>
          </Flex>
        </Navbar.UserProfile>
      )}
      {/* <Navbar.ColorModeMobile>
        <Button
          mr={4}
          onClick={toggleColorMode}
          colorScheme="blue"
          variant="ghost"
          display={["block", "block", "none"]}
          alignSelf="start"
        >
          {colorMode === "light" ? <SunIcon /> : <MoonIcon />}
        </Button>
      </Navbar.ColorModeMobile> */}
    </Navbar>
  );
};

export default observer(NavIndex);
