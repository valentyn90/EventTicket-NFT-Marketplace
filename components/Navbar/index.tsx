import userStore from "@/mobx/UserStore";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import {
  Button,
  Flex,
  HStack,
  Text,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import NextLink from "next/link";
import * as React from "react";
import ViLogo from "../ui/logos/ViLogo";
import { Navbar } from "./Navbar";
import { NavTabLink } from "./NavTabLink";
import { UserProfile } from "./UserProfile";

const NavIndex: React.FC = () => {
  const logoColor = useColorModeValue("blue", "white");
  const { colorMode, toggleColorMode } = useColorMode();

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
      </Navbar.Links>
      <Navbar.ColorMode>
        <Button
          mr={2}
          onClick={toggleColorMode}
          colorScheme="blue"
          variant="ghost"
          display={["none", "none", "block"]}
        >
          {colorMode === "light" ? <SunIcon /> : <MoonIcon />}
        </Button>
      </Navbar.ColorMode>
      {!userStore.loggedIn ? (
        <Navbar.SignIn>
          <NextLink href="/signin">
            <a>
              <Button variant="ghost" colorScheme="blue">
                Sign In
              </Button>
            </a>
          </NextLink>
          <NextLink href="/signin">
            <a>
              <Button colorScheme="blue" color="white">
                Sign Up For Free
              </Button>
            </a>
          </NextLink>
        </Navbar.SignIn>
      ) : (
        <Navbar.UserProfile>
          <Flex
            direction={["column", "column", "row"]}
            align={["flex-start", "flex-start", "center"]}
          >
            <Button
              colorScheme="blue"
              color="white"
              order={{ base: 2, md: 1 }}
              mr={[0, 0, 2]}
              mt={[6, 6, 0]}
            >
              Recruit
            </Button>
            <UserProfile
              name={userStore.name}
              avatarUrl={userStore.avatar_url}
              email={userStore.email}
            />
          </Flex>
        </Navbar.UserProfile>
      )}
      <Navbar.ColorModeMobile>
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
      </Navbar.ColorModeMobile>
    </Navbar>
  );
};

export default observer(NavIndex);
