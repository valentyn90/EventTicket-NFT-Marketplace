import { HamburgerIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  IconButton,
  Spacer,
  Stack,
  TabIndicator,
  TabList,
  Tabs,
  useColorModeValue as mode,
  useDisclosure,
} from "@chakra-ui/react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import React, { isValidElement, ReactElement } from "react";
import { MobileNavContent } from "./MobileNavContent";

export const Template: React.FC = (props) => {
  const children = React.Children.toArray(props.children).filter<ReactElement>(
    isValidElement
  );
  const mobileNav = useDisclosure();
  const MARKET_ENABLED = process.env.NEXT_PUBLIC_ENABLE_MARKETPLACE === "true";
  return (
    <Flex
      top={0}
      width="100%"
      position="fixed"
      zIndex={9999}
      py={2}
      px={{ base: 2, md: 4, lg: 6 }}
      bg={mode("white", "gray.800")}
      boxShadow="xl"
      borderBottomWidth={mode("0", "1px")}
      align="center"
    >
      {children.find((child) => child.type === Brand)?.props.children}
      <HStack display={{ base: "none", lg: "flex" }} marginStart={10}>
        <Tabs colorScheme="blue" variant="unstyled" align="center" isFitted defaultIndex={4}>
          <TabList>
            {children.find((child) => child.type === Links)?.props.children}
          </TabList>
          <TabIndicator
            position="absolute"
            mt="6px"
            height={1}
            borderTopRadius="md"
            bg={mode("blue.500", "blue.200")}
          />
        </Tabs>
      </HStack>
      <Spacer />
      {children.find((child) => child.type === ColorMode)?.props.children}
      <HStack display={{ base: "none", lg: "flex" }} spacing={3}>
        {children.find((child) => child.type === UserProfile)?.props.children}
      </HStack>
      <HStack display={{ base: "none", lg: "flex" }} spacing={3}>
        {children.find((child) => child.type === SignIn)?.props.children}
      </HStack>

      <Box display={["block", "block", "block", "none"]} mr={4}>
        {MARKET_ENABLED && (
          <WalletMultiButton className="solana-wallet-multi-btn" />
        )}
      </Box>

      <IconButton
        display={{ base: "flex", lg: "none" }}
        size="sm"
        aria-label="Open menu"
        fontSize="20px"
        variant="ghost"
        onClick={mobileNav.onOpen}
        icon={<HamburgerIcon />}
      />

      <MobileNavContent isOpen={mobileNav.isOpen} onClose={mobileNav.onClose}>
        <Stack spacing={5}>
          <Flex>
            {children.find((child) => child.type === Brand)?.props.children}
          </Flex>
          <Tabs
            onClick={mobileNav.onClose}
            orientation="vertical"
            variant="unstyled"
          >
            <TabList>
              {children.find((child) => child.type === Links)?.props.children}
            </TabList>
            <TabIndicator
              marginStart="-3"
              width={1}
              borderTopRadius={{ base: "none", lg: "md" }}
              bg={mode("blue.500", "blue.200")}
            />
          </Tabs>
          <Divider />

          <Flex onClick={mobileNav.onClose}>
            {
              children.find((child) => child.type === UserProfile)?.props
                .children
            }
            {children.find((child) => child.type === SignIn)?.props.children}
          </Flex>
          {
            children.find((child) => child.type === ColorModeMobile)?.props
              .children
          }
        </Stack>
      </MobileNavContent>
    </Flex>
  );
};

const Brand: React.FC = () => null;
const Links: React.FC = () => null;
const UserProfile: React.FC = () => null;
const SignIn: React.FC = () => null;
const ColorMode: React.FC = () => null;
const ColorModeMobile: React.FC = () => null;

export const Navbar = Object.assign(Template, {
  Brand,
  Links,
  UserProfile,
  SignIn,
  ColorMode,
  ColorModeMobile,
});
