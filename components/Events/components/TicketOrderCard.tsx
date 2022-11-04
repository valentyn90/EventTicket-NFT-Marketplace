import { Stack, Box, Image, VStack, HStack, Text } from "@chakra-ui/react";
import { TicketType } from "../types";
import { getNftTicketColor } from "../utils/getNftTicketColor";

interface TicketOrderCardProps {
  ticket: TicketType;
}

const TicketOrderCard = (props: TicketOrderCardProps) => {
  const { ticket } = props;
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      border="1px solid #0E9DE5"
      minH="12vh"
      rounded="md"
      width={["auto", "500px"]}
    >
      <Box boxSize="130px">
        <Image
          src="/img/ticket/ticket.png"
          alt="Nass Cunningham"
          width="100%"
          height="100%"
          objectFit="contain"
          fallbackSrc="https://verifiedink.us/img/card-mask.png"
        />
      </Box>
      <VStack
        flex={1}
        w="full"
        justifyContent="flex-start"
        alignItems="flex-start"
        justifyItems="flex-start"
        spacing={0}
      >
        <HStack
          alignItems="center"
          justifyContent="flex-start"
          justifyItems="flex"
        >
          <Text
            fontWeight="bold"
            fontSize="xl"
            textTransform="uppercase"
            color={getNftTicketColor(ticket.id)}
          >
            {ticket.type}
          </Text>
          <Text fontWeight="bold" fontSize="xl">
            Tier
          </Text>
        </HStack>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Stack direction="row" alignItems="center">
            <Text fontSize="md">Section</Text>
            <Text
              fontSize="md"
              fontWeight="bold"
              color={getNftTicketColor(ticket.id)}
            >
              E
            </Text>
          </Stack>
          <Stack direction="row" alignItems="center">
            <Text fontSize="md">Row</Text>
            <Text
              fontSize="md"
              fontWeight="bold"
              color={getNftTicketColor(ticket.id)}
            >
              E
            </Text>
          </Stack>
          <Stack direction="row" alignItems="center">
            <Text fontSize="md">Seat</Text>
            <Text
              fontSize="md"
              fontWeight="bold"
              color={getNftTicketColor(ticket.id)}
            >
              E
            </Text>
          </Stack>
        </Stack>
        <Text fontSize="sm" color="gray.500">
          Click to view or download ticket
        </Text>
      </VStack>
    </Stack>
  );
};

export default TicketOrderCard;
