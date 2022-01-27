import CardList from "@/components/NftCard/CardList";
import AppModal from "@/components/ui/AppModal";
import userStore from "@/mobx/UserStore";
import { getActiveListings, getOwnedNfts } from "@/supabase/collection";
import { supabase } from "@/supabase/supabase-client";
import Nft from "@/types/Nft";
import NftOwner from "@/types/NftOwner";
import {
  Avatar,
  Box,
  Container,
  HStack,
  Spinner,
  Text,
  useBreakpointValue,
  VStack,
  Link,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import NextLink from "next/link";
import { NextApiRequest } from "next";
import React, { useState, useEffect } from "react";
import ListingData from "@/types/ListingData";

const Listings = () => {
  const avatarSize = useBreakpointValue({ base: "2xl", lg: "2xl" });
  const titleSize = useBreakpointValue({ base: "3xl", lg: "4xl" });

  const [activeNfts, setActiveNfts] = useState<Nft[]>([]);
  const [listingData, setListingData] = useState<ListingData[]>([]);

  useEffect(() => {
    if (userStore.loaded) {
      getActiveListings(userStore.id).then((res) => {
        if (res?.nfts && res?.ownerAndPriceData) {
          setActiveNfts([...res.nfts]);
          setListingData([...res.ownerAndPriceData]);
        }
      });
    }
  }, [userStore.loaded, userStore.ui.refetchListings]);

  return (
    <Box minH="100vh" py={{ base: "8", lg: "12" }} px={{ base: "4", lg: "8" }}>
      <Container maxW="3xl">
        <VStack align="center" spacing={[4, 4, 6]}>
          <Avatar
            bgColor="blue.500"
            size={avatarSize}
            name={userStore.userDetails.user_name}
            src={userStore.avatar_url}
            boxShadow="xl"
          />
          <Text color="blue.500" fontSize={titleSize} fontWeight="bold">
            Listings
          </Text>
          <HStack spacing={8}>
            <VStack>
              <Text fontWeight="bold" fontSize="2xl">
                -
              </Text>
              <Text colorScheme="gray">Inks Sold</Text>
            </VStack>
            <VStack>
              <Text fontWeight="bold" fontSize="2xl">
                -
              </Text>
              <Text colorScheme="gray">Income</Text>
            </VStack>
            <VStack>
              <Text fontWeight="bold" fontSize="2xl">
                -
              </Text>
              <Text colorScheme="gray">Royalties</Text>
            </VStack>
          </HStack>
          <Text fontSize="2xl" colorScheme="gray">
            These are your active listings. If you have no active listings, you
            can sell one of your VerifiedInks from the{" "}
            <NextLink href="/collection">
              <Link color="blue.500">Collection Tab</Link>
            </NextLink>
            .
          </Text>
          <br />
          {userStore.loaded ? (
            <>
              <CardList
                listType="listings"
                nfts={activeNfts}
                listingData={listingData}
              />
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

export default observer(Listings);
