import Button from "@/components/ui/_partials/Button";
import Container from "@/components/ui/_partials/Container";
import { Stack } from "@chakra-ui/react";
import React from "react";
import EventTicketSlider from "../../components/transfer/EventTicketSlider";
import EventTransferHeader from "../../components/transfer/EventTransferHeader";

const YourTicket = () => {
  return (
    <Container>
      <Stack spacing={16}>
        <EventTransferHeader />
        {/* <EventTicketSlider /> Temporary hack to pass build error */}
        <Stack
          w="full"
          display="flex"
          justifyContent="center"
          alignItems="center"
          justifyItems="center"
          spacing={4}
        >
          <Button
            mt={-4}
            isTrapigium
            buttonLabel={"Transfer Tickets"}
            variant="ghost"
            size={"lg"}
            w="auto"
            border="1px solid #0E9DE5"
          />
        </Stack>
      </Stack>
    </Container>
  );
};

export default YourTicket;
