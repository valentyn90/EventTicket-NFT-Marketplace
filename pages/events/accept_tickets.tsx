import { useState } from "react";

import TicketAccept from "@/components/Events/views/accept-tickets/TicketAccept";
import YourTicket from "@/components/Events/views/accept-tickets/YourTicket";

export type AccpetTicketScreen = "accept" | "your-ticket";

const AcceptTickets = () => {
  const [screen, setScreen] = useState<AccpetTicketScreen>("accept");
  const handleScreenChange = (screen: AccpetTicketScreen) => {
    setScreen(screen);
  };
  switch (screen) {
    case "accept":
      return <TicketAccept handleScreenChange={handleScreenChange} />;
    case "your-ticket":
      return <YourTicket />;
  }
};

export default AcceptTickets;
