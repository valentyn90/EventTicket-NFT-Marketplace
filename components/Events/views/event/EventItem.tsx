import React, { useState } from "react";
import { Box, Stack, Image, Text, Button, Skeleton, Spinner } from "@chakra-ui/react";
import moment from "moment";
import { useRouter } from "next/router";

import { GoLocation } from "react-icons/go";
import { BiTimeFive } from "react-icons/bi";
import { FiUsers } from "react-icons/fi";

import { useEventHook } from "../../hooks/useEventHook";
import { EventType } from "../../types";
import EventModal from "../../components/EventModal";

const momentFormat = "MMM Do YYYY, h:mm a";

interface EventItemProps {
  event: EventType;
}

const EventItemCard = (props: EventItemProps) => {
  const { chooseTicketToBuy, isTicketSelected } = useEventHook();
  const { event } = props;
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  return (
    <Stack
      w="100%"
      direction="column"
      cursor={loading ? "progress": "pointer"}
      border="1px solid #4e5ab5"
      _hover={{
        border: "1px solid hwb(201deg 61% 0%)",
      }}
      rounded="md"
      py={[2, 4]}
      px={[2, 6]}
      onClick={() =>{
        setLoading(true);
        router.push({
          pathname: `/events/${
            event?.id
          }`
        })}
      }
      postion="absolute"
    >
     
      <Box filter={loading ? 'opacity(20%)' :'none'}>
        <Image
          width="100%"
          height="100%"
          objectFit="contain"
          className="card-twist"
          src={event.event_pic}
          
        />
      </Box>
      <Stack direction="row" spacing={10} mt={4} alignItems="center">
      <Box>
        <Text fontSize="xl" fontWeight="bold">
          {event.event_name}
        </Text>
        <Stack alignItems="center" direction="row" spacing={2}>
          <GoLocation size={15} />
          <Text fontSize="sm">{event.event_venue_name} {event.event_street}</Text>
        </Stack>
        <Stack alignItems="center" direction="row" spacing={2}>
          <BiTimeFive size={15} />
          <Text fontSize="sm">
            {moment(event.event_start).format(momentFormat)}
          </Text>
        </Stack>
       
      </Box>
      <Stack display={["none","unset"]} justifyContent="center" alignItems="center">
              <Button
                bg="#0E9DE5"
                rounded="sm"
                minW="200px"
                transform="matrix(0.89, 0, -0.58, 1, 0, 0)"
                isLoading={loading}
              >
                <Text
                  textTransform="uppercase"
                  fontStyle="normal"
                  fontWeight="bold"
                  transform="matrix(1, 0, 0.5, 0.8, 0, 0)"
                >
                  Find Tickets
                </Text>
              </Button>
            </Stack>
      </Stack>
    </Stack>
  );
};

export default EventItemCard;
