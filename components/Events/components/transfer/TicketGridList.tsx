import React from "react";
import { Grid, GridItem, Box, Text } from "@chakra-ui/react";
import CustomCheckbox from "@/components/ui/_partials/CustomCheckbox";
import { find } from "lodash";
import TicketCard from "../TicketCard";
import { TICKET } from "../../hooks/useTicketHooks";

interface TicketGridListProps {
  hideCheckbox?: boolean;
  tickets: any;
  selectedTickets?: any;
  setSelectedTickets?: any;
}
const TicketGridList = (props: TicketGridListProps) => {
  const { hideCheckbox, selectedTickets, setSelectedTickets, tickets } = props;

  const handleChange = (item: TICKET) => {
    const isExist = find(selectedTickets, (ticket) => {
      return ticket.ticket_id === item.ticket_id;
    });
    if (!isExist) {
      setSelectedTickets([...selectedTickets, item]);
    } else {
      const filtered = selectedTickets.filter((ticket: any) => {
        return ticket.ticket_id !== item.ticket_id;
      });
      setSelectedTickets(filtered);
    }
  };

  return (
    <Grid
      templateColumns={[
        hideCheckbox ? "repeat(2, 1fr)" : "repeat(2, 1fr)",
        hideCheckbox ? "repeat(12, 1fr)" : "repeat(6, 1fr)",
      ]}
      gap={!hideCheckbox ? 8 : 4}
    >
      {(tickets || []).map((item: TICKET) => (
        <GridItem
          w="100%"
          display="column"
          justifyContent="center"
          justifyItems="center"
          alignItems="center"
          key={item.ticket_id}
          onClick={() => handleChange(item)}
        >
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            justifyItems="center"
            position="relative"
          >
            <TicketCard
              ticket={item}
              isSmaller
              isDark={
                !hideCheckbox &&
                Boolean(
                  find(selectedTickets, (ticket) => {
                    return ticket.ticket_id === item.ticket_id;
                  })
                )
              }
            />
            <Box hidden={hideCheckbox} onChange={() => handleChange(item)}>
              <CustomCheckbox
                checked={Boolean(
                  find(selectedTickets, (ticket) => {
                    return ticket.ticket_id === item.ticket_id;
                  })
                )}
                onChange={() => handleChange(item)}
              />
            </Box>
          </Box>
          <Text textAlign="center" fontSize="xl" fontWeight="bold">
            GA - 6
          </Text>
        </GridItem>
      ))}
    </Grid>
  );
};

export default TicketGridList;
