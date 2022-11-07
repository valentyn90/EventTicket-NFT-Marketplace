import { useEffect, useRef, useState } from "react";
import {
  Box,
  Stack,
  Image,
  Text,
  Button,
  HStack,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Select,
  useToast,
  Center,
  Heading,
} from "@chakra-ui/react";
import moment from "moment";
import { RiErrorWarningLine } from "react-icons/ri";

import useWindowDimensions from "@/utils/useWindowDimensions";

import EventModal from "../../components/EventModal";
import { TicketType } from "../../types";
import { getNftTicketColor } from "../../utils/getNftTicketColor";
import { eventTabs } from "../../utils/tier";
import { useEventHook } from "../../hooks/useEventHook";

import events from "../../events.json";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/supabase/supabase-client";
import TicketPlaceholder from "../../components/TicketPlaceholder";

const momentFormat = "MMM DD, YYYY h:mm a";

interface EventTicketPurchaseProps {
  purchaseTicketRef: any;
}

const EventTicketPurchase = (props: EventTicketPurchaseProps) => {
  const { purchaseTicketRef } = props;
  const windowDimensions = useWindowDimensions();
  const { selectedEventTicket, updateSelectedEventTicket, handleSripePayment } =
    useEventHook();
  const toast = useToast();

  const [showTierDetail, setShowTierDetail] = useState<boolean>(false);
  const [isLargeWindow, setIsLargeWindow] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [ticketNumber, setTicketNumber] = useState<number>(2);
  const [ticketSummary, setTicketSummary] = useState<any>(null);

  const event = events[0];

  const closeModal = () => {
    setShowConfirmModal(false);
  };

  // use reactQuery to find number of tickets available
  const { isLoading, error, data:tickets } = useQuery(['available_tickets'], async () => {
    const { data: tickets } = await supabase.from("event_ticket_owner")
    .select('*')
    .is('on_hold', null)
    .eq('event_id',event.id)
    .is('owner_id',null);
    return tickets
  })

  useEffect(() => {
    // group tickets object by tier and provide summary stats
    if(tickets){
    console.table(tickets)
    const groupedTickets = tickets.reduce((acc: any, ticket: any) => {
      const key = ticket.tier_id;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(ticket);
      return acc;
    }, {});

    const ticketSummary = Object.keys(groupedTickets).map((key) => {
      const ticketType = groupedTickets[key][0].tier_id;
      const ticketCount = groupedTickets[key].length;
      const ticketColor = getNftTicketColor(ticketType);
      // enumerate all numbers from 1 to ticketCount
      const ticketNumbers = Array.from({ length: Math.min(ticketCount,10) }, (_, i) => i + 1);
      ticketNumbers.shift()

      return {
        ticketType,
        ticketCount,
        ticketColor,
        ticketNumbers,
      };
    });

    console.log(ticketSummary.filter((ticket: any) => ticket.ticketType === 2)[0])
    setTicketSummary(ticketSummary);
    
  }
  }, [tickets])

  const handlePurchaseTicketButton = (selectedTab: TicketType) => {

    if (ticketNumber === 0) {
      toast({
        position: "top",
        description: "Please select the number of tickets.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    updateSelectedEventTicket({
      ticketId: event.id,
      ticketType: selectedTab.id,
      quantity: ticketNumber,
    });

    setShowConfirmModal(true);
  };

  const handlePuchaseInfoBtn = () => {
    setShowTierDetail(!showTierDetail);
    if (!showTierDetail) {
      purchaseTicketRef.current.scrollIntoView({
        behavior: "smooth",
        top: 1,
      });
    }
  };
  useEffect(() => {
    if (
      windowDimensions &&
      windowDimensions.width &&
      windowDimensions.width > 600
    ) {
      setIsLargeWindow(true);
    } else {
      setIsLargeWindow(false);
    }
  });

  return (
    <Stack spacing={8}>
      <Stack direction="row" alignItems="center">
        <HStack justifyContent="center" alignItems="center" w="full">
          <VStack
            justifyContent="flex-start"
            alignItems="flex-start"
            spacing={0}
            w="full"
          >
            <Text fontWeight="bold" fontSize="xl">
              {event.event_name}
            </Text>
            <Text textTransform="uppercase" fontSize="lg">
              {moment(event.event_start).format(momentFormat)}
            </Text>
            <Text fontSize="md" color="gray.300">
              {event.event_venue_name}, {event.event_city}, {event.event_state}
            </Text>
          </VStack>
        </HStack>
        <Text fontWeight="bold" color="#0E9DE5">
          <RiErrorWarningLine size={30} />
        </Text>
      </Stack>
      <Stack
        border="1px solid #0E9DE5"
        rounded="lg"
        w="full"
        position="relative"
        p={!isLargeWindow && !showTierDetail ? 0 : 4}
        spacing={2}
        transform={
          !isLargeWindow && !showTierDetail
            ? "matrix(0.89, 0, -0.58, 1, 0, 0)"
            : ""
        }
      >
        <Button
          variant="ghost"
          ref={purchaseTicketRef}
          disabled={isLargeWindow}
          background="transparent"
          _focus={{ outline: "none", boxShadow: "none", background: "none" }}
          _active={{ outline: "none", boxShadow: "none", background: "none" }}
          _selection={{
            outline: "none",
            boxShadow: "none",
            background: "none",
          }}
          _selected={{
            outline: "none",
            boxShadow: "none",
            background: "none",
          }}
          onClick={() => handlePuchaseInfoBtn()}
        >
          <Text
            transform={
              !isLargeWindow && !showTierDetail
                ? "matrix(1, 0, 0.5, 0.8, 0, 0)"
                : ""
            }
            textTransform="uppercase"
            textAlign="center"
            fontWeight="bold"
            letterSpacing="xl"
          >
            Buy Tickets
          </Text>
        </Button>
        {(showTierDetail ||
          Boolean(
            windowDimensions &&
            windowDimensions.width &&
            windowDimensions.width > 600
          )) && (
            <>
              <Tabs isFitted align="center" isLazy mt="2">
                <TabList border="none">
                  {eventTabs.map((tab: TicketType) => (
                    <Tab
                      key={tab.id + tab.title}
                      color="gray.500"
                      fontWeight="bold"
                      _focus={{
                        outline: "none",
                        background: "none",
                      }}
                      _hover={{
                        outline: "none",
                        background: "none",
                      }}
                      _selected={{
                        borderColor: getNftTicketColor(tab.id),
                        color: getNftTicketColor(tab.id),
                      }}
                    >
                      {tab.name}
                    </Tab>
                  ))}
                </TabList>

                <TabPanels>
                  {eventTabs.map((tab: TicketType) => (
                    <TabPanel key={tab.id + tab.name}>
                      <Stack
                        spacing={4}
                        w="full"
                        justifyContent="flex-start"
                        alignItems="flex-start"
                        justifyItems="flex-start"
                      >
                        {/* <Center w="100%">
                          <Heading
                            size="2xl"
                            textTransform="uppercase"
                            color={getNftTicketColor(tab.id)}
                          >
                            {tab.name}
                          </Heading>
                        </Center> */}

                       

                        <Stack w="full" p="0" direction={["column"]} alignItems="center" gridColumnGap={5}>
                          {/* <Box boxSize="130px">
                            <Image
                              src={tab.image}
                              alt="NFT Image"
                              width="100%"
                              height="100%"
                              objectFit="contain"
                              fallbackSrc="https://verifiedink.us/img/card-mask.png"
                            />
                          </Box> */}
                          <Box maxW="200px">
                          <TicketPlaceholder tier={tab.id}/>
                            </Box>
                            <Center w="100%">
                          <Heading size="xl" color={getNftTicketColor(tab.id)}>${tab.price}</Heading>
                        </Center>

                            <Stack
                          direction="row-reverse"
                          justifyContent="center"
                          justifyItems="center"
                          align="center"
                          w="full"
                        >
                          <Box
                          border={`1px solid #0E9DE5`}
                          transform="matrix(0.89, 0, -0.58, 1, 0, 0)"
                          >
                            <Select
                              w="70px"
                              transform="matrix(0.89, 0, 0.65, 1, 0, 0)"
                              size={"lg"}
                              value={ticketNumber}
                              onChange={(e) =>
                                setTicketNumber(parseInt(e.target.value, 10))
                              }
                              border="none"
                              _focus={{
                                outline: "none",
                                border: "none",
                              }}
                            >
                              {ticketSummary && ticketSummary.filter((ticket: any) => ticket.ticketType === tab.id)[0] &&
                                ticketSummary.filter((ticket: any) => ticket.ticketType === tab.id)[0].ticketNumbers
                              // [2, 3, 4, 5, 6, 7, 8, 9, 10]
                              .map((item: any) => (
                                <option value={item}> {item}</option>
                              ))}
                            </Select>
                          </Box>

                          <Button
                            bg="#0E9DE5"
                            size={"lg"}
                            w={["full", "md"]}
                            transform="matrix(0.89, 0, -0.58, 1, 0, 0)"
                            onClick={() => handlePurchaseTicketButton(tab)}
                          >
                            <Text
                              textTransform="uppercase"
                              fontStyle="normal"
                              fontWeight="bold"
                              transform="matrix(1, 0, 0.5, 0.8, 0, 0)"
                            >
                              Buy {ticketNumber} Tickets
                            </Text>
                          </Button>
                        </Stack> 
                          <VStack
                            justifyContent="flex-start"
                            alignItems="flex-start"
                            justifyItems="flex-start"
                            spacing={0}
                          >
                            <HStack
                              alignItems="center"
                              justifyContent="flex-start"
                              justifyItems="flex"
                            >
                              <Text fontWeight="bold" fontSize="md">
                                Ticket Section
                              </Text>
                              <Text
                                fontWeight="bold"
                                fontSize="lg"
                                color={getNftTicketColor(tab.id)}
                                wordWrap="break-word"
                                wordBreak="break-all"
                              >
                                {tab.section} - {tab.location}
                              </Text>
                            </HStack>
                            <Text fontSize="sm" textAlign="left" color="gray.300">
                              <ul style={{ "listStylePosition": "outside" }}>
                                {tab.utility.map((utility: string) => (
                                  <li>{utility}</li>
                                ))}

                              </ul>
                            </Text>
                          </VStack>
                        </Stack>

                        <HStack
                          w="full"
                          direction="row"
                          alignItems="center"
                          spacing={4}
                          px={6}
                        >
                          <Text
                            fontWeight="bold"
                            color={getNftTicketColor(tab.id)}
                          >
                            <RiErrorWarningLine size={35} />
                          </Text>
                          <Stack
                            justifyContent="flex-start"
                            alignItems="flex-start"
                            spacing={0}
                          >
                            <Text fontWeight="bold" fontSize="md" align="left">
                              This ticket will become a{" "}
                              <Text
                                display="inline-block"
                                color={getNftTicketColor(tab.id)}
                                fontWeight="bold"
                                fontSize="lg"
                                textTransform="capitalize"
                              >
                                {tab.type}{" "}
                              </Text>{" "}
                              NFT after the game
                            </Text>
                            <Text fontSize="xs" align="justify" color="gray.300">
                              {/* Featuring game highlights! */}
                            </Text>
                          </Stack>
                        </HStack>

                        
                      </Stack>
                    </TabPanel>
                  ))}
                </TabPanels>
              </Tabs>
            </>
          )}
        <EventModal
          data={selectedEventTicket}
          callback={(value: any) => updateSelectedEventTicket(value)}
          paymentCallback={() => handleSripePayment()}
          isOpen={showConfirmModal}
          onClose={() => closeModal()}
        />
      </Stack>
    </Stack>
  );
};

export default EventTicketPurchase;
