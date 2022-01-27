import CardList from "@/components/NftCard/CardList";
import AppModal from "@/components/ui/AppModal";
import ViLogo from "@/components/ui/logos/ViLogo";
import userStore from "@/mobx/UserStore";
import { getMarketplaceNfts, getMintedNfts } from "@/supabase/marketplace";
import MarketplaceNft from "@/types/MarketplaceNft";
import Nft from "@/types/Nft";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { Box, Container, Flex, Text } from "@chakra-ui/layout";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";

const Marketplace: React.FC = () => {
  const marketplaceText = `Verified Ink cards are limited run NFTs created and minted by High School athletes. The marketplace isn’t live yet, but you can view all minted cards here.`;
  const logoColor = useColorModeValue("blue.500", "white");

  const [marketplaceNfts, setMarketplaceNfts] = useState<MarketplaceNft[]>([]);
  useEffect(() => {
    getMarketplaceNfts().then((res) => setMarketplaceNfts([...res]));
  }, [userStore.ui.refetchMarketplace]);

  return (
    <Container maxW="8xl" mb={8}>
      <Box align="center" py="12">
        <ViLogo width="150px" height="150px" />
        <Flex mt={2} align="center" justify="center">
          <Text
            color={logoColor}
            textTransform="uppercase"
            fontWeight="semibold"
            fontSize="4xl"
            mr={1}
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
          maxW={"3xl"}
          textAlign="start"
          colorScheme="gray"
          fontSize={["l", "l", "xl"]}
        >
          {marketplaceText}
        </Text>

        <CardList listType="marketplace" marketplaceNfts={marketplaceNfts} />
        <AppModal />
      </Box>
    </Container>
  );
};

export default observer(Marketplace);
