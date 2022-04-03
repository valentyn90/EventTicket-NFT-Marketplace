import userStore from "@/mobx/UserStore";
import { Skeleton, Stack } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import React from "react";
import CardSerialNoFunctions from "../NftCard/CardSerialNoFunctions";

interface Props {}

const MarketplaceModalBuy: React.FC<Props> = ({}) => {
  return userStore.ui.selectedNft ? (
    <CardSerialNoFunctions
      nft={userStore.ui.selectedNft}
      parentComponent={"marketplace-buy"}
    />
  ) : (
    <Stack m={12}>
      <Skeleton height="20px" />
      <Skeleton height="20px" />
      <Skeleton height="20px" />
    </Stack>
  );
};

export default observer(MarketplaceModalBuy);
