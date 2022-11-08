import CardPicture from "@/components/NftCard/CardPicture";
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
  const [selectedColor, setSelectedColor] = useState("#004785");
  const [secondaryColor, setSecondaryColor] = useState("#004785");
  const [teamId, setTeamId] = useState(1);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [activeDrops, setActiveDrops] = useState<any[]>([]);
  const [announcedDrops, setAnnouncedDrops] = useState<any[]>([]);

  useEffect(() => {

    const getDropData = async () => {
      const { data: drop_data, error } = await supabase.from('drop').select('*, nft!drop_premium_nft_fkey(high_school)').order('order').order('drop_start', { ascending: false })

      if (drop_data) {
        const activeDrops = drop_data.filter(
          (drop) => new Date(drop.drop_start).valueOf() < Date.now() //&& !drop.drop_ended
                    && drop.nft.high_school === 'Pepperdine'
        )
        setActiveDrops(activeDrops)

        const announcedDrops = drop_data.filter(
          (drop) => new Date(drop.drop_start).valueOf() > Date.now() //&& !drop.drop_ended
            && drop.nft.high_school === 'Pepperdine'
        )
        setAnnouncedDrops(announcedDrops)
      }

      const { data: school_data } = await supabase.from('school').select('*').eq('school', 'Pepperdine')

      if(school_data) {
        console.log(school_data)
        setSelectedColor(school_data[0].color)
        setSecondaryColor(school_data[0].color_secondary)
        setTeamId(school_data[0].id)
      }

    }

    getDropData()


  }, [])

  const meta = (
    <Head>
      <title>Pepperdine MB VerifiedInk Drops</title>
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
                      , top right 10% url('https://epfccsgtnbatrzapewjg.supabase.co/storage/v1/object/public/private/teams/${teamId ? teamId : "vfd"}.png')
                    , top right url('/img/background-overlay.png')
                    
                    `}
        backgroundSize={`auto, auto, 250px, auto`}
        backgroundRepeat="no-repeat"
        backgroundColor={"blueBlack"}
        height="100vh"
        width="100%"
        right="0px"
      >
      </Box>

      <Box align="center" py="4" minH="calc(100vh - 280px)">

        <Spacer h={["0px","0px","56px"]} />
        { teamId && 
        <Image  w="200px" display={["block", "block", "none"]} src={`https://epfccsgtnbatrzapewjg.supabase.co/storage/v1/object/public/private/teams/${teamId ? teamId : "vfd"}.png`} />
        }
        <Flex mt={[-2,-2,2]} align="center" justify="center">
          <Heading
            color={logoColor}
          // textTransform="uppercase"
          >
            Pepperdine Men's Basketball
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
          Support your favorite Pepperdine athletes. 90% of all proceeds go directly to the player. <br></br>
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
                  <CardPicture nft_id={challenge.nfts[2]} width={140} glow={true}/>
                  <Heading size="sm">
                    Drops {new Date(challenge.drop_start).toLocaleDateString('en-us', { day:"numeric", month:"short"})} @ {new Date(challenge.drop_start).toLocaleTimeString('en-us', { hour: 'numeric', minute: 'numeric', hour12: true })}
                  </Heading>
                </VStack>
              )
            })}
            {activeDrops.map((challenge, index) => {

              return (
                <VStack key={index} p={2} bg="blueBlackTransparent" borderRadius={6} border="2px" borderColor="blueBlack2" onClick={() => { setLoading(true); router.push(`/drops/${challenge.id}`) }}>
                  {/* <StaticCard nft_id={challenge.nfts[2]} width={150} /> */}
                  <CardPicture nft_id={challenge.nfts[2]} width={140} glow={true}/>
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

