import { Stack, HStack, Image, Text, Box } from "@chakra-ui/react";
import React from "react";
import { TicketType } from "../../types";
import { eventTabs } from "../../utils/tier";
import { getNftTicketColor } from "../../utils/getNftTicketColor";
import TicketPlaceholder from "../../components/TicketPlaceholder";

const EventTicketTier = () => {
  return (
    <Stack pr={2}>
      {eventTabs.map((tab: TicketType) => (
        <HStack  alignItems="center" key={tab.title} gridGap={5}>
          <Box  minW="100px"  flex={1} maxW="200px">
            {/* <Image
              src={tab.image}
              alt="Ticket"
              width="100%"
              height="100%"
              objectFit="contain"
              fallbackSrc="https://verifiedink.us/img/card-mask.png"
            /> */}
            <TicketPlaceholder tier={tab.id} />
          </Box>
          <Stack
            justifyContent="flex-start"
            alignItems="flex-start"
            spacing={0}
            flex={1}
          >
            <Text
              fontWeight="bold"
              fontSize="xl"
              textTransform="uppercase"
              textAlign="justify"
              color={getNftTicketColor(tab.id)}
            >
              {tab.name}
            </Text>
            {/* <Text textAlign="left" fontSize="sm">
              {tab.subtitle}
            </Text> */}
            <Stack lp={2} fontSize={["14px","14px","18px"]}>
              
                <ul style={{"listStylePosition": "outside"}}>
                  {tab.utility.map((utility: string) => (
                    <li>{utility}</li>
                  ))}

                </ul>
              
            </Stack>
          </Stack>
        </HStack>
      ))}
    </Stack>
  );
};

export default EventTicketTier;
