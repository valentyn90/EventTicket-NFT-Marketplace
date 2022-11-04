import { useState } from "react";
import {
  Stack,
  Flex,
  Box,
  Text,
  Center,
  CircularProgress,
} from "@chakra-ui/react";
import { IoChevronBackOutline } from "react-icons/io5";

import TicketSelect from "@/components/Events/views/event-transfer/TicketSelect";
import Container from "@/components/ui/_partials/Container";
import TicketView from "@/components/Events/views/event-transfer/TicketView";
import useTicketHooks from "@/components/Events/hooks/useTicketHooks";

export type EventTicketScreenType = "transfer" | "select" | "success";

const EventTransfer = () => {
  const {
    ticketQuery: { isLoading },
  } = useTicketHooks({
    eventId: "1",
  });
  const [screen, setScreen] = useState<EventTicketScreenType>("transfer");
  const handleBack = () => {
    setScreen("transfer");
  };

  const getScreen = () => {
    switch (screen) {
      case "transfer":
        return <TicketView changeScreen={setScreen} />;
      case "select":
        return <TicketSelect changeScreen={setScreen} />;
      case "success":
        return <TicketView changeScreen={setScreen} isSuccess={true} />;
      default:
        return <p>No Screen</p>;
    }
  };

  return (
    <Stack spacing={0} mt={-4}>
      {screen !== "transfer" && (
        <Container py={4}>
          <Flex
            width="80px"
            direction="row"
            justifyItems="center"
            alignItems="center"
            alignContent="center"
            onClick={() => handleBack()}
          >
            <Text mt="0.5">
              <IoChevronBackOutline size={20} />
            </Text>
            <Text>Back</Text>
          </Flex>
        </Container>
      )}
      {isLoading && (
        <Center>
          <CircularProgress isIndeterminate color="green.300" />
        </Center>
      )}
      <Box>{getScreen()}</Box>
    </Stack>
  );
};

export default EventTransfer;
