import ARViewer from "@/components/Components/arviewer"
import { getNftById, getScreenshot, supabase } from "@/supabase/supabase-client"
import Head from "next/head"
import sizeOf from "image-size"
import { Box, Button, Heading, Icon, Image, Text, VStack } from "@chakra-ui/react";
import userStore from "@/mobx/UserStore";
import router, { useRouter } from "next/router";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CloseIcon } from "@chakra-ui/icons";


interface Props {
  nft_id: number;
  imageLink: string;
  videoLink: string;
  width: number;
}

const Ar: React.FC<Props> = ({
  nft_id,
  imageLink,
  videoLink,
  width,
}) => {

  const [nftId, setNftId] = useState<number | undefined>(undefined)
  const [publicUrl, setPublicUrl] = useState<string>("")
  const [showInvite, setShowInvite] = useState<boolean>(false)
  const [viewInvite, setViewInvite] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const router = useRouter()

  const fetchScreenshot = useCallback(async () => {
    const publicUrlResult = await getScreenshot(nftId!)
    setPublicUrl(publicUrlResult.publicUrl!)
    console.log(publicUrlResult)
  }, [nftId])

  useEffect(() => {
    setNftId(userStore.nft?.id)

    fetchScreenshot()

  }, [userStore.loaded])

  useEffect(() => {
    fetchScreenshot()
  }, [nftId])

  useEffect(() => {
    if (router) {
      if (parseInt(router.query.ar_id! as string) > 500 && parseInt(router.query.ar_id! as string) <= 1000) {
        setShowInvite(true)
        setViewInvite(true)
      }
    }
  }, [router])

  async function associateNFT() {
    const arId = router.query.ar_id
    if (arId && nftId) {
      console.log(userStore.nft?.id)
      console.log(router.query.ar_id)
      const res = await fetch('/api/ar/associate?ar_id=' + arId + '&nft_id=' + nftId)
      console.log(res)
      if (res.ok) {
        window.location.assign('/ar?ar_id=' + arId)
      }
    }

  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <style jsx global>{`
            /* Other global styles such as 'html, body' etc... */

            #__next {
              height: 100%;
              width: 100%;
            }
          `}</style>
      <ARViewer nft_id={nft_id} image_link={imageLink} video_link={videoLink} width={width} />

      {
        (nftId && nftId != nft_id && (nft_id === 332 || nft_id === 763)) ?
          (
            <Button onClick={associateNFT}

              variant="solid"
              height="110px"
              style={{ zIndex: 1000, bottom: "10px", position: "absolute", left: "10px" }}
            >
              <VStack spacing={2}>
                <div>Switch NFT</div>
                <img src={publicUrl} width='40px' />
              </VStack>
            </Button>
          ) :
          (
            <Button
              onClick={() => {
                window.location.assign("/athletes?referralCode=agmfpKV&utm_content=physical_card");
              }
              }
              variant={"solid"}
              borderRadius={"3px"}
              height="60px"
              style={{ zIndex: 1000, bottom: "10px", position: "absolute", left: "10px" }}
            >
              <VStack spacing={0}>
                {!nftId && <div style={{ fontSize: "18px", fontFamily: "Lato" }}>Make your</div>}
                <div style={{ marginBottom: "5px" }}><img width="120px" src="/img/wordmark.svg" /></div>
              </VStack>
            </Button>
          )
      }
      { showInvite && !viewInvite &&
        <Box borderRadius={3} style={{zIndex:1000, top:"1%", left: "50%",
          transform: 'translateX(-50%)',}} alignSelf={"center"} position="fixed" onClick={()=>{setViewInvite(true)}} bgColor={"#1a202d"} p={"5"} w={60} textAlign="center"> 
          <Heading size="md">Exclusive Invite</Heading>
        </Box>
      }
      { showInvite &&
              <Button borderRadius={3} style={{zIndex:1000, bottom:"10px", right: "10px"}} isLoading={loading} alignSelf={"center"} position="fixed" onClick={()=>{setLoading(true); window.location.assign("/drops/naas?utm_content=physical_card");}} bgColor={"#1a202d"} p={"4"} w={40} textAlign="center"> 
                <Heading size="md">Buy Naas's NFT</Heading>
              </Button>
      }

    { viewInvite &&
        <VStack style={{zIndex:1001, left:"5%", top:"5%"}} position="fixed"  bgImage="linear-gradient(#1a202d,rgba(0, 0, 0, 0.4)), url('img/basketball-court.jpg')"
        bgSize="cover" p={"5"} w={"90%"} h={"90%"} textAlign="center" overflowY={"scroll"}> 
        
          <Icon as={CloseIcon} size="2x" onClick={()=>{setViewInvite(false)}} position="absolute" top="10px" right="10px" />
          <Heading mt={5}>Peach Jam Private NIL Event</Heading>
          <Text mt={6}>Hosted By</Text>
          <Image src="/img/LogoWhiteLarge.png" width={"45%"} />
          <Heading size="lg" alignSelf={"start"}  pt={1}>What</Heading>
          <Text  textAlign={"start"}>
          VerifiedInk hosts exclusive event for top players and their families to learn about making money from their Name Image and Likeness.
          </Text>

          <Heading size="lg" alignSelf={"start"} pt={2}>When</Heading>
          <Text alignSelf={"start"} textAlign={"start"}>Thursday, July 21 8:30 PM-11:00 PM 
          </Text>

          <Heading size="lg" alignSelf={"start"} pt={2}>Where</Heading>
          <Text textAlign={"start"}>
             Southbound Smokehouse, 1009 Center St, North Augusta, SC 29841
          </Text>
          <Box textAlign={"start"} alignSelf={"start"} fontWeight="bold">
              <a href="https://goo.gl/maps/2peFESMcnu4HpwQb7">Google Maps Link</a>
          </Box>



          <Box p={1}></Box>

          <Button p={5} bgColor="whiteAlpha.600"  onClick={()=>{setViewInvite(false)}}>Close Invite</Button>
          

        </VStack>
      }

    </>
  )
}

export async function getServerSideProps(context: any) {


  const { ar_id } = context.query
  const { data, error } = await supabase.from(`ar_mapping`).select(`nft_id`).eq("ar_id", ar_id).maybeSingle()
  let nft_id = 332

  if(ar_id > 500 && ar_id <= 1000){
    nft_id = 763
  }
  if (data && data.nft_id) {
    nft_id = data.nft_id
  }


  const nft = await getNftById(nft_id)
  const imageLink = await getScreenshot(nft_id).then(link => {
    return link.publicUrl!
  })

  const mux = nft.data.mux_playback_id
  const resolution = nft.data.mux_max_resolution
  const videoLink = `https://stream.mux.com/${mux}/${resolution}.mp4`

  const thumbnail = `https://image.mux.com/${mux}/thumbnail.jpg`

  let width = 1

  const f = await fetch(thumbnail)
  const blob = await f.blob()
  const buff = Buffer.from(await blob.arrayBuffer())

  if (mux) {
    const dimensions = await sizeOf(buff)
    if (dimensions.width && dimensions.height) {
      width = dimensions.width / dimensions.height
      console.log(width)
    }
  }


  return {
    props: {
      nft_id,
      imageLink,
      videoLink,
      width
    }
  }




}


export default Ar