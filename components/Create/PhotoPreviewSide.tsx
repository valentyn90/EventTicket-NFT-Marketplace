import { NftStore } from "@/mobx/NftStore";
import { Box, Flex, Text } from "@chakra-ui/react";
import React from "react";
import Card from "../NftCard/Card";

const PhotoPreviewSide = ({
  title,
  subtitle,
  flex,
  nft_id,
  nft,
}: {
  title: string;
  subtitle: string;
  flex: string;
  nft_id: number | undefined;
  nft: NftStore | null;
}) => {
  return (
    <Flex direction="column" flex={flex}>
      <Text fontSize="3xl" fontWeight="bold">
        {title}
      </Text>
      <Text w={["100%","75%"]}>{subtitle}</Text>
      <Box mt="2rem" display={["none", "none", "block"]} h={["500px","650px","650px"]}>
        {nft ? (
          <Card nft_id={nft_id} nft_width={400} reverse={false} nft={nft} />
        ) : (
          ""
        )}
      </Box>
    </Flex>
  );
};

export default PhotoPreviewSide;
