import { Box, Button, Heading, HStack, VStack, Text } from "@chakra-ui/react";
import { useState } from "react";
import StaticCard from "../NftCard/StaticCard";
import TransformButton from "../ui/TransformButton";

interface Props {
    nft_id: number;
    banner_text: string;
    heading: string;
    subtext: string;
    link_text: string;
    link_url: string;
    flip_timer: number;
}

const Hero: React.FC<Props> = ({ nft_id, banner_text, heading, subtext, link_text, link_url, flip_timer=5}) => {

    const [submitting, setSubmitting] = useState(false);

    const [showFront, setShowFront] = useState(false);
    // set an interval to switch side that the card is on
    setInterval(() => {
        setShowFront(!showFront);
    },1000*flip_timer);


    return(
        <Box>
          <HStack p="6" bgPos="bottom"
            bgImage="linear-gradient(#1a202d,#1a202d,rgba(0, 0, 0, 0.1)), url('img/basketball-court.jpg')"
            bgSize="cover" alignItems={"center"} justifyContent="center">
            <VStack pr={["unset","4","6"]}>
                {banner_text !='' &&
              <Box ml="1" mb={2} w="fit-content" boxShadow="0 0 100px red" paddingInline={3} paddingBlock={1} bg="red" borderRadius={"full"} transform={"auto"} ><Heading fontWeight={"bold"} fontSize={"md"}>{banner_text}</Heading></Box>
                }
              <Heading fontSize="xl" textAlign={"center"}>{heading}</Heading>
              <Box display={["none","unset","unset"]}>
              {subtext!='' && <Text textAlign={"center"} >{subtext}</Text>}
              </Box>
              <Box pt={2}>
              <TransformButton text={link_text} textSize="1.25em" color={"blue.200"} shadow="magenta" disabled={false} onClick={()=>{setSubmitting(true); window.location.assign(link_url)}} isLoading={submitting}  />
            </Box>
            </VStack>
            <StaticCard nft_id={nft_id} width={100} reverse={showFront}></StaticCard>
          </HStack>
        </Box>

    )
}

export default Hero;