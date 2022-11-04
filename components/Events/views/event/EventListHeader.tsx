import {
  Stack,
  Text,
  Input,
  Box,
  Button,
  InputLeftAddon,
  InputGroup,
} from "@chakra-ui/react";
import { sumBy } from "lodash";
import { useState } from "react";

import { useEventHook } from "../../hooks/useEventHook";
import { EventType } from "../../types";

import EventFilter from "../../components/EventFilter";
import EventModal from "../../components/EventModal";

const EventListHeader = () => {
  const { selectedTicket } = useEventHook();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <Stack
      direction={["column-reverse", "column-reverse", "row"]}
      justifyContent="space-between"
      gridGap="2"
      alignItems={"center"}
      pt={4}
    >
      <EventFilter
        placeholder="Ticket Level"
        options={[
          { label: "All", value: "all" },
          { label: "Free", value: "free" },
          { label: "Paid", value: "paid" },
        ]}
      />
      <Stack direction="row" w={["100%", "auto"]} spacing={4}>
        <Stack direction="row" alignItems="center">
          <Text color={"whiteAlpha.600"}>Tickets</Text>
          <Input
            w="100px"
            id="selected tickets"
            value={selectedTicket.length || 0}
            type="number"
            placeholder="Number"
            variant="outline"
            borderColor={"#4e5ab5"}
            border="1px"
            backdropFilter={"blur(10px)"}
            backgroundColor={"blueBlackTransparent"}
            disabled
            _disabled={{
              color: "white",
            }}
            _placeholder={{
              color: "white",
            }}
          />
        </Stack>
        <Stack direction="row" alignItems="center">
          <Text color={"whiteAlpha.600"}>Total</Text>
          {/* <InputGroup>
            <InputLeftAddon children="$" />
            <Input
              w="100px"
              id="selected tickets"
              value={
                sumBy(selectedTicket, (item: EventType) => {
                  return item.event_price;
                }) || 0
              }
              type="number"
              placeholder="Number"
              variant="outline"
              borderColor={"#4e5ab5"}
              border="1px"
              disabled
              _disabled={{
                color: "white",
              }}
              _placeholder={{
                color: "white",
              }}
              backdropFilter={"blur(10px)"}
              backgroundColor={"blueBlackTransparent"}
            />
          </InputGroup> */}
        </Stack>
        <Box>
          <Button
            variant="outline"
            colorScheme="teal"
            rounded="md"
            width="full"
            disabled={selectedTicket.length === 0}
            onClick={() => setIsOpen(true)}
          >
            Buy All
          </Button>
        </Box>
      </Stack>
      {/* <EventModal isOpen={isOpen} onClose={() => setIsOpen(false)} /> */}
    </Stack>
  );
};

export default EventListHeader;
