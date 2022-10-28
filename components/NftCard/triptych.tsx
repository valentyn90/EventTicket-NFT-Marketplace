

// React Component taking 3 nft_ids and displaying the nfts overlapping each other

import { getScreenshot } from '@/supabase/supabase-client';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
    position: relative;
    

    .left{
        position: absolute;
        left: 0;
        width: 49%;
    }
    .right{
        position: absolute;
        right: 0;
        width: 49%;
    }
    .middle{
        position: absolute;
        top: 61px;
        left: 41px;
        width: 55%;
    }

    .only{
        
        height: 233px
    }


`


interface Props {
    nft_list: number[];
}

const Triptych: React.FC<Props> = ({ nft_list }) => {

    const [nftImages, setNftImages] = useState<string[]>([]);

    useEffect(() => {
        getNftImages()

    }, [])

    const getNftImages = async () => {

        const images = await Promise.all(nft_list.map(async (nft_id) => {
            //getscreenshots of each image
            const publicUrl = await getScreenshot(nft_id)
            return publicUrl.publicUrl!;
        }));

        setNftImages(images)

        return images;
    }

    return (
        <Wrapper>
            {nftImages.length > 1 ?


                <div >
                    <div className="left">
                        <img src={nftImages[0]} alt="nft" />
                    </div>
                    <div className="right">
                        <img src={nftImages[1]} alt="nft" />
                    </div>
                    <div className="middle">
                        <img src={nftImages[2]} alt="nft" />
                    </div>
                </div>
                :
                <div>
                    
                    <img src={nftImages[0]} alt="nft" className="only"/>
                        
                </div>


            }
        </Wrapper>
    )
}

export default Triptych