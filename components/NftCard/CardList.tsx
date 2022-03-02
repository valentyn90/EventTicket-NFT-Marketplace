import ListingData from "@/types/ListingData";
import MarketplaceNft from "@/types/MarketplaceNft";
import { ModalContentType } from "@/types/ModalContentType";
import Nft from "@/types/Nft";
import NftOwner from "@/types/NftOwner";
import OrderBook from "@/types/OrderBook";
import SellData from "@/types/SellData";
import { Grid } from "@chakra-ui/layout";
import React from "react";
import CardListItem from "./CardListItem";

interface Props {
  listType: ModalContentType;
  nfts?: Nft[];
  listingData?: ListingData[];
  marketplaceNfts?: MarketplaceNft[];
}

const CardList: React.FC<Props> = ({
  nfts,
  listType,
  listingData,
  marketplaceNfts,
}) => {
  let cardList;
  if (listingData && nfts) {
    cardList = listingData.map((listing, i) => {
      const nft = nfts.find((nft) => nft.id === listing.nft_id);
      if (nft) {
        return (
          <CardListItem
            key={i}
            nft={nft}
            listType={listType}
            serial_no={listing.serial_no}
            price={listing.price}
          />
        );
      }
    });
  } else if (nfts) {
    cardList = nfts.map((nft) => {
      return <CardListItem key={nft.id} nft={nft} listType={listType} />;
    });
  } else if (marketplaceNfts) {
    cardList = marketplaceNfts.map((m) => {
      return (
        <CardListItem
          key={m.nft.id}
          nft={m.nft}
          listType={listType}
          sellData={m.sellData}
        />
      );
    });
  }

  return (
    <Grid
      w="100%"
      mt={8}
      templateColumns={[
        "repeat(auto-fit, 170px)",
        "repeat(auto-fit, 225px)",
        "repeat(auto-fit, 250px)",
      ]}
      justifyContent={["space-around", "space-around", "center"]}
      gap={[2, 4, 6]}
    >
      {cardList}
    </Grid>
  );
};

export default CardList;
