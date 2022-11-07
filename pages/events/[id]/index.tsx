import Container from "@/components/ui/_partials/Container";
import { Stack, Text, Box } from "@chakra-ui/react";
import Head from "next/head";
import React from "react";

import { EventProvider } from "@/components/Events/hooks/useEventHook";
import EventInfo from "@/components/Events/views/[id]/EventInfo";
import EventBuyModel from "@/components/Events/views/[id]/EventBuyModel";
import events from "@/components/Events/events.json";

const EventDetail = () => {

  const event = events[0]

  const meta = (
    <Head>
      <title>{event.event_name}</title>
      <meta property="og:title" key="title" content={event.event_name + " Tickets"}  />
      <meta property="og:image" key="preview" content={`https://epfccsgtnbatrzapewjg.supabase.co/storage/v1/object/public/private/static/ticket_tiers/0/0.png`} />
      <meta property="og:video" key="video" content={`https://epfccsgtnbatrzapewjg.supabase.co/storage/v1/object/public/private/static/ticket_tiers/1/1.mp4`} />
    </Head>
  );

  return (
    <EventProvider>
      <Container>
        {meta}
        <Stack spacing={[2, 4]}>
          <EventInfo />
          <EventBuyModel />
          {/* how its works */}
        </Stack>
      </Container>
      <hr
        style={{
          border: "1px solid #525AB2",
          boxShadow: "0px 0px 20px #4B9CD3, 0px 0px 30px #4B9CD3",
        }}
      />
      <Box>
        <Container>
          <Stack mt={8}>
            <Text
              fontWeight="bold"
              fontSize="3xl"
              letterSpacing="md"
              textAlign="center"
            >
              How it works
            </Text>
            <Text fontSize="xl" textAlign="center">
              Each NFT Ticket gets you a seat at the event, the location
              depending on the ticket tier level.
            </Text>
            <Text textAlign="center" fontSize="xl">
              After the event, your ticket will transform into a limited edition
              NFT from the game, featuring an in-game player + highlight.
            </Text>
          </Stack>
        </Container>
      </Box>
    </EventProvider>
  );
};

export default EventDetail;
