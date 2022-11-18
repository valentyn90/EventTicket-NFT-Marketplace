import userStore from "@/mobx/UserStore";
import {
  Box,
  Button,
  HStack,
  Image,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";

const CreateAccountComponent = () => {
  const [selectedCards, setSelectedCards] = useState<"x1" | "x5" | "">("");

  return (
    <Stack
      dir="col"
      spacing={2}
      mt={"0 !important"}
      borderTop="2px solid"
      borderColor="viBlue"
    >
      <Text
        pt={4}
        px={2}
        fontSize={"3xl"}
        fontWeight="bold"
        textAlign={"center"}
      >
        Your Verifiedink IRL
      </Text>
      <Text fontSize={"xl"} px={4} color="viBlue" textAlign={"center"}>
        We've made your Ink, now share it in real life.
      </Text>
      <Box pt={4}>
       
        <video width="300" autoPlay loop muted playsInline>
            <source
              src="https://epfccsgtnbatrzapewjg.supabase.co/storage/v1/object/public/private/videos/ar-card-safari.mp4"
              type='video/mp4; codecs="hvc1"' />
            <source
              src="https://epfccsgtnbatrzapewjg.supabase.co/storage/v1/object/public/private/videos/ar-card-vp9-chrome.webm"
              type="video/webm" />
          </video>

      </Box>
      <VStack align="start" w="100%" px={8} spacing={4}>
        <Text alignSelf={"center"} pt={4}>
          Choose between
        </Text>
        <HStack
          spacing={0}
          border="1px solid"
          borderColor={
            selectedCards === "x1" ? "viBlue" : "rgba(255,255,255,0.3)"
          }
          w="100%"
          onClick={() => {
            if (selectedCards === "x1") {
              setSelectedCards("");
            } else {
              setSelectedCards("x1");
            }
          }}
        >
          <Box
            flex={1}
            px={6}
            py={4}
            borderRight="1px solid"
            borderColor={
              selectedCards === "x1" ? "viBlue" : "rgba(255,255,255,0.3)"
            }
            background={selectedCards === "x1" ? "viBlue" : ""}
          >
            x1
          </Box>
          <HStack flex={12} px={6} py={4} justify={"space-between"} w="100%">
            <Text>$19.99</Text>
            <HStack spacing={2}>
              {[0].map((card, i) => (
                <Box>
                  <GreyCardIcon
                    fill={selectedCards === "x1" ? "#0D9DE5" : "#4F5567"}
                  />
                </Box>
              ))}
            </HStack>
          </HStack>
        </HStack>
        <HStack
          spacing={0}
          border="1px solid"
          borderColor={
            selectedCards === "x5" ? "viBlue" : "rgba(255,255,255,0.3)"
          }
          w="100%"
          onClick={() => {
            if (selectedCards === "x5") {
              setSelectedCards("");
            } else {
              setSelectedCards("x5");
            }
          }}
        >
          <Box
            flex={1}
            px={6}
            py={4}
            borderRight="1px solid"
            borderColor={
              selectedCards === "x5" ? "viBlue" : "rgba(255,255,255,0.3)"
            }
            background={selectedCards === "x5" ? "viBlue" : ""}
          >
            x5
          </Box>
          <HStack flex={12} px={6} py={4} justify={"space-between"} w="100%">
            <Text>$19.99</Text>
            <HStack spacing={2}>
              {[0, 1, 2, 3, 4].map((card, i) => (
                <Box>
                  <GreyCardIcon
                    fill={selectedCards === "x5" ? "#0D9DE5" : "#4F5567"}
                  />
                </Box>
              ))}
            </HStack>
          </HStack>
        </HStack>

        <Button
          w="100%"
          background="viBlue"
          color="white"
          disabled={selectedCards === ""}
        >
          Buy Now
        </Button>

        <Text pt={4} fontSize={"xl"} fontWeight="bold">
          What's included?
        </Text>
        <Text color="gray3">&#8226; 5 Physical Augmented Reality Cards</Text>
        <Text color="gray3">&#8226; 10 VerifiedInk Digital Trading Cards</Text>

        <Text pt={4} fontSize={"xl"} fontWeight="bold">
          How does it work?
        </Text>
        <Text color="gray3">
          We'll ship your AR cards to your provided address. Once you receive
          them, simply scan the card with your phone camera and you'll see your
          VerifiedInk in Augmented Reality through your phone. Flip the card
          over and your video will start playing.
        </Text>
        <Text color="gray3" pb={4}>
          We think these AR cards are the best way to share your VerifiedInk
          with your friends, teammates and family.
        </Text>

        <Button
          variant={"outline"}
          color="viBlue"
          w="100%"
          onClick={() => userStore.ui.nextStep()}
        >
          No Thanks
        </Button>
      </VStack>
    </Stack>
  );
};

const GreyCardIcon = ({ fill }: { fill: string }) => (
  <svg
    width="13"
    height="22"
    viewBox="0 0 13 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 2.1718V16.4729C0 16.661 0.0832 16.839 0.226436 16.9579L6.13411 21.8593C6.36102 22.0474 6.68625 22.0469 6.91222 21.8578L12.7755 16.9579C12.9177 16.839 13 16.662 13 16.4744V2.1718C13 1.8865 12.8104 1.6373 12.5391 1.56609L6.65364 0.0198453C6.55295 -0.00661509 6.44705 -0.00661509 6.34636 0.0198453L0.460909 1.56657C0.189564 1.63778 0 1.88699 0 2.17228V2.1718Z"
      fill={fill}
    />
  </svg>
);

export default CreateAccountComponent;
