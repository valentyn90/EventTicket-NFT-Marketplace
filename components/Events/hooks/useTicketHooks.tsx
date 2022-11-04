import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { find } from "lodash";
import React, { useState } from "react";

const getTicketByEventId = async (eventId: string) => {
  console.log("the ticket fetching by event id", {
    eventId,
  });
  return await axios.get(`/api/events/getTickets?event_id=${eventId}`);
};

export type EVENTINTICKET = {
  event_id: string;
  name: string;
  description: string;
  image: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  state: string;
};

export interface TICKET {
  ticket_id: string;
  event: EVENTINTICKET;
  owner: string;
  section: string;
  row: string;
  seat: string;
}

interface useTicketHooksProps {
  eventId?: string;
}

const useTicketHooks = (props: useTicketHooksProps) => {
  const { eventId } = props;

  const [tickets, setTickets] = useState<TICKET[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TICKET[]>([]);

  const isExistTicket = (selected: TICKET) => {
    return find(selectedTicket, (ticket) => {
      return ticket.ticket_id === selected.ticket_id;
    });
  };

  return {
    ticketQuery: useQuery(
      ["tickets", eventId],
      () => getTicketByEventId(String(eventId)),
      {
        onSuccess: (data) => {
          setTickets(data?.data);
        },
        enabled: !!eventId,
      }
    ),
    isExistTicket,

    tickets,
    selectedTicket,
    setSelectedTicket,
  };
};

export default useTicketHooks;
