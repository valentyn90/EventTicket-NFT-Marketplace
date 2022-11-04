import { Stack, Text } from "@chakra-ui/react";
import React from "react";

const EventTransferHeader = () => {
  return (
    <Stack justifyContent="center" alignItems="center" spacing={1}>
      <Text fontSize="3xl" fontWeight="bold" letterSpacing="4px">
        Your Tickets
      </Text>
      <Text color="#7D8192">Swipe to see all tickets</Text>
    </Stack>
  );
};

export default EventTransferHeader;
