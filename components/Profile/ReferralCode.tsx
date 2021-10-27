import userStore from "@/mobx/UserStore";
import { HStack, Text, VStack } from "@chakra-ui/layout";
import { observer } from "mobx-react-lite";
import React from "react";
import ShareButton from "../Components/ShareButton";

const ReferralCode = () => {
  return (
    <VStack spacing={4} align="start">
      <Text fontWeight="bold" fontSize="xl" color="gray">
        Your Referral Code
      </Text>
      <HStack>
        <Text mr={4}>{userStore.userDetails.referral_code}</Text>
        <ShareButton id={userStore.nft?.id} />
      </HStack>
    </VStack>
  );
};

export default observer(ReferralCode);
