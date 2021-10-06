import Card from "@/components/NftCard/Card";
import { Box, useColorModeValue } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";

const CardId: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  let int_id = parseInt(id as string);
  return (
    <Box
      bg={useColorModeValue("gray.50", "inherit")}
      minH="100vh"
      px={{ base: "4", lg: "8" }}
    >
      {!int_id ? (
        <div></div>
      ) : (
        <Card nft_id={int_id} nft_width={600} reverse={false} readOnly={true} />
      )}
    </Box>
  );
};

export default CardId;
