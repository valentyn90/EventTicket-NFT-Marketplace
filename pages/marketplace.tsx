import CardList from "@/components/NftCard/CardList";
import AppModal from "@/components/ui/AppModal";
import ViLogo from "@/components/ui/logos/ViLogo";
import userStore from "@/mobx/UserStore";
import { getNftItems, getMintedNfts } from "@/supabase/marketplace";
import ListingData from "@/types/ListingData";
import MarketplaceNft from "@/types/MarketplaceNft";
import Nft from "@/types/Nft";
import NftItem from "@/types/NftItem";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { Box, Container, Flex, Text } from "@chakra-ui/layout";
import { Input } from "@chakra-ui/react";
import { pick } from "lodash";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";

const Marketplace: React.FC = () => {
  const logoColor = useColorModeValue("blue.500", "white");
  const [marketplaceNfts, setMarketplaceNfts] = useState<NftItem[]>([]);
  const [filteredNfts, setFilteredNfts] = useState<NftItem[]>([]);

  const [value, setValue] = useState('')
  const handleChange = (event: any) => setValue(event.target.value)

  useEffect(() => {
    getNftItems().then((res) => {
      setMarketplaceNfts([...res])
      setFilteredNfts([...res])
    })

  }, [userStore.ui.refetchMarketplace]);

  useEffect(() => {

    function activateFilter() {if (marketplaceNfts.length > 0) {
      if (value === "") {
        setFilteredNfts(marketplaceNfts)
        return
      }
      const filtered = marketplaceNfts.filter(nft => {
        const subset = pick(nft.nft, ['first_name', 'last_name', 'graduation_year', 'high_school', 'usa_state', 'sport', 'sport_position']);
        if (
          JSON.stringify(subset).toLowerCase().includes(value.toLowerCase())
        ) {
          return nft
        }
      })
      setFilteredNfts(filtered)
    }
  }

    const timeOutId = setTimeout(() => activateFilter(), 500);
    return () => clearTimeout(timeOutId);
  }, [value])

  return (
    <Container maxW="8xl" mb={8}>
      <Box align="center" py="4">
        <Flex mt={2} align="center" justify="center">
          <Text
            color={logoColor}
            textTransform="uppercase"
            fontWeight="semibold"
            fontSize="3xl"
            mr={1}
          >
            Marketplace
          </Text>
        </Flex>
        <Text
          mt={2}
          mb={4}
          width={["100%","100%","xl"]}
          textAlign="center"
          colorScheme="gray"
          fontSize={["l", "l", "xl"]}
        >
          80%+ of Sales go directly to our Athletes <br></br> Purchase with Credit Card or Crypto in seconds
        </Text>

        <Box w={["100%", "50%"]}>
          <Input
            value={value}
            onChange={handleChange}
            placeholder="Search"
            variant="outline"
          />
        </Box>

        <CardList listType="marketplace" marketplaceNfts={filteredNfts} />
        <AppModal />
      </Box>
    </Container>
  );
};

export default observer(Marketplace);
