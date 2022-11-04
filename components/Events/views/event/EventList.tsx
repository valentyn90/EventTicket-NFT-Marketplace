import { Grid } from "@chakra-ui/react";
import events from "@/components/Events/events.json";
import EventItemCard from "./EventItem";
import { EventType } from "../../types";

const EventList = () => {

  


  return (
    <Grid templateColumns={["repeat(1, 1fr)"]} gap={[4, 8]}>
      {events.map((event: EventType) => (
        <EventItemCard event={event} />
      ))}
    </Grid>
  );
};

export default EventList;
