import { Box, Stack, Image, Text, Flex } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { AiOutlineArrowDown, AiOutlineArrowUp } from "react-icons/ai";
import events from "@/components/Events/events.json";
import TicketPlaceholder from "../../components/TicketPlaceholder";

const EventInfo = () => {

  // Will pull from the database for now just pulling from events.json

  const event = events[0];

  const [isReadMoreActive, setIsReadMoreActive] = useState<boolean>(false);
  const readMoreRef = useRef<any>(null);

  // css for linear gradient over image

  const handleReadMore = () => {
    setIsReadMoreActive(!isReadMoreActive);
    readMoreRef?.current?.scrollIntoView({
      behavior: "smooth",
      top: 0,
    });
  };

  // css for glowing shadow
  // .s{
  // drop-shadow(0 0 0.75rem #fff)
  // }

  return (
    <Stack
      w="full"
      direction={["column", "column", "row"]}
      spacing={[2, 2]}
      py={6}
      justifyContent={["center", "flex-start"]}
      alignItems={["center", "center"]}
      mt={[0, -38]}
      backgroundImage={`linear-gradient(180deg, rgba(0, 0, 0, .5) 0%, rgba(0, 0, 0, 0.95) 100%),url("${event.event_pic_2}")`}
      backgroundSize={["fit","cover"]}
    >
      <Box maxW={"300px"}>
        
        {/* <Image
          src="/img/ticket/game_ticket.png"
          alt="Ticket"
          width="100%"
          height={[600, "100%"]}
          maxH={["100%", 600]}
          objectFit="contain"
          fallbackSrc="https://verifiedink.us/img/card-mask.png"
          filter={"drop-shadow(0 0 0.75rem white)"}
        /> */}
        <TicketPlaceholder tier={1} />
      </Box>
      <Flex
        direction="column"
        backdropFilter={["none", "blur(5px)"]}
        background="#040d27"
        p={6}
        gridGap={2}
        ref={readMoreRef}
        maxW="700px"
      >
        <Text
          fontSize={["4xl", "6xl"]}
          fontWeight="bold"
          color="#0E9DE5"
          textAlign={["center", "left"]}
        >
          {event.event_name}
        </Text>
        <Box
          height={isReadMoreActive ? "auto" : "170px"}
          minH="170px"
          overflow="hidden"
        >
          <Text fontSize="md" textAlign="justify">
            6:00 p.m. – Texas A&M Aggies (SEC) vs. Boise State Broncos (MWC)
            <br />
            8:30 p.m. – Houston Cougars (AAC) vs. Saint Mary’s Gaels (WCC).
            <br /><br />
            The Battleground 2k22 will be one of college basketball's top-shelf events of the 2022-23 season,
            featuring four competitive men's programs who are projected to make NCAA Tournament appearances.
            <br /><br />
            Fort Worth, Texas will play host to this high-level double-header on December 3rd, 2022. Home of elite 
            professional franchises, including the Mavericks, Rangers and Cowboys, the DFW Metroplex offers all of 
            the sights, sounds, food and fun that basketball fans will need for an exciting visit.
            <br /><br />
            The Battleground 2k22 will be held at Dickies Arena, a state-of-the-art sports and entertainment venue 
            located near downtown Fort Worth. This 14,000-seat arena will provide a playing atmosphere and fan 
            experience unlike any facility in the country.
            <br /><br />
            The charitable component and backdrop for The Battleground 2k22 will be the a[3] Initiative. We truly 
            believe that this campaign and associated activities will greatly impact the lives of children in the 
            DFW Metroplex and be a rewarding experience for the student-athletes and universities.
          </Text>
        </Box>
        <Box display="flex" flexDirection="row">
          <Text
            textTransform="uppercase"
            fontSize="sm"
            fontWeight="bold"
            mb="2px"
            color="#0E9DE5"
            onClick={() => handleReadMore()}
          >
            {isReadMoreActive ? "Show Less" : "Learn More"}
          </Text>
        </Box>
      </Flex>
    </Stack>
  );
};

export default EventInfo;
