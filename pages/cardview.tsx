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
import CardPlaceholder from "@/components/NftCard/CardPlaceholder";

const CardView: React.FC = () => {
  return (
    <Box
      bg={useColorModeValue("gray.50", "inherit")}
      minH="100vh"
      py="12"
      px={{ base: "4", lg: "8" }}
    >
      <CardPlaceholder />
    </Box>
  );
};

export default CardView;
