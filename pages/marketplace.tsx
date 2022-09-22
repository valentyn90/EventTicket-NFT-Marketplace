import CardList from "@/components/NftCard/CardList";
import AppModal from "@/components/ui/AppModal";
import Filter from "@/components/ui/Filters/filter";
import ViLogo from "@/components/ui/logos/ViLogo";
import userStore from "@/mobx/UserStore";
import { getNftItems, getMintedNfts } from "@/supabase/marketplace";
import ListingData from "@/types/ListingData";
import MarketplaceNft from "@/types/MarketplaceNft";
import Nft from "@/types/Nft";
import NftItem from "@/types/NftItem";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { Box, Container, Flex, Text } from "@chakra-ui/layout";
import { Stack, Image, Input, VStack, Spacer } from "@chakra-ui/react";
import { pick } from "lodash";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const Marketplace: React.FC = () => {
  const logoColor = useColorModeValue("blue.500", "white");
  const [marketplaceNfts, setMarketplaceNfts] = useState<NftItem[]>([]);
  const [filteredNfts, setFilteredNfts] = useState<NftItem[]>([]);
  const [color, setColor] = useState("#0D9DE5");
  const [colorSecondary, setColorSecondary] = useState("#0D9DE5");
  const [teamId, setTeamId] = useState<number>();
  const [teamName, setTeamName] = useState<string>();

  const [beginFilter, setBeginFilter] = useState<any>();
  const [showPack, setShowPack] = useState<number>();


  const [value, setValue] = useState("");
  const handleChange = (event: any) => setValue(event.target.value);

  const router = useRouter();

  useEffect(() => {
    getNftItems().then((res) => {
      setMarketplaceNfts([...res]);
    });
  }, [userStore.ui.refetchMarketplace]);

  useEffect(() => {
    function activateFilter() {
      if (marketplaceNfts.length > 0) {
        if (value === "" && teamId === undefined) {
          setFilteredNfts(marketplaceNfts);
          return;
        }
        else if (value === "" && teamId !== undefined) {
          console.log(teamId)
          teamId===19 ?
            setShowPack(teamId) : setShowPack(-1)
          
          const filtered = marketplaceNfts.filter((nft) => {
            return nft.nft.high_school === teamName;
          });
          setFilteredNfts(filtered);
          return;
        }
        const filtered = marketplaceNfts.filter((nft) => {
          const subset = pick(nft.nft, [
            "first_name",
            "last_name",
            "graduation_year",
            "high_school",
            "usa_state",
            "sport",
            "sport_position",
          ]);
          if (
            JSON.stringify(subset).toLowerCase().includes(value.toLowerCase())
            && (
              nft.nft.high_school === teamName || teamId === undefined
            )

          ) {
            return nft;
          }
        });
        setFilteredNfts(filtered);
      }
    }

    const timeOutId = setTimeout(() => activateFilter(), 500);
    return () => clearTimeout(timeOutId);
  }, [value,teamId,marketplaceNfts]);

  useEffect(() => {
    if(router){
      const { query } = router;
      if(query.team){
        setBeginFilter({school: query.team});
      }
    }
  },[router])

  const updateQuery = (newQuery:string) => {
    newQuery==="" ? router.push("/marketplace") :
    router.push({
        query: { team: encodeURI(newQuery) },
    });
};

  useEffect(() => {
    if (userStore.ui.marketplaceFilter[0]) {
      updateQuery(userStore.ui.marketplaceFilter[0].school);
      setColor(userStore.ui.marketplaceFilter[0].color);
      userStore.ui.marketplaceFilter[0].color_secondary ?
        setColorSecondary(userStore.ui.marketplaceFilter[0].color_secondary) :
        setColorSecondary(userStore.ui.marketplaceFilter[0].color)
        setTeamId(userStore.ui.marketplaceFilter[0].id)
        setTeamName(userStore.ui.marketplaceFilter[0].school)
    }
    else{
      setColor("#0D9DE5");
      setColorSecondary("#0D9DE5");
      setTeamId(undefined)
      setTeamName(undefined)
      updateQuery("")
    }
  }, [userStore.ui.marketplaceFilter]);

  return (
    <Container maxW="8xl" mb={8} >
      <Spacer h="56px" display={["none", "none", "block"]} />
      <Box
        position={"fixed"}
        zIndex={-1}
        background={`radial-gradient(
                    1000px 500px at top right, ${color}, ${color}05 90%)
                    , radial-gradient(
                      500px 500px at bottom left, ${colorSecondary}, ${colorSecondary}05 90% )
                    , top right 10% url('https://epfccsgtnbatrzapewjg.supabase.co/storage/v1/object/public/private/teams/${teamId ? teamId : "vfd"}.png')
                    , top right url('/img/background-overlay.png')
                    , bottom left url('/img/background-overlay-bottom.png')
                    
                    `}
        backgroundSize={`auto, auto, 250px, auto, auto`}
        backgroundRepeat="no-repeat"
        backgroundColor={"blueBlack"}
        height="100vh"
        width="100%"
        right="0px"
      >
      </Box>
      <Box align="center" py="4" minH="80vh">
        <Spacer h="56px" display={["block", "block", "none"]} />
        { teamId && 
        <Image  w="200px" display={["block", "block", "none"]} src={`https://epfccsgtnbatrzapewjg.supabase.co/storage/v1/object/public/private/teams/${teamId ? teamId : "vfd"}.png`} />
        }
        <VStack mt={2} align="center" justify="center" backdropFilter="blur(10px)"
          backgroundColor={"blueBlackTransparent"}
          p="3"
          borderRadius="lg"
          w="fit-content"
        >
          <Text
            color={logoColor}
            textTransform="uppercase"
            fontWeight="semibold"
            fontSize="3xl"
            mr={1}
          >
            Marketplace
          </Text>

          <Text
            mt={2}
            mb={4}
            // width={["100%", "100%", "xl"]}
            textAlign="center"
            colorScheme="gray"
            fontSize={["l", "l", "xl"]}

          >
            80%+ of Sales go directly to our Athletes <br></br> Purchase with Credit Card or Crypto in seconds
          </Text>
        </VStack>

        <Stack
          direction={["column-reverse", "column-reverse", "row"]}
          justifyContent="center"
          gridGap="2"
          alignItems={"center"}
          pt={4}
        >
          <Filter beginFilter={beginFilter}></Filter>

          <Input
            w={["100%", "50%"]}
            maxW="500px"
            id="search"
            value={value}
            onChange={handleChange}
            placeholder="Search"
            variant="outline"
            borderColor={"#4e5ab5"}
            border="1px"
            backdropFilter={"blur(10px)"}
            backgroundColor={"blueBlackTransparent"}
          />
        </Stack>

        <CardList listType="marketplace" marketplaceNfts={filteredNfts} showPack={showPack} />
        <AppModal />
      </Box>
    </Container>
  );
};

export default observer(Marketplace);
