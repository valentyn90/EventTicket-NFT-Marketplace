import userStore from "@/mobx/UserStore";
import { handleRecruitClick } from "@/utils/shareCard";
import ShareIcon from "@/utils/svg/ShareIcon";
import { Button } from "@chakra-ui/button";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { Box, Flex, HStack, Text, VStack } from "@chakra-ui/layout";
import { Select } from "@chakra-ui/select";
import { useToast } from "@chakra-ui/toast";
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

const CollectionModalContent: React.FC<Props> = ({
  flipCard,
  initFlip,
  setInitFlip,
  setFlipCard,
}) => {
  const toast = useToast();
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

        <Text color={textColor} fontSize={["l", "l", "2xl"]} mb={8}>
          Own: 7/10 Cards
        </Text>
        <HStack>
          <Text color={textColor} mr={2}>
            View SN:
          </Text>
          <Select color={textColor} w="100px">
            <option>1</option>
          </Select>
        </HStack>
        <HStack w="100%" justifyContent="space-between">
          <Button
            px={10}
            colorScheme="gray"
            disabled
            variant="outline"
            flex="1"
          >
            Sell
          </Button>
          <Button
            px={10}
            colorScheme="gray"
            disabled
            variant="outline"
            flex="1"
          >
            Gift
          </Button>
        </HStack>

        <ShareButton id={userStore.ui.selectedNft?.id} />
      </VStack>
    </Flex>
  );
};

export default observer(CollectionModalContent);
