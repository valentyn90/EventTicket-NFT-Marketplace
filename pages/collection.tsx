import CardList from "@/components/NftCard/CardList";
import AppModal from "@/components/ui/AppModal";
import { DividerWithText } from "@/components/ui/DividerWithText";
import userStore from "@/mobx/UserStore";
import { getOwnedNfts } from "@/supabase/collection";
import { supabase } from "@/supabase/supabase-client";
import Nft from "@/types/Nft";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { useBreakpointValue } from "@chakra-ui/media-query";
import {
  Avatar,
  Box,
  Container,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import type { NextApiRequest } from "next";
import React, { useEffect, useState } from "react";

const Collection = () => {
  const collectionTextString = `This is your personal collection of VerifiedInk NFTs \
  you and your referrals have minted. Soon, you’ll be able to gift or trade these to \
  friends and sell the on the marketplace.`;

  const MARKET_ENABLED = process.env.NEXT_PUBLIC_ENABLE_MARKETPLACE === "true";

  const avatarSize = useBreakpointValue({ base: "2xl", lg: "2xl" });
  const titleSize = useBreakpointValue({ base: "3xl", lg: "4xl" });
  const titleColor = useColorModeValue("blue.500", "white");
  const introColor = useColorModeValue("gray.600", "white");
  const bgColor = useColorModeValue("gray.50", "inherit");

  const [mintedNfts, setMintedNfts] = useState<Nft[]>([]);

  useEffect(() => {
    if (userStore.loaded) {
      getOwnedNfts(userStore.id).then((res) => {
        if (res.data) {
          setMintedNfts(res.data);
        }
      });
    }
  }, [userStore.loaded]);

  return (
    <Box
      bg={bgColor}
      minH="100vh"
      py={{ base: "8", lg: "12" }}
      px={{ base: "4", lg: "8" }}
    >
      <Container maxW="3xl">
        <VStack spacing={4} align="center">
          <Avatar
            bgColor="blue.500"
            size={avatarSize}
            name={userStore.userDetails.user_name}
            src={userStore.avatar_url}
            boxShadow="xl"
          />
          <Text color={titleColor} fontSize={titleSize} fontWeight="bold">
            COLLECTION
          </Text>
          <Text
            color={introColor}
            w={["100%", "80%", "70%"]}
            fontSize={["md", "lg", "lg"]}
          >
            {collectionTextString}
          </Text>
          <br />
          {userStore.loaded ? (
            <>
              <CardList listType="collection" nfts={mintedNfts} />
            </>
          ) : (
            <Spinner size="xl" />
          )}
        </VStack>
      </Container>
      <AppModal />
    </Box>
  );
};

export async function getServerSideProps({ req }: { req: NextApiRequest }) {
  const { user } = await supabase.auth.api.getUserByCookie(req);
  if (!user) {
    return {
      redirect: {
        destination: "/signin",
        permanent: false,
      },
    };
  }
  return { props: {} };
}

export default observer(Collection);
