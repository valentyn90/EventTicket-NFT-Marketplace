import userStore from "@/mobx/UserStore";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import { HStack, Stack, Text, VStack } from "@chakra-ui/layout";
import {
  Button,
  Input,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";

const VerifiedStatus = () => {
  const toast = useToast();
  const [referralCode, setReferralCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  let verifiedComponent;

  if (userStore.userDetails.verified_user) {
    verifiedComponent = (
      <Text color="blue.400" fontSize="lg" fontWeight="bold">
        Verified
      </Text>
    );
  } else {
    verifiedComponent = (
      <Text color="red.600" fontSize="lg" fontWeight="bold">
        Not Verified
      </Text>
    );
  }

  async function handleReferralCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (referralCode.length < 8 && referralCode.length > 2) {
      setSubmitting(true);

      const res = await userStore.userDetails.updateReferringUserId(
        referralCode
      );
      setSubmitting(false);
      toast({
        position: "top",
        description: res.message,
        status: res.success ? "success" : "error",
        duration: 3500,
        isClosable: true,
      });
    }
  }

  return (
    <VStack align="start" justify="stretch" width="100%">
      <HStack>
        <Text mr={2} fontWeight="bold" fontSize="xl" color="gray">
          Verified Status
        </Text>
        <Popover trigger="hover">
          <PopoverTrigger>
            <InfoOutlineIcon cursor="pointer" color="gray" />
          </PopoverTrigger>
          <PopoverContent>
            <PopoverBody>
              For our initial beta period, we are limiting minting to only
              Verified athletes. You will become a Verified Athlete when you’ve
              been referred by another Verified Athlete, and our team has
              approved your VerifiedInk Proof.
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </HStack>
      {verifiedComponent}
      {!userStore.userDetails.verified_user && (
        <form onSubmit={handleReferralCodeSubmit}>
          <Stack
            direction={["column", "column", "row"]}
            width="100%"
            align={["start", "start", "center"]}
          >
            <Text>Enter Referral Code:</Text>
            <Stack direction={["column", "row"]} align={["start", "center"]}>
              <Input
                width="175px"
                placeholder="ABCDEF"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
              />
              <Button colorScheme="blue" color="white" type="submit">
                {submitting ? <Spinner /> : "Update Referral"}
              </Button>
            </Stack>
          </Stack>
        </form>
      )}
    </VStack>
  );
};

export default observer(VerifiedStatus);
