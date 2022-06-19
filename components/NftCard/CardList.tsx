import ListingData from "@/types/ListingData";
import MarketplaceNft from "@/types/MarketplaceNft";
import { ModalContentType } from "@/types/ModalContentType";
import Nft from "@/types/Nft";
import NftOwner from "@/types/NftOwner";
import OrderBook from "@/types/OrderBook";
import SellData from "@/types/SellData";
import { Box, Grid } from "@chakra-ui/layout";
import React, { useEffect } from "react";
import CardListItemNew from "./CardListItemNew";
import { extendTheme } from "@chakra-ui/react";
import CardListItem from "./CardListItem";
import getSolPrice from "@/hooks/nft/getSolPrice";
import NftItem from "@/types/NftItem";
import InfiniteScroll from "react-infinite-scroll-component";


interface Props {
  listType: ModalContentType;
  nfts?: Nft[];
  listingData?: ListingData[];
  marketplaceNfts?: NftItem[];
}

const CardList: React.FC<Props> = ({
  nfts,
  listType,
  listingData,
  marketplaceNfts,
}) => {

  const solPrice = getSolPrice()

  const [mktplaceNftsToShow, setMktplaceNftsToShow] = React.useState<any[]>([]);
  const [nftsToShow, setNftsToShow] = React.useState<any[]>([]);

  const [cardListNew, setCardListNew] = React.useState<any[]>([]);

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

  } else if (marketplaceNfts) {
    cardList = marketplaceNfts.map((m) => {
      return (
        <CardListItemNew
          key={m.nft_id}
          listType={listType}
          nft_id={m.nft_id}
          nft={m.nft}
          price={m.price}
          sol_price={solPrice.solPrice}
        // screenshot_url={m.screenshot_url}
        // sellData={m.sellData}
        />
      );
    });
    if (cardList.length === 0) {
      // cardList = ""
      cardList = <div>Nothing left to show! <br></br>Try a different search.</div>
    }

  }
  else if (nfts) {
    cardList = nfts.map((nft) => {
      return <CardListItemNew key={nft.id} nft={nft} nft_id={nft.id} listType={listType} />;
    });
  }

  useEffect(() => {
    if (marketplaceNfts) {
      setMktplaceNftsToShow(marketplaceNfts.slice(0, 10));
    }
  }, [marketplaceNfts]);

  useEffect(() => {
    if (!listingData && nfts) {
      setNftsToShow(nfts.slice(0, 10));
    }
  }, [nfts]);

  useEffect(() => {
    cardList = mktplaceNftsToShow.map((m) => {
      return (
        <CardListItemNew
          key={m.nft_id}
          listType={listType}
          nft_id={m.nft_id}
          nft={m.nft}
          price={m.price}
          sol_price={solPrice.solPrice}
        // screenshot_url={m.screenshot_url}
        // sellData={m.sellData}
        />
      );
    });
    setCardListNew(cardList);
  }, [mktplaceNftsToShow]);

  useEffect(() => {
    cardList = nftsToShow.map((nft) => {
      return (
        <CardListItemNew key={nft.id} nft={nft} nft_id={nft.id} listType={listType} />
      );
    });
    setCardListNew(cardList);
  }, [nftsToShow]);

  const loadMore = () => {
    console.log("Loading more...")
    let currentLength = 10
    if (marketplaceNfts) {
      currentLength = mktplaceNftsToShow.length;
      setMktplaceNftsToShow(marketplaceNfts.slice(0, currentLength + 10));
    }
    if (!listingData && nfts) {
      currentLength = nftsToShow.length;
      setNftsToShow(nfts.slice(0, currentLength + 10));
    }
  }


  if (cardList instanceof Array) {
    if (cardList.length === 1) {
      console.log("only1")
      return cardList[0] as JSX.Element
    }
    else {
      if(listingData && nfts){
       return (

            <Grid
              id="cardGrid"
              w="100%"
              mt={8}
              templateColumns={{
                base: "repeat(auto-fit, 166px)",
                sm: "repeat(auto-fit, 170px)",
                md: "repeat(auto-fit, 230px)",
                lg: "repeat(auto-fit, 250px)",
              }}
              justifyContent={["space-around", "space-around", "center"]}
              justifyItems="center"
              gap={[2, 4, 6]}
            >
  
              {cardList} 

  
            </Grid>

  
  
        )

      }
      return (
        <InfiniteScroll
          dataLength={cardListNew.length}
          next={loadMore}
          hasMore={true}
          loader={<div></div>}
        >

          <Grid
            id="cardGrid"
            w="100%"
            mt={8}
            templateColumns={{
              base: "repeat(auto-fit, 166px)",
              sm: "repeat(auto-fit, 170px)",
              md: "repeat(auto-fit, 230px)",
              lg: "repeat(auto-fit, 250px)",
            }}
            justifyContent={["space-around", "space-around", "center"]}
            justifyItems="center"
            gap={[2, 4, 6]}
          >

            {/* {(listingData && nfts) ? cardList : cardListNew} */}
            {cardListNew}

          </Grid>
        </InfiniteScroll>


      )
    }
  }
  return (
    <Box></Box>
  )

};

export default CardList;
