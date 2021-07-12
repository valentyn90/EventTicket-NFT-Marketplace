import { Avatar, Flex, HStack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import * as React from "react";
import { BsChevronDown } from "react-icons/bs";

interface Props {
  name: string;
  email: string;
  avatarUrl: string | null;
}

export const UserProfile: React.FC<Props> = (props) => {
  const { name, email, avatarUrl } = props;

  return (
    <Flex order={{ base: 1, md: 2 }} align="center">
      <NextLink href="/profile">
        <a>
          <HStack spacing={1} order={{ base: 1 }} flex="1" cursor="pointer">
            <Avatar name={name} src={avatarUrl || ""} size="sm" />
            <Flex direction="column" display={{ base: "flex", md: "none" }}>
              <Text fontWeight="bold" lineHeight="shorter">
                {name}
              </Text>
              <Text fontSize="sm" lineHeight="shorter" opacity={0.7}>
                {email}
              </Text>
            </Flex>
          </HStack>
        </a>
      </NextLink>
      <Flex order={{ base: 2 }} ml=".5rem">
        <BsChevronDown />
      </Flex>
    </Flex>
  );
};
