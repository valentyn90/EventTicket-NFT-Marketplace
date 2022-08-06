import { NftStore } from "@/mobx/NftStore";
import { Box, Flex, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import useWindowDimensions from "../../utils/useWindowDimensions";
import Card from "../NftCard/Card";
import { CardBox } from "../ui/CardBox";

interface Props {
  title: string;
  subtitle: string;
  flex: string;
  nft_id: number | undefined;
  nft: NftStore | null;
  emptyCard?: boolean;
}

const PhotoPreviewSide: React.FC<Props> = ({
  title,
  subtitle,
  flex,
  nft_id,
  nft,
  emptyCard = false,
}) => {
  const { width } = useWindowDimensions();

  const [nftWidth, setNftWidth] = useState(400);

  useEffect(() => {
    if (width) {
      if (width < 400) {
        setNftWidth(200);
      } else if (width >= 400 && width < 900) {
        setNftWidth(300);
      } else {
        setNftWidth(400);
      }
    }
  }, [width]);

  return (
    <Flex direction="column" flex={flex}>
      <Text fontSize="3xl" fontWeight="bold">
        {title}
      </Text>
      <Text w={["100%", "75%"]}>{subtitle}</Text>
      <Box
        mt="2rem"
        display={["none", "none", "block"]}
        h={["500px", "650px", "650px"]}
      >
        <CardBox>
          <Card
            nft_id={nft_id}
            nft_width={nftWidth}
            reverse={false}
            nft={nft}
            emptyCard={emptyCard}
          />
        </CardBox>
      </Box>
    </Flex>
  );
};

export default PhotoPreviewSide;
