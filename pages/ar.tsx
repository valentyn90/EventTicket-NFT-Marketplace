import ARViewer from "@/components/Components/arviewer"
import { getNftById, getScreenshot, supabase } from "@/supabase/supabase-client"
import Head from "next/head"
import sizeOf from "image-size"

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
  width
}) => {

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
  const dimensions = await sizeOf(buff)
  if (dimensions.width && dimensions.height) {
    width = dimensions.width / dimensions.height
    console.log(width)
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