import ARViewer from "@/components/Components/arviewer"
import { getNftById, getScreenshot, supabase } from "@/supabase/supabase-client"
import Head from "next/head"
import sizeOf from "image-size"
import { Button, VStack } from "@chakra-ui/react";
import userStore from "@/mobx/UserStore";
import router, { useRouter } from "next/router";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";


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
        (nftId && nftId != nft_id && nft_id === 332) ?
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
                window.location.assign("/athletes?referralCode=agmfpKV&utm_source=physical_card");
              }
              }
              variant={"solid"}
              borderRadius={"3px"}
              height="60px"
              style={{ zIndex: 1000, bottom: "10px", position: "absolute", left: "10px" }}
            >
              <VStack spacing={0}>
                {!nftId && <div style={{fontSize:"18px", fontFamily:"Lato"}}>Make your</div>}
                <div style={{ marginBottom: "5px" }}><img width="120px" src="/img/wordmark.svg" /></div>
              </VStack>
            </Button>
          )
      }

    </>
  )
}

export async function getServerSideProps(context: any) {


  const { ar_id } = context.query
  const { data, error } = await supabase.from(`ar_mapping`).select(`nft_id`).eq("ar_id", ar_id).maybeSingle()
  let nft_id = 332
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