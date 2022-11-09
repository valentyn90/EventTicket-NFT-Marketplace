// import { EventProvider } from "@/components/Events/hooks/useEventHook";
import EventList from "@/components/Events/views/event/EventList";
// import EventListHeader from "@/components/Events/views/event/EventListHeader";
import { Container, Stack } from "@chakra-ui/react";
import Head from "next/head";

const meta = (
  <Head>
    <title>Events List</title >
    <meta property="og:title" key="title" content={`Events List`} />
    {/* <meta property="og:image" key="preview" content={`/img/drops.png`} /> */}
  </Head>
);

const Events = () => {
  return (
    // <EventProvider>
      <Container maxW="7xl">
        {meta}
        <Stack direction="column" spacing={8}>

          {/* <EventListHeader /> */}
          <EventList />
        </Stack>
      </Container>
    // </EventProvider>
  );
};

// Automatically redirect to /events/1

export async function getServerSideProps(context: any) {

  return {
    redirect: {
      destination: '/events/1',
      permanent: false,
    },
  }
}


export default Events;
