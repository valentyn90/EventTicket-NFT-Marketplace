import userStore from "@/mobx/UserStore";
import { Text, VStack } from "@chakra-ui/layout";
import { observer } from "mobx-react-lite";
import React from "react";
import Steps from "rsuite/Steps";

const styles = {
  display: "inline-table",
  verticalAlign: "top",
};

const MintingProgress = () => {
  return (
    <VStack align="start">
      <Text fontWeight="bold" fontSize="xl" color="gray">
        Minting Progress
      </Text>
      <Text>Completed {userStore.nftMintingProgress}/3 Steps</Text>
      <br />
      <div>
        <Steps current={userStore.nftMintingProgress} vertical style={styles}>
          <Steps.Item title="Started creating your VerifiedInk" />
          <Steps.Item title="Self-approve VerifiedInk Proof" />
          <Steps.Item title="VerifiedInk Minted" />
        </Steps>
      </div>
    </VStack>
  );
};

export default observer(MintingProgress);
