import StaticCard from "@/components/NftCard/StaticCard";
import AppModal from "@/components/ui/AppModal";
import { supabase } from "@/supabase/supabase-client";
import { Box, Container, Flex, Grid, Heading, HStack, Image, Spacer, Spinner, Text, useColorModeValue, VStack } from "@chakra-ui/react";
import { CannotMatchFreeSalesWithoutAuctionHouseOrSellerSignoffError } from "@metaplex-foundation/mpl-auction-house/dist/src/generated";
import { now } from "lodash";
import { NextApiRequest } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";



const Drops: React.FC = () => {

  const logoColor = useColorModeValue("blue.500", "white");
  const selectedColor = "#004785";
  const secondaryColor = "#004785"; //004785
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [activeDrops, setActiveDrops] = useState<any[]>([]);
  const [announcedDrops, setAnnouncedDrops] = useState<any[]>([]);

  useEffect(() => {

    const getDropData = async () => {
      const { data: challenge_data } = await supabase.from('drop').select('*').order('id', { ascending: false })

      // const {data: teams} = await supabase.from('school').select('*')

      if (challenge_data) {
        const activeDrops = challenge_data.filter(
          (drop) => new Date(drop.drop_start).valueOf() < Date.now() && !drop.drop_ended
        )
        setActiveDrops(activeDrops)

        const announcedDrops = challenge_data.filter(
          (drop) => new Date(drop.drop_start).valueOf() > Date.now() && !drop.drop_ended
        )
        setAnnouncedDrops(announcedDrops)
      }

      console.table(announcedDrops)

    }

    getDropData()


  }, [])

  const meta = (
    <Head>
      <title>VerifiedInk Drops</title>
      <meta
        property="og:title"
        key="title"
        content={`VerifiedInk Drops`}
      />
      <meta
        property="og:image"
        key="preview"
        content={`/img/drops.png`}
      />
      {/*<meta
            property="twitter:image"
            key="twitter-image"
            content={`https://verifiedink.us/api/meta/showTwitterPreview/${drop_data.nfts[0]}`}
        />
         <meta property="og:video" content="https://verifiedink.us/img/naas/naas-card.mp4" />
        <meta property="og:video:type" content="video/mp4" />
        <meta property="og:video:width" content="720" />
        <meta property="og:video:height" content="720" /> */}
    </Head>
  )

  return (
    <Container maxW="8xl" mb={8}>
      <Box
        position={"fixed"}
        zIndex={-1}
        background={`radial-gradient(
                    1000px 500px at top right, ${selectedColor}, ${selectedColor}05 90%)
                    , radial-gradient(
                      500px 500px at bottom left, ${secondaryColor}, ${secondaryColor}05 90% )
                    , top right url('/img/background-overlay.png')
                    
                    `}
        backgroundRepeat="no-repeat"
        backgroundColor={"blueBlack"}
        height="100vh"
        width="100%"
        right="0px"
      >
        {/* <Image
          position="fixed"
          right="10%"
          src={`https://epfccsgtnbatrzapewjg.supabase.co/storage/v1/object/public/private/teams/${19}.png`}
          opacity={0.5}
        /> */}

      </Box>

      <Box align="center" py="4" minH="calc(100vh - 280px)">

        <Spacer h="56px" />
        <Flex mt={2} align="center" justify="center">
          <Heading
            color={logoColor}
          // textTransform="uppercase"


          >
            Verified Drops
          </Heading>
        </Flex>
        <Text
          mt={2}
          mb={4}
          width={["100%", "100%", "xl"]}
          textAlign="center"
          colorScheme="gray"
          fontSize={["l", "l", "xl"]}
        >
          Tomorrow's Stars Today! <br></br>
        </Text>
        {loading ?
          <Spinner size="xl" /> :
          <Grid

            pt={6}
            templateColumns={{
              base: "repeat(auto-fit, 166px)",
              sm: "repeat(auto-fit, 170px)",
              md: "repeat(auto-fit, 230px)",
              lg: "repeat(auto-fit, 250px)",
            }}
            justifyContent={["space-around", "space-around", "center"]}
            justifyItems="center"
            gap={[2, 4, 6]}
          >

            {announcedDrops.map((challenge, index) => {

              return (
                <VStack key={index} p={2} bg="blueBlack" borderRadius={6} border="2px" borderColor="blueBlack2" onClick={() => { setLoading(true); router.push(`/drops/${challenge.id}`) }}>
                  <StaticCard nft_id={challenge.nfts[2]} width={150} />
                  <Heading size="sm">
                    Drops {new Date(challenge.drop_start).toLocaleDateString('en-us', { day:"numeric", month:"short"})} @ {new Date(challenge.drop_start).toLocaleTimeString('en-us', { hour: 'numeric', minute: 'numeric', hour12: true })}
                  </Heading>
                </VStack>
              )
            })}
            <VStack p={2} bg="blueBlack" borderRadius={6} border="2px" borderColor="blueBlack2" onClick={() => { setLoading(true); router.push(`/drops/naas`) }}>
              <StaticCard nft_id={1160} width={150} />
              <Heading size="sm">
                Naas Cunningham's Drop
              </Heading>
            </VStack>
            {activeDrops.map((challenge, index) => {

              return (
                <VStack key={index} p={2} bg="blueBlack" borderRadius={6} border="2px" borderColor="blueBlack2" onClick={() => { setLoading(true); router.push(`/drops/${challenge.id}`) }}>
                  <StaticCard nft_id={challenge.nfts[2]} width={150} />
                  <Heading size="sm">
                    {challenge.player_name}'s Drop
                  </Heading>
                </VStack>
              )
            })}


          </Grid>
        }



      </Box>
      {meta}
    </Container>
  );
};

export async function getServerSideProps(context: any) {


  // const params = context.query 
  // let queryString = "?" + Object.keys(params).map(key => key + '=' + params[key]).join('&');

  // (queryString === "?") ? queryString = "" : null;

  // return {
  //   redirect: {
  //     destination: `/challenge/1` + queryString,
  //     permanent: false,
  //   },
  // }

  return {
    props: {}
  }
}

export default Drops;

