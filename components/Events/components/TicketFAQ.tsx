import Container from "@/components/ui/_partials/Container";
import { Stack, Text } from "@chakra-ui/react";

const TicketFAQ = () => {
  return (
    <Container>
      <Stack spacing={4} mt={6}>
        <Text
          fontSize="4xl"
          fontWeight="bold"
          letterSpacing="widest"
          textAlign="center"
        >
          FAQ
        </Text>
        <Text textAlign="center" fontSize="lg">
          Each NFT Ticket gets you a seat at the event, the location location
          depending on the ticket tier level.
        </Text>
        <Text textAlign="center" fontSize="lg">
          After that event, your ticket will transform into a limited edition
          NFT from the game, featuring on in-game player + highlight
        </Text>
        <Text textAlign="center" fontSize="lg">
          You can login in www.website.com any time to view or download your
          ticket. And it to your Apple Wallet for easy access into the game.
        </Text>
      </Stack>
    </Container>
  );
};

export default TicketFAQ;
