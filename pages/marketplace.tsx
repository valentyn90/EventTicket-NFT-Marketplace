import CardList from "@/components/NftCard/CardList";
import CardListItemModal from "@/components/NftCard/CardListItemModal";
import ViLogo from "@/components/ui/logos/ViLogo";
import { getMintedNfts } from "@/supabase/marketplace";
import Nft from "@/types/Nft";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { Box, Container, Flex, Text } from "@chakra-ui/layout";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";

const Marketplace: React.FC = () => {
  const logoColor = useColorModeValue("blue.500", "white");

  const [mintedNfts, setMintedNfts] = useState<Nft[]>([]);
  useEffect(() => {
    getMintedNfts().then((res) => setMintedNfts([...res]));
  }, []);

  return (
    <Container maxW="3xl" mb={8}>
      <Box align="center" py="12">
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
        <Text
          mt={2}
          mb={4}
          textAlign="start"
          colorScheme="gray"
          fontSize={["l", "l", "xl"]}
        >
          Verified Ink cards are limited run NFTs created and minted by High
          School athletes. The marketplace isn’t live yet, but you can view all
          minted cards here.{" "}
        </Text>
        <CardList listType="marketplace" nfts={mintedNfts} />
        <CardListItemModal />
      </Box>
    </Container>
  );
};

export default observer(Marketplace);
