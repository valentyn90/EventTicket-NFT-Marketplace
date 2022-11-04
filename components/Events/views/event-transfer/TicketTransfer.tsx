import Button from "@/components/ui/_partials/Button";
import { Stack, Text, Input, Box } from "@chakra-ui/react";
import React, { useState } from "react";
import TicketGridList from "../../components/transfer/TicketGridList";

interface TicketTransferProps {
  selectedTicket: any;
  setTransferActionSuccess: (success: boolean) => void;
  setSelectedTicket: (tickets: any) => void;
}
const TicketTransfer = (props: TicketTransferProps) => {
  const { selectedTicket, setTransferActionSuccess, setSelectedTicket } = props;
  const [showTranserEmail, setShowTranserEmail] = useState<boolean>(false);

  const handleTransfer = () => {
    if (showTranserEmail) {
      setTransferActionSuccess(true);
      setShowTranserEmail(false);
    } else {
      setShowTranserEmail(true);
    }
  };
  return (
    <Stack spacing={4}>
      <Box height="400px" overflow="scroll">
        <TicketGridList
          hideCheckbox
          tickets={selectedTicket}
          selectedTickets={selectedTicket}
          setSelectedTickets={setSelectedTicket}
        />
      </Box>
      <Stack justifyContent="center" alignItems="center" justifyItems="center">
        <Stack
          w={["100%", "50%"]}
          display="flex"
          justifyContent="center"
          alignItems="center"
          justifyItems="center"
          spacing={4}
        >
          {showTranserEmail && (
            <>
              <Text fontSize="xl" textAlign="center">
                Transfer Tickets
              </Text>
              <Input borderColor="#525AB2" placeholder="Email" />
              <Text color="gray.500" textAlign="center">
                All transfers are final once the recipient has accepted the
                ticket.
              </Text>
            </>
          )}
          <Button
            isTrapigium
            buttonLabel={`Transfer ${selectedTicket.length} tickets`}
            variant="ghost"
            size={"lg"}
            w="auto"
            border="1px solid #0E9DE5"
            onClick={() => handleTransfer()}
          />
        </Stack>
      </Stack>
    </Stack>
  );
};

export default TicketTransfer;
