import { Box, Stack, Text, Image, Center } from "@chakra-ui/react";
import moment from "moment";
import { QRCode } from "react-qrcode-logo";

import { TICKET } from "../hooks/useTicketHooks";

interface TicketCardProps {
  ticket: any;
  isDark?: boolean;
  isSmaller?: boolean;
}

const TicketCard = (props: TicketCardProps) => {
  const { ticket, isSmaller, isDark } = props;
  const {
    event: { name, date, venue, time, event_id },
    ticket_id,
    row,
    section,
    seat,
  } = ticket;
  const qrValues = {
    eventName: name,
    eventId: event_id,
    ticketId: ticket_id,
    section: section,
    row: row,
    seat: seat,
  };

  const headingFontSize = isSmaller ? "12px" : "16px";
  const bodyFontSize = isSmaller ? "8px" : "10px";
  return (
    <Stack
      height="100%"
      width="100%"
      maxW={["unset","300px"]}
      rounded="lg"
      border="2px solid white"
      filter={isDark ? "grayscale()" : ""}
    >
      <Stack
        alignItems="center"
        spacing={1}
        flex={1}
        p={2}
        rounded="md"
        background="linear-gradient(180deg, #0E9DE5 36.94%, #525AB2 64.83%)"
      >
        <Stack spacing={0}>
          <Text textAlign="center" fontSize="16px" fontWeight="bold">
            {name}
          </Text>
          <Text textAlign="center" fontSize="10px">
          {moment(ticket.event.event_start).format("MMM DD, YYYY h:mm a")}
          </Text>
          <Text textAlign="center" fontSize="10px">
            {ticket.event.event_venue_name}
          </Text>
        </Stack>

        <Box>
          <QRCode
            bgColor="transparent"
            fgColor="white"
            size={isSmaller ? 60 : 120}
            qrStyle="dots"
            value={JSON.stringify(qrValues)}
          />
        </Box>
        <Text>{ticket.tier.section} - {ticket.tier.location}</Text>
        <Stack direction="row" alignItems="center" justifyContent="center">
          <Stack direction="row" alignItems="center">
            <Text fontSize={bodyFontSize}>Section</Text>
            <Text fontSize={headingFontSize} fontWeight="bold">
              {section}
            </Text>
          </Stack>
          <Stack direction="row" alignItems="center">
            <Text fontSize={bodyFontSize}>Row</Text>
            <Text fontSize={headingFontSize} fontWeight="bold">
              {row}
            </Text>
          </Stack>
          <Stack direction="row" alignItems="center">
            <Text fontSize={bodyFontSize}>Seat</Text>
            <Text fontSize={headingFontSize} fontWeight="bold">
              {seat}
            </Text>
          </Stack>
        </Stack>
      </Stack>
      <Stack
        height={isSmaller ? "80px" : "110px"}
        px={isSmaller ? 2 : 4}
        rounded="md"
        background="linear-gradient(180deg, rgba(0, 7, 41, 0) 0%, rgba(21, 30, 55, 0) 0.01%, #000729 56.44%)"
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Text fontSize={headingFontSize} fontWeight="bold" width={"80px"}>
           {ticket.tier.name} TICKET
          </Text>
          <Box boxSize={isSmaller ? "30px" : "40px"}>
            <Image
              src="/img/ticket/usg.png"
              height="100%"
              width="100%"
              objectFit="contain"
            />
          </Box>
        </Stack>
        <Center>
          <Box boxSize={isSmaller ? "30px" : "40px"}>
            <Image
              src="/img/ticket/logo.svg"
              height="100%"
              width="100%"
              objectFit="contain"
            />
          </Box>
        </Center>
      </Stack>
    </Stack>
  );
};

export default TicketCard;
