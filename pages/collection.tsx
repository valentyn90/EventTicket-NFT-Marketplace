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
  Button,
  Container,
  Flex,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import type { NextApiRequest } from "next";
import router, { Router } from "next/router";
import React, { useEffect, useState } from "react";

const Collection = () => {
  const collectionTextString = `This is your personal collection of VerifiedInk NFTs. \
  Soon, you’ll be able to gift or trade these to \
  friends and sell them on the marketplace.`;

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
    <Container maxW="8xl">
      <Box align="center" py="12">
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
          mt="4"
        >
          {mintedNfts.length > 0 ? collectionTextString : "You have no NFTs in your collection. Check out the marketplace to get some!"}
        </Text>

        {userStore.loaded ? (
          <CardList listType="collection" nfts={mintedNfts} />
        ) : (
          <Spinner size="xl" />
        )}

        {mintedNfts.length === 0 &&
          <Button
            colorScheme="blue"
            color="white"
            borderRadius={1}
            onClick={() => { router.push("/marketplace"); }}
          >
            Marketplace
          </Button>
        }

        <AppModal />
      </Box>
    </Container>
  );
};

export async function getServerSideProps({ req }: { req: NextApiRequest }) {
  const { user } = await supabase.auth.api.getUserByCookie(req);
  if (!user) {
    return {
      redirect: {
        destination: "/marketplace/signin",
        permanent: false,
      },
    };
  }
  else {

    const requestOptions = {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id })
    }

    const attempt_transfer = fetch(`https://verifiedink.us/api/marketplace/stripeTransfer`, requestOptions);

  }

  return { props: {} };
}

export default observer(Collection);
