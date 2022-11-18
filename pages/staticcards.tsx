import StaticCard from "@/components/NftCard/StaticCard";
import { Box, Button, Container, Flex } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";



const StaticCards = () => {

  const [flip, setFlip] = useState(false);

  useEffect(() => {
    // const intervalId = setInterval(() => {
    //   console.log("StaticCards timeout");
    //   setFlip(!flip);
    // }, 1000);

    // return () => clearInterval(intervalId);
  
  }, [flip]);

  return (
    <Container pt={8}>
      <Flex>
        <Box flex={1}>StaticCard</Box>
        <Box flex={1}>
          <StaticCard nft_id={96} width={400} reverse={flip}/>
        </Box>
        <Button onClick={() => setFlip(!flip)}>Flip</Button>
      </Flex>
    </Container>
  );
};

export default StaticCards;
