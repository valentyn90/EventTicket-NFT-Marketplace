import TicketFAQ from "@/components/Events/components/TicketFAQ";
import EventPaymentConfirmation from "@/components/Events/views/[id]/EventPaymentConfirmation";
import { useRouter } from "next/router";

const Confirmation = () => {
  const router = useRouter();
  const { confirm_info } = router.query;
  console.log("the query are", router.query);

  switch (confirm_info) {
    case "ticket":
      return (
        <>
          <EventPaymentConfirmation />
          <hr
            style={{
              border: "1px solid #525AB2",
              boxShadow: "0px 0px 20px #4B9CD3, 0px 0px 30px #4B9CD3",
            }}
          />
          <TicketFAQ />
        </>
      );
    default:
      return <div>Not Found</div>;
  }
};

export default Confirmation;
