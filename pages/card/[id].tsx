import { supabase } from "@/utils/supabase-client";
import {
  Box,
  Button,
  Flex,
  Image,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { NextApiRequest } from "next";
import NextLink from "next/link";
import React from "react";
import { useRouter } from "next/router";
import CardView from "@/components/NftCard/CardView";

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
        <CardView nft_id={int_id} nft_width={600} reverse={false} />
      )}
    </Box>
  );
};

export default CardId;
