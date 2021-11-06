import userStore from "@/mobx/UserStore";
import { handleRecruitClick } from "@/utils/shareCard";
import ShareIcon from "@/utils/svg/ShareIcon";
import { Button } from "@chakra-ui/button";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { Box, Flex, Text, VStack } from "@chakra-ui/layout";
import { observer } from "mobx-react-lite";
import React from "react";
import { FiRefreshCw } from "react-icons/fi";
import ShareButton from "../Components/ShareButton";
import Card from "../NftCard/Card";
import { CardBox } from "../ui/CardBox";

interface Props {
  flipCard: boolean;
  initFlip: boolean;
  setInitFlip: React.Dispatch<React.SetStateAction<boolean>>;
  setFlipCard: React.Dispatch<React.SetStateAction<boolean>>;
}

const MarketplaceModalContent: React.FC<Props> = ({
  flipCard,
  initFlip,
  setInitFlip,
  setFlipCard,
}) => {
  const textColor = useColorModeValue("gray.600", "white");
  return (
    <Flex
      direction={["column", "column", "row"]}
      maxH={["100%", "100%", "700px"]}
      pb={["0px", "0px", "unset"]}
    >
      <CardBox>
        <Card
          nft_id={userStore.ui.selectedNft?.id}
          readOnly={true}
          flip={flipCard}
          initFlip={initFlip}
        />
        <div
          className="cardbox-refreshicon-div"
          onClick={() => {
            if (!initFlip) {
              setInitFlip(true);
            }
            setFlipCard(!flipCard);
          }}
        >
          <FiRefreshCw />
        </div>
      </CardBox>
      <VStack spacing={6} align="start" justify="center">
        <Box>
          <Text color={textColor} fontSize={["4xl", "4xl", "6xl"]}>
            {userStore.ui.selectedNft?.first_name}{" "}
            {userStore.ui.selectedNft?.last_name}
          </Text>
          <Text color={textColor} fontSize={["l", "l", "2xl"]} mb={8}>
            10 Cards Minted on 10/19/21
          </Text>
        </Box>

        <Button colorScheme="gray" variant="outline" disabled mb={4}>
          Make an offer
        </Button>

        <ShareButton id={userStore.ui.selectedNft?.id} />
        
      </VStack>
    </Flex>
  );
};

export default observer(MarketplaceModalContent);
