import { HStack, Text } from "@chakra-ui/layout";
import { Box, Icon, Stack, StackDivider } from "@chakra-ui/react";

import LogoLandscape from "@/svgs/LogoLandscape";
import Link from "next/link";
import React from "react";
import { FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
import { LinkGrid } from "./LinkGrid";

export const Footer: React.FC = (props) => {
  return (
    <Box
      as="footer"
      role="contentinfo"
      mx="auto"
      //   maxW="7xl"
      py="12"
      bg={"blueBlack"}
      px={{ base: "4", md: "8" }}
    >
      <Stack spacing="4" divider={<StackDivider />} maxW="7xl" mx="auto">
        <Stack
          direction={{ base: "column", lg: "row" }}
          spacing={{ base: "10", lg: "28" }}
        >
          <Box flex="1">
            <Link href="/">
              <a>
                <HStack height="100%" justifyContent={["center","flex-start","flex-start"]}>
                  <LogoLandscape />
                </HStack>
              </a>
            </Link>
          </Box>
          <Stack
            direction={{ base: "column", md: "row" }}
            spacing={{ base: "10", md: "20" }}
          >
            <LinkGrid />
          </Stack>
        </Stack>
        <Stack
          direction={{ base: "column-reverse", md: "row" }}
          justifyContent="space-between"
          alignItems="center"
        >
          <Text fontSize="xs">
            &copy; {new Date().getFullYear()} VerifiedInk, Inc. All rights
            reserved.
          </Text>
          <HStack columns={2} spacing="4" color="subtle">
            <Link href={"https://twitter.com/VfdInk"}>
              <Icon boxSize="8">
                <FaTwitter />
              </Icon>
            </Link>
            <Link href={"https://www.linkedin.com/company/verifiedink/"}>
              <Icon boxSize="8">
                <FaLinkedin />
              </Icon>
            </Link>
            <Link href={"https://www.instagram.com/vfdink/"}>
              <Icon boxSize="8">
                <FaInstagram />
              </Icon>
            </Link>
          </HStack>
        </Stack>
      </Stack>
    </Box>
  );
};

export default Footer;
