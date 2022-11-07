import { Stack } from "@chakra-ui/react";

import Button from "@/components/ui/_partials/Button";
import Container from "@/components/ui/_partials/Container";
import EventTicketSlider from "../../components/transfer/EventTicketSlider";
import EventTransferHeader from "../../components/transfer/EventTransferHeader";
import { EventTicketScreenType } from "@/pages/events/[id]/tickets";
import useTicketHooks from "../../hooks/useTicketHooks";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface TicketViewProps {
  changeScreen: (screen: EventTicketScreenType) => void;
  isSuccess?: boolean;
}
const TicketView = (props: TicketViewProps) => {
  // const { tickets } = useTicketHooks({});
  const router = useRouter();

  const { id } = router.query;

  const {isLoading, isError, data: tickets, error} = useQuery(
    ['active_tickets'],
     async () => {
      const res = await fetch(`/api/events/getTickets?event_id=${id}`);
      const j = await res.json();
      return j;
     },
    {      
      enabled: !!id 
    }
  )
  // This is sometimes running on the server, it really shouldn't be. 
  console.log("the tickets", tickets);
  const { changeScreen, isSuccess } = props;
  const handleButtonClicked = () => {
    if (isSuccess) {
      console.log("cancelled");
    } else {
      changeScreen("select");
    }
  };

  return (
    <Container>
      <Stack spacing={16}>
        <EventTransferHeader />
        {!isLoading && <EventTicketSlider tickets={tickets} isSuccess={isSuccess} />}
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
            buttonLabel={isSuccess ? "Cancel Transfer" : "Transfer Tickets"}
            variant="ghost"
            size={"lg"}
            w="auto"
            border="1px solid #0E9DE5"
            disabled={true} // Disabling until we add the transfer logic
            onClick={() => handleButtonClicked()}
          />
        </Stack>
      </Stack>
    </Container>
  );
};

export default TicketView;
