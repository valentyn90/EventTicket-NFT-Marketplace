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
import Card from "@/components/NftCard/Card";
import { useRouter } from "next/router";

const CardView: React.FC = () => {

  const router = useRouter()
  const { id } = router.query
  console.log(id)
  let int_id = parseInt(id as string)

  return (
    <Box
      bg={useColorModeValue("gray.50", "inherit")}
      minH="100vh"
      px={{ base: "4", lg: "8" }}
    >
      {Number.isNaN(int_id) ? <div></div> :
        <Card nft_id={int_id} nft_width={600} reverse={false} />

      }
    </Box>
  );
};

export default CardView;
