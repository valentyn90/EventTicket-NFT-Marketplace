import { Box, Button, Heading, HStack, VStack } from "@chakra-ui/react";
import { useState } from "react";
import StaticCard from "../NftCard/StaticCard";

interface Props {
    nft_id: number;
    banner_text: string;
    heading: string;
    link_text: string;
    link_url: string;
    flip_timer: number;
}

const Hero: React.FC<Props> = ({ nft_id, banner_text, heading, link_text, link_url, flip_timer=5}) => {

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
              <Box ml="1" mb={3} w="fit-content" boxShadow="0 0 100px red" paddingInline={3} paddingBlock={1} bg="red" transform={"auto"} skewX={"-5"} skewY={"-5"}><Heading fontWeight={"bold"} fontSize={"md"}>{banner_text}</Heading></Box>
              <Heading fontSize="xl" pb={2} textAlign={"center"}>{heading}</Heading>
              <Button isLoading={submitting} onClick={()=>{setSubmitting(true); window.location.assign(link_url)}}>{link_text}</Button>
            </VStack>
            <StaticCard nft_id={nft_id} width={100} reverse={showFront}></StaticCard>
          </HStack>
        </Box>

    )
}

export default Hero;