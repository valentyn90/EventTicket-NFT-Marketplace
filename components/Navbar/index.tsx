import { useUser } from "@/utils/useUser";
import { Button, Center, Text, Flex, Box } from "@chakra-ui/react";
import NextLink from "next/link";
import * as React from "react";
import { FiPenTool } from "react-icons/fi";
import { Navbar } from "./Navbar";
import { NavTabLink } from "./NavTabLink";
import { UserProfile } from "./UserProfile";

const NavIndex: React.FC = () => {
  const { user } = useUser();

  return (
    <Navbar>
      <Navbar.Brand>
        <Box>
          <NextLink href="/">
            <a>
              <Center marginEnd={6} style={{ cursor: "pointer" }}>
                <FiPenTool
                  color="0085FF"
                  size={25}
                  style={{ transform: "rotate(-90deg)" }}
                />
                <Text fontSize="2xl" ml={2}>
                  Verified Ink
                </Text>
              </Center>
            </a>
          </NextLink>
        </Box>
      </Navbar.Brand>
      <Navbar.Links>
        <NavTabLink>Create</NavTabLink>
        <NavTabLink>Marketplace</NavTabLink>
      </Navbar.Links>
      {user !== null ? (
        <Navbar.UserProfile>
          <Flex
            direction={["column", "column", "row"]}
            align={["flex-start", "flex-start", "center"]}
          >
            <Button
              colorScheme="blue"
              order={{ base: 2, md: 1 }}
              mr={[0, 0, 2]}
              mt={[2, 2, 0]}
            >
              Recruit
            </Button>
            <UserProfile
              name={user.name}
              avatarUrl={user.user_metadata.avatar_url}
              email={user.email}
            />
          </Flex>
        </Navbar.UserProfile>
      ) : (
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
              <Button colorScheme="blue">Sign Up For Free</Button>
            </a>
          </NextLink>
        </Navbar.SignIn>
      )}
    </Navbar>
  );
};

export default NavIndex;
