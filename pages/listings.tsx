import CardList from "@/components/NftCard/CardList";
import AppModal from "@/components/ui/AppModal";
import userStore from "@/mobx/UserStore";
import {
  getActiveListings,
  getOwnedNfts,
  getPublicKey,
  getTotalSales,
} from "@/supabase/collection";
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
import { getBalance } from "@/utils/web3/queries";
import getSolPrice from "@/hooks/nft/getSolPrice";

const Listings = () => {
  const avatarSize = useBreakpointValue({ base: "2xl", lg: "2xl" });
  const titleSize = useBreakpointValue({ base: "3xl", lg: "4xl" });
  const listingTextSize = useBreakpointValue({
    base: "lg",
    md: "xl",
    lg: "2xl",
  });
  const listingLabelSize = useBreakpointValue({
    base: "md",
    md: "lg",
    lg: "xl",
  });

  const [activeNfts, setActiveNfts] = useState<Nft[]>([]);
  const [listingData, setListingData] = useState<ListingData[]>([]);
  const [inksSold, setInksSold] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [balance, setBalance] = useState(0);

  const { solPrice } = getSolPrice();

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

  useEffect(() => {
    getPublicKey(userStore.id).then(async (res) => {
      if (res) {
        const balance_res = await getBalance(res);
        setBalance(balance_res);

        const totalSales_res = await getTotalSales(res);
        const totalSales_usd = totalSales_res.total_usd / solPrice;
        setTotalSales(totalSales_res.total + totalSales_usd);
        setInksSold(totalSales_res.count);
      }
    });
  }, [balance, userStore.loaded]);

  return (
    <Box minH="100vh" py={{ base: "8", lg: "12" }} px={{ base: "4", lg: "8" }}>
      <Container maxW="6xl">
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
          <HStack alignItems="flex-start" w="100%" justifyContent="center">
            <VStack>
              <HStack alignItems={"baseline"} textAlign={"center"}>
                <Text fontWeight="bold" fontSize={listingTextSize}>
                  ◎{totalSales.toLocaleString("en-US", {
                    maximumFractionDigits: 3,
                  })}
                </Text>
                <Text color="gray" fontSize={listingTextSize}>
                  ($
                  {(totalSales * solPrice).toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                  })}
                  )
                </Text>
              </HStack>
              <Text colorScheme="gray" fontSize={listingLabelSize}>
                Total Sales
              </Text>
            </VStack>
            <VStack>
              <Text fontWeight="bold" fontSize={listingTextSize}>
                {inksSold}
              </Text>
              <Text colorScheme="gray" fontSize={listingLabelSize} whiteSpace="nowrap">
                Inks Sold
              </Text>
            </VStack>
            <VStack>
              <HStack alignItems={"baseline"}>
                <Text fontWeight="bold" fontSize={listingTextSize}>
                  ◎{balance.toLocaleString("en-US", {
                    maximumFractionDigits: 3,
                  })}
                </Text>
                <Text color="gray" fontSize={listingTextSize}>
                  ($
                  {(balance * solPrice).toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                  })}
                  )
                </Text>
              </HStack>
              <Text colorScheme="gray" fontSize={listingLabelSize}>
                Balance
              </Text>
            </VStack>
          </HStack>
          <Text fontSize={["xl", "xl", "2xl"]} colorScheme="gray" maxW="3xl">
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
