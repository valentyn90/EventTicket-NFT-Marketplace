import React, { useEffect, useState } from "react";
import CardPlaceholder from "@/components/NftCard/CardPlaceholder";
import { useUser } from "@/utils/useUser";
import { Box, Flex, Text } from "@chakra-ui/react";
import Card from "../NftCard/Card";
import Nft from "@/types/Nft";

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
  nft_id: number;
  nft: Nft;
}) => {
  return (
    <Flex direction="column" flex={flex}>
      <Text fontSize="3xl" fontWeight="bold">
        {title}
      </Text>
      <Text w="75%">{subtitle}</Text>
      <Box mt="5rem" display={["none", "none", "block"]}>
        <Card nft_id={nft_id} nft_width={400} reverse={false} nft={nft} />
      </Box>
    </Flex>
  );
};

export default PhotoPreviewSide;
