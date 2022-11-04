import React, { useState } from "react";
import { Stack, Text, Box } from "@chakra-ui/react";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { motion } from "framer-motion";

import TicketGridList from "../../components/transfer/TicketGridList";
import { EventTicketScreenType } from "@/pages/events/[id]/tickets";
import TicketTransfer from "./TicketTransfer";
import useTicketHooks from "../../hooks/useTicketHooks";

interface TicketSelectProps {
  changeScreen: (screen: EventTicketScreenType) => void;
}
const TicketSelect = (props: TicketSelectProps) => {
  const { changeScreen } = props;

  const { tickets } = useTicketHooks({});

  const [transerActionSuccess, setTransferActionSuccess] =
    useState<boolean>(false);
  const [openTicketView, setOpenTicketView] = useState(
    transerActionSuccess ? true : false
  );
  const [selectedTicket, setSelectedTicket] = useState<any>([]);

  const dropIn = {
    hidden: {
      y: "-100vh",
      opacity: 0,
    },
    visible: {
      y: "0",
      opacity: 1,
      transition: {
        duration: 0.1,
        type: "spring",
        damping: 25,
        stiffness: 500,
      },
    },
    exit: {
      y: "100vh",
      opacity: 0,
    },
  };

  return (
    <Stack height="88vh" overflowY="scroll" p={4}>
      <TicketGridList
        tickets={tickets}
        selectedTickets={selectedTicket}
        setSelectedTickets={setSelectedTicket}
      />

      {/* footer bar in ticket  */}
      <Box position="absolute" bottom={0} left={0} zIndex={9999} w="100%">
        {openTicketView && (
          <Box
            height="100vh"
            backgroundColor="rgba(0,0,0,0.4)"
            onClick={() => setOpenTicketView(!openTicketView)}
          />
        )}
        <Stack
          bg="#000729"
          borderTop="4px solid #0E9DE5"
          borderTopRadius="20px"
          width="100%"
          maxH="100vh"
          color="white"
          padding={4}
          overflowY="hidden"
          spacing={4}
          transition="all 5s ease-in-out"
        >
          {!transerActionSuccess ? (
            <Stack
              onClick={() => setOpenTicketView(!openTicketView)}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Text fontWeight="bold" fontSize="2xl">
                Transfer{" "}
                {selectedTicket.length === 0 ? null : selectedTicket.length}{" "}
                Tickets
              </Text>
              <div>
                {openTicketView ? (
                  <IoIosArrowDown size={30} />
                ) : (
                  <IoIosArrowUp size={30} />
                )}
              </div>
            </Stack>
          ) : (
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Text fontWeight="bold" fontSize="2xl">
                Success
              </Text>
              <div>
                <IoMdClose
                  size={30}
                  onClick={() => {
                    setOpenTicketView(!openTicketView);
                    setTransferActionSuccess(false);
                    setSelectedTicket([]);
                    changeScreen("success");
                  }}
                />
              </div>
            </Stack>
          )}

          <motion.div
            initial={{ y: "100vh" }}
            animate={{ y: 0 }}
            exit={{ y: "100vh" }}
            variants={dropIn}
            transition={{ duration: 0.5 }}
          >
            {openTicketView && !transerActionSuccess ? (
              selectedTicket.length > 0 ? (
                <TicketTransfer
                  selectedTicket={selectedTicket}
                  setTransferActionSuccess={setTransferActionSuccess}
                  setSelectedTicket={setSelectedTicket}
                />
              ) : (
                <Text color="#9A9FB2">
                  Select a ticket to transfer it to someone else
                </Text>
              )
            ) : null}
            {transerActionSuccess && (
              <Stack spacing={0}>
                <Text fontSize="xl">2 tickets transfered to</Text>
                <Text fontSize="xl">emailaddress@gmail.com</Text>
              </Stack>
            )}
          </motion.div>
        </Stack>
      </Box>
    </Stack>
  );
};

export default TicketSelect;
