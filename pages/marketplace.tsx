import CardModal from "@/components/Marketplace/CardModal";
import MarketplaceCardList from "@/components/Marketplace/MarketplaceCardList";
import ViLogo from "@/components/ui/logos/ViLogo";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { Box, Container, Flex, Text } from "@chakra-ui/layout";
import { observer } from "mobx-react-lite";
import React from "react";

const Marketplace: React.FC = () => {
  const logoColor = useColorModeValue("blue", "white");
  return (
    <Container maxW="3xl" mb={8}>
      <Box align="center" pt={8}>
        <ViLogo width="150px" height="150px" />
        <Flex mt={2} align="center" justify="center">
          <Text
            color={logoColor}
            textTransform="uppercase"
            fontWeight="semibold"
            fontSize="4xl"
            mr={2}
          >
            Verified
          </Text>
          <Text
            fontWeight="light"
            alignSelf="flex-start"
            textTransform="uppercase"
            fontSize="4xl"
          >
            Ink
          </Text>
        </Flex>
        <Text mt={2} mb={4} textAlign="start" colorScheme="gray" fontSize={["l", "l", "xl"]}>
          Verified Ink cards are limited run NFTs created and minted by High
          School athletes. The marketplace isn’t live yet, but you can view all
          minted cards here.{" "}
        </Text>
        <MarketplaceCardList />
        <CardModal />
      </Box>
    </Container>
  );
};

export default observer(Marketplace);
