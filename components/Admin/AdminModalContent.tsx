import userStore from "@/mobx/UserStore";
import { Flex } from "@chakra-ui/layout";
import { observer } from "mobx-react-lite";
import React from "react";
import Card from "../NftCard/Card";
import { CardBox } from "../ui/CardBox";
import StaticVerifiedInkNft from "../VerifiedInkNft/StaticVerifiedInkNft";

const AdminModalContent = () => {
  return (
    <Flex
      direction={["column", "column", "row"]}
      maxH={["100%", "100%", "700px"]}
      pb={["0px", "0px", "unset"]}
    >
      <CardBox>
        <StaticVerifiedInkNft
          nftId={userStore.ui.selectedNft!.id}
          readOnly={true}
          flip={false}
        />
      </CardBox>
      <CardBox>
        <StaticVerifiedInkNft
          nftId={userStore.ui.selectedNft!.id}
          readOnly={true}
          reverse={true}
        />
      </CardBox>
    </Flex>
  );
};

export default observer(AdminModalContent);
