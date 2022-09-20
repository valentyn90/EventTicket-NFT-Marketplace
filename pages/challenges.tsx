import CardPicture from "@/components/NftCard/CardPicture";
import StaticCard from "@/components/NftCard/StaticCard";
import AppModal from "@/components/ui/AppModal";
import { supabase } from "@/supabase/supabase-client";
import { Box, Container, Flex, Grid, Heading, HStack, Image, SimpleGrid, Spacer, Spinner, Stack, Text, useColorModeValue, VStack } from "@chakra-ui/react";
import { CannotMatchFreeSalesWithoutAuctionHouseOrSellerSignoffError } from "@metaplex-foundation/mpl-auction-house/dist/src/generated";
import { Int } from "@solana/buffer-layout";
import { NextApiRequest } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";



const Challenges: React.FC = () => {

  const logoColor = useColorModeValue("blue.500", "white");
  const selectedColor = "#004785";
  const secondaryColor = "#004785"; //004785
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [activeChallenges, setActiveChallenges] = useState<any[]>([]);
  const [comingSoonChallenges, setComingSoonChallenges] = useState<any[]>([]);

  useEffect(() => {

    const getChallengeData = async () => {
      const { data: challenge_data } = await supabase.from('fan_challenge').select('*')

      // const {data: teams} = await supabase.from('school').select('*')

      if (challenge_data) {

        setActiveChallenges(challenge_data.filter((challenge: any) => {
          return challenge.start_time < new Date().toISOString() && (challenge.end_time > new Date().toISOString() || challenge.end_time === null)
        }))

        setComingSoonChallenges(challenge_data.filter((challenge: any) => {
          return challenge.start_time > new Date().toISOString() && challenge.start_time < new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }))

      }

    }

    getChallengeData()


  }, [])

  useEffect(() => {
    console.table(comingSoonChallenges)
  }, [comingSoonChallenges])

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
            Verified Fan Challenge
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
          Show your Fandom! <br></br> Support elite athletes and your team.
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
            {comingSoonChallenges.map((challenge, index) => {

              return (
                <VStack key={index + "_comingSoon"} p={2} bg="blueBlack" borderRadius={6} border="2px" borderColor="blueBlack2" onClick={() => { setLoading(true); router.push(`/challenge/${challenge.id}`) }}>
                  {/* <StaticCard nft_id={challenge.nfts[0].nft_id} width={150} /> */}
                  <CardPicture nft_id={challenge.nfts[0].nft_id} width={140}/>
                  <Heading size="sm">
                    {new Date(challenge.start_time).toLocaleDateString('en-us', { day:"numeric", month:"short"})} @ {new Date(challenge.start_time).toLocaleTimeString('en-us', { hour: 'numeric', minute: 'numeric', hour12: true })}
                  </Heading>
                  <Flex wrap="wrap" justifyContent="center">
                    {challenge.teams.map((team: any, index:any) => {
                      return (

                        <Image
                          key={index+"_team_cs"}
                          src={`https://epfccsgtnbatrzapewjg.supabase.co/storage/v1/object/public/private/teams/${team}.png`}
                          alt=""
                          w="22px"
                          m="4px"
                          filter={(challenge.team_chosen && challenge.team_chosen != team) ? "grayscale(90%)" : "none"}
                        />
                      )
                    })}
                  </Flex>
                </VStack>
              )
            })}
            {activeChallenges.map((challenge, index) => {

              return (
                <VStack key={index} p={2} bg="blueBlack" borderRadius={6} border="2px" borderColor="blueBlack2" onClick={() => { setLoading(true); router.push(`/challenge/${challenge.id}`) }}>
                  {/* <StaticCard nft_id={challenge.nfts[0].nft_id} width={150} /> */}
                  <CardPicture nft_id={challenge.nfts[0].nft_id} width={140}/>
                  <Heading size="sm">
                    {challenge.name}'s Fan Challenge
                  </Heading>
                  <Flex wrap="wrap" justifyContent="center">
                    {challenge.teams.map((team: any, index:any) => {
                      return (

                        <Image
                          key={index+"_team"}
                          src={`https://epfccsgtnbatrzapewjg.supabase.co/storage/v1/object/public/private/teams/${team}.png`}
                          alt=""
                          w="22px"
                          m="4px"
                          filter={(challenge.team_chosen && challenge.team_chosen != team) ? "grayscale(90%)" : "none"}
                        />
                      )
                    })}
                  </Flex>
                </VStack>
              )
            })}
          </Grid>
        }



      </Box>

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

export default Challenges;

