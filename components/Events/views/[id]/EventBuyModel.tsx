import { Box, Stack, Text, Button, Heading } from "@chakra-ui/react";

import events from "@/components/Events/events.json";
import EventTicketTier from "./EventTicketTier";
import EventTicketPurchase from "./EventTicketPurchase";
import { useRef } from "react";

const primaryColor = "#0E9DE5";

const EventBuyModel = () => {
  const purchaseTicketRef = useRef<any>();
  const onClickPurchaseTicket = () => {
    purchaseTicketRef.current.click();
    purchaseTicketRef.current.focus();
    purchaseTicketRef.current.scrollIntoView({
      behavior: "smooth",
      top: 0,
    });
  };

  return (
    <Stack w="full" spacing={[8, 16]} direction={["column", "row-reverse"]}>
      <EventTicketPurchase purchaseTicketRef={purchaseTicketRef} />
      <Stack spacing={4}>
        {/* more details */}
        <Stack spacing={4}>
          <Stack
            direction="row"
            alignContent="flex-end"
            alignItems="flex-end"
            justifyItems="flex-end"
          >
            <Text
              color={primaryColor}
              fontWeight="bold"
              textTransform="uppercase"
              letterSpacing="wide"
              fontSize="lg"
            >
              New
            </Text>
            <Text fontWeight="bold" letterSpacing="wide" fontSize="2xl">
              NFT Tickets
            </Text>
          </Stack>
          <Box>
            <Text fontSize="md">
              Same great event, new way to get in! When you purchase an NFT Ticket you'll get
              great access to the event, plus a digital collectible featuring action from 
              your game.
            </Text>
          </Box>
        </Stack>

        {/* tier info */}
        <Stack spacing={2}>
          <Heading size="sm">Pick from three NFT ticket tiers:</Heading>
          <EventTicketTier />
        </Stack>

        {/* purchase button */}
        <Box display={["flex", "none"]} justifyContent="center">
          <Button
            variant="ghost"
            background="transparent"
            size={"lg"}
            w="full"
            border="1px solid #0E9DE5"
            transform="matrix(0.89, 0, -0.58, 1, 0, 0)"
            onClick={() => onClickPurchaseTicket()}
          >
            <Text
              textTransform="uppercase"
              fontStyle="normal"
              fontWeight="bold"
              transform="matrix(1, 0, 0.5, 0.8, 0, 0)"
            >
              Buy Ticket
            </Text>
          </Button>
        </Box>
      </Stack>
    </Stack>
  );
};

export default EventBuyModel;
