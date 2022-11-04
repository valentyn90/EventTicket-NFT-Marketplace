import { Button, Stack, Text } from "@chakra-ui/react";
import Container from "@/components/ui/_partials/Container";
import TicketOrderCard from "../../components/TicketOrderCard";
import { eventTabs } from "../../utils/tier";
import { TicketType } from "../../types";

const EventPaymentConfirmation = () => {
  return (
    <Container>
      <Stack spacing={8}>
        <Stack
          textAlign="center"
          justifyContent="center"
          alignItems="center"
          mt={4}
          spacing={3}
        >
          <Text fontSize="3xl" fontWeight="bold" letterSpacing="widest">
            Your ticket(s) have been
            <Text color="teal">purchased!</Text>
          </Text>
          <Text fontSize="sm" color="white">
            <span
              style={{
                color: "white",
              }}
            >
              You can view your ticekt(s) at any time by logging into the{" "}
            </span>
            <a
              target="_blank"
              href=""
              style={{
                color: "teal",
                textDecoration: "none",
              }}
            >
              website
            </a>
          </Text>
          <Button
            variant="outline"
            borderColor="#0E9DE5"
            color="#0E9DE5"
            size={"lg"}
            w={["full", "md"]}
            transform="matrix(0.89, 0, -0.58, 1, 0, 0)"
          >
            <Text
              textTransform="uppercase"
              fontStyle="normal"
              fontWeight="bold"
              transform="matrix(1, 0, 0.5, 0.8, 0, 0)"
            >
              Login to view ticket(s)
            </Text>
          </Button>
        </Stack>
        <Stack spacing={2}>
          <Text fontSize="lg" fontWeight="bold">
            Your Order:
          </Text>
          <Stack spacing={2} alignItems="center">
            {eventTabs.map((ticket: TicketType) => (
              <div key={ticket.id}>
                <TicketOrderCard ticket={ticket} />
              </div>
            ))}
          </Stack>
        </Stack>
      </Stack>
    </Container>
  );
};

export default EventPaymentConfirmation;
