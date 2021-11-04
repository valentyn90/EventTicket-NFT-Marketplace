import CardList from "@/components/NftCard/CardList";
import AppModal from "@/components/ui/AppModal";
import { DividerWithText } from "@/components/ui/DividerWithText";
import userStore from "@/mobx/UserStore";
import { getUserNft, supabase } from "@/supabase/supabase-client";
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
  const collectionTextString = `This is your collection of VerifiedInk NFTs. Within a few weeks
  you’ll be able to gift these to teammates and sell them on the
  marketplace. For now you’ll see your VerifiedInk and the VerfiedInk
  of anyone you recruited.`;

  const [readMore, setReadMore] = useState(false);
  const collectionText = useBreakpointValue({
    base: `${collectionTextString.substr(
      0,
      collectionTextString.length / 2 + 4
    )}...`,
    sm: collectionTextString,
  });

  const avatarSize = useBreakpointValue({ base: "2xl", lg: "2xl" });
  const titleSize = useBreakpointValue({ base: "3xl", lg: "4xl" });
  const titleColor = useColorModeValue("blue.500", "white");
  const introColor = useColorModeValue("gray.600", "white");
  const bgColor = useColorModeValue("gray.50", "inherit");

  const [mintedNfts, setMintedNfts] = useState<Nft[]>([]);

  useEffect(() => {
    if (userStore.loaded) {
      getUserNft(userStore.id).then((res) => {
        if (res.data) {
          setMintedNfts([res.data]);
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
            size={avatarSize}
            name={userStore.userDetails.user_name}
            src={userStore.avatar_url}
            boxShadow="xl"
          />
          <Text color={titleColor} fontSize={titleSize} fontWeight="bold">
            COLLECTION
          </Text>
          <Text color={introColor} w={["100%", "80%", "70%"]} fontSize={"lg"}>
            {readMore ? collectionTextString : collectionText}
            <DividerWithText
              my={4}
              onClick={() => setReadMore(!readMore)}
              display={["flex", "none"]}
            >
              {readMore ? "read less" : "read more"}
            </DividerWithText>
          </Text>
          <br />
          {userStore.loaded ? (
            <>
              <CardList listType="collection" nfts={mintedNfts} />
            </>
          ) : (
            <Spinner size="xl" />
          )}
          <AppModal />
        </VStack>
      </Container>
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
