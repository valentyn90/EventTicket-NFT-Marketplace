import StaticCard from "@/components/NftCard/StaticCard"
import { supabase } from "@/supabase/supabase-client"
import { useEffect, useState } from "react"
import { QRCode } from "react-qrcode-logo"
import styled from "styled-components"

const Wrapper = styled.div`
position: relative;
height: 1600px;

#react-qrcode-logo {
    position: absolute;
    bottom: 0px;
    left: 168px;
    opacity: 0.75;
  }

`

const Screen: React.FC = () => {

    // fetch all relevant nfts
    const [nfts, setNfts] = useState<any[]>([])
    const [activeNft, setActiveNft] = useState(0)
    const [flip, setFlip] = useState(false)

    // on an interval show nft for 10 seconds, flip for 10 seconds
    useEffect(() => {
        supabase.from('nft').select('id').eq('sport', 'Basketball').eq('minted', true).order('id', {ascending:false})
            .then((res: any) => {
                if (res.data) {
                    console.log(res.data.map((nft: any) => nft.id))
                    setNfts(res.data.map((nft: any) => nft.id))
                }
            })
        }
    , [])

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveNft((activeNft + 1) % nfts.length)
            setTimeout(() => {
                setFlip(true)
            }, 2000)
            setTimeout(() => {
                setFlip(false)
            }, 8000)
        },
        10000)
        
        return () => {clearInterval(interval)}
    })

    return (
        <Wrapper>
            <StaticCard nft_id={nfts[activeNft]} width={800} reverse={flip}></StaticCard>
            <QRCode bgColor="transparent" 
                    fgColor="white" 
                    value="https://verifiedink.us/athletes?referralCode=V1xpcJr"  
                    qrStyle="dots"
                    logoImage="/img/Logo.png"
                    removeQrCodeBehindLogo={true}
                    logoHeight={30}
                    logoWidth={30}

                    />
        </Wrapper>
    )

}

export default Screen