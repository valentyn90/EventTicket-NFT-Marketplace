import userStore from "@/mobx/UserStore";
import { Box, Button, Text, VStack, Image } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import React from "react";

const IntroScreen = () => {
  return (
    <VStack
      align="center"
      minH={["500px", "500px", "700px"]}
      justify={"center"}
      spacing={4}
      onClick={() => {
        userStore.ui.nextStep();
      }}
    >
      <Box>
        <Image w={["100px"]} src="/card-assets/card-preview.png"  />
      </Box>
      <VStack spacing={8}>
        <Text w="75%" textAlign={"center"} fontSize="lg" fontWeight={"bold"}>
          Tap the <Image mx="-3.5" my="-3.5" display="inline" src="/Plus.png"/> to add your info.
        </Text>
        <Button
          bg="viBlue"
          w="50%"
        >
          Let's go!
        </Button>
      </VStack>
    </VStack>
  );
};

export default observer(IntroScreen);
