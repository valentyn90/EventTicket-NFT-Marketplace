import { createContext, useContext } from "react";
export const EventContext = createContext({} as any);
const { Provider } = EventContext;

import { extend, find, uniqBy } from "lodash";
import { useState } from "react";
import { EventType, SelectedEventTicketType } from "../types";
// import { verifyUserExist } from "../utils/verifyUserExist";
// import { stripePayment, StripePayment } from "../utils/stripePayment";
import useStripe from "@/hooks/stripe/useStripe";
import { useRouter } from "next/router";

const useEventHookProvider = () => {
  const {
    getPaidByStripe: { mutateAsync, isLoading },
  } = useStripe();
  const router = useRouter();
  const { tid } = router.query;

  const [selectedTicket, setSelectedTicket] = useState([] as EventType[]);
  const [selectedEventTicket, setSelectedEventTicket] =
    useState<SelectedEventTicketType>({
      quantity: 1,
    } as SelectedEventTicketType);

  const isTicketSelected = (event: EventType) => {
    const isExist = find(selectedTicket, (ticket) => {
      return ticket.id === event.id;
    });
    return !!isExist;
  };

  const chooseTicketToBuy = (choosenTicket: EventType) => {
    const isExist = find(selectedTicket, (ticket) => {
      return ticket.id === choosenTicket.id;
    });
    if (isExist) {
      setSelectedTicket(
        uniqBy(
          selectedTicket.filter((ticket) => {
            return ticket.id !== choosenTicket.id;
          }),
          "id"
        )
      );
    } else {
      setSelectedTicket(uniqBy([...selectedTicket, choosenTicket], "id"));
    }
  };

  const updateSelectedEventTicket = (
    data: Partial<SelectedEventTicketType>
  ) => {
    setSelectedEventTicket(extend(selectedEventTicket, data));
  };

  const handleStripePayment = async () => {
    router.push(
      `/confirmation?event=${selectedEventTicket.ticketId}&confirm_info=ticket&ticket=${selectedEventTicket.ticketType}`,
      "/confirmation/ticket"
    );
    // const user = await verifyUserExist(selectedEventTicket.email);
    // const stripeData: StripePayment = {
    //   productName: selectedEventTicket.ticketType,
    //   price: 200,
    //   email: selectedEventTicket.email,
    //   user_id: user?.id,
    //   price_usd: 200,
    //   nft_id: "",
    //   sn: "",
    //   order_book_id: "",
    //   mint: "",
    //   price_sol: 200,
    // };
    // mutateAsync(stripeData);
    // const payment = await stripePayment(stripeData);
    // console.log("the user is with payment is", payment);
  };

  return {
    selectedTicket,
    selectedEventTicket,
    // function
    chooseTicketToBuy,
    isTicketSelected,
    updateSelectedEventTicket,
    handleStripePayment,
  };
};

export const EventProvider = ({ children }: { children: React.ReactNode }) => {
  const authData = useEventHookProvider();
  return <Provider value={authData}>{children}</Provider>;
};

export const useEventHook = () => useContext(EventContext);
