import { useUser } from "@/utils/useUser";
import { Flex, Text, Box, Image } from "@chakra-ui/react";
import CardPreview from "./CardPreview";

const PhotoPreviewSide = ({
  title,
  subtitle,
  flex,
}: {
  title: string;
  subtitle: string;
  flex: string;
}) => {
  const { photoFile, nft } = useUser();
  return (
    <Flex direction="column" flex={flex}>
      <Text fontSize="3xl" fontWeight="bold">
        {title}
      </Text>
      <Text w="75%">{subtitle}</Text>
      <Box mt="5rem" display={["none", "none", "block"]}>
        {photoFile ? (
          <CardPreview photoFile={photoFile} nft={nft} />
        ) : (
          <Image
            height="500px"
            src="/img/bobby.png"
            alt="High school football player"
            boxShadow="2xl"
          />
        )}
      </Box>
    </Flex>
  );
};

export default PhotoPreviewSide;
