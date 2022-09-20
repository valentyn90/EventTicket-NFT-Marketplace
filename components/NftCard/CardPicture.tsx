import { getScreenshot } from "@/supabase/supabase-client";
import { Image } from "@chakra-ui/image";
import { Box } from "@chakra-ui/react";
import { useState } from "react";
import { CardWrapper } from "./CardStyles";

interface Props {
    nft_id: number;
    width?: number | undefined;
    glow?: boolean;
}

const CardPicture: React.FC<Props> = ({
    nft_id, width="100%", glow=false
}) => {

    const [screenshot, setScreenshot] = useState("/img/card-placeholder.png");

    getScreenshot(nft_id).then(({ publicUrl, error }) => {
        if (publicUrl) {
            setScreenshot(publicUrl);
        }
    });

    return (
        <Box  filter={glow ? "drop-shadow( 0 0 10px gold);" : ""}>
        <Image
              width={width}
              height="100%"
              objectFit="contain"
              src={screenshot}
              fallbackSrc="https://verifiedink.us/img/card-mask.png"
             
            />
        </Box>

    )
}

export default CardPicture