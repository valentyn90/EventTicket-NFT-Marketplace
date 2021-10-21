import { getMintedNfts } from "@/supabase/marketplace";
import Nft from "@/types/Nft";
import { Grid } from "@chakra-ui/layout";
import React, { useEffect, useState } from "react";
import MarketplaceCard from "./MarketplaceCard";

const MarketplaceCardList = () => {
  const [mintedNfts, setMintedNfts] = useState<Nft[]>([]);
  useEffect(() => {
    // Can also be fetched in getServerSideProps if data needs to be preloaded
    getMintedNfts().then((res) => setMintedNfts([...res]));
  }, []);
  return (
    <Grid
      mt={8}
      templateColumns={[
        "repeat(auto-fit, 150px)",
        "repeat(auto-fit, 175px)",
        "repeat(auto-fit, 200px)",
      ]}
      justifyContent={["space-between", "space-around", "center"]}
      gap={[2, 4, 8]}
    >
      {mintedNfts.map((nft) => {
        return <MarketplaceCard key={nft.id} nft={nft} />;
      })}
    </Grid>
  );
};

export default MarketplaceCardList;
