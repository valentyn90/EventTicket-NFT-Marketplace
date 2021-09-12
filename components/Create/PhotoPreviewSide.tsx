import CardPlaceholder from "@/components/NftCard/CardPlaceholder";
import { useUser } from "@/utils/useUser";
import { Box, Flex, Text } from "@chakra-ui/react";
import Card from "../NftCard/Card";

const PhotoPreviewSide = ({
  title,
  subtitle,
  flex,
}: {
  title: string;
  subtitle: string;
  flex: string;
}) => {
  const { nft } = useUser();
  return (
    <Flex direction="column" flex={flex}>
      <Text fontSize="3xl" fontWeight="bold">
        {title}
      </Text>
      <Text w="75%">{subtitle}</Text>
      <Box mt="5rem" display={["none", "none", "block"]}>
        {nft?.id ? (
          <Card nft_id={nft?.id} nft_width={400} reverse={false} />
        ) : (
          <Text>Loading...</Text>
        )}
      </Box>
    </Flex>
  );
};

export default PhotoPreviewSide;
