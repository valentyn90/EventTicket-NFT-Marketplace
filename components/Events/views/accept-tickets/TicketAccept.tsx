import {
  Stack,
  Flex,
  Text,
  Box,
  Grid,
  GridItem,
  Image,
  Center,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { HiOutlineChevronRight } from "react-icons/hi";

import Button from "@/components/ui/_partials/Button";
import Container from "@/components/ui/_partials/Container";
import { AccpetTicketScreen } from "@/pages/events/accept_tickets";

interface TicketAcceptProps {
  handleScreenChange: (screen: AccpetTicketScreen) => void;
}

const TicketAccept = (props: TicketAcceptProps) => {
  const { handleScreenChange } = props;
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [sliderImageHeight, setSliderImageHeight] = useState(280);
  const [gridGap, setGridGap] = useState(4);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSliderImageHeight(window.innerHeight < 800 ? 200 : 280);
      setGridGap(window.innerHeight < 800 ? 12 : 8);
    }
  }, [typeof window !== "undefined" && window.innerHeight]);
  return (
    <Stack
      spacing={0}
      mt={-4}
      overflow="hidden"
      position="relative"
      height="92vh"
    >
      <Stack alignItems="center" overflowY="scroll" mt={8} pb={32}>
        <Stack justifyContent="center" alignItems="center">
          <Text fontSize="3xl" fontWeight="bold" textAlign="center">
            Pending Tickets
          </Text>
          <Text color="#7D8192" textAlign="center">
            emailaddress@gmail.com has transferred event tickets to you. Accept
            now to add them to your account!
          </Text>
        </Stack>
        <Container>
          <Center>
            <Grid
              m={4}
              templateColumns={["repeat(2, 1fr)", "repeat(6, 1fr)"]}
              justifyContent="center"
              alignItems="center"
              gap={gridGap}
            >
              {[1, 2].map((ticket) => (
                <GridItem
                  key={ticket}
                  width="100%"
                  height={`${sliderImageHeight}px`}
                >
                  <Image
                    src="/img/ticket/ticket-1.png"
                    height="100%"
                    width="100%"
                    objectFit="contain"
                  />
                </GridItem>
              ))}
            </Grid>
          </Center>
        </Container>
        <Box>
          <Button
            isTrapigium
            disabled={!isAuth}
            color={!isAuth ? "#7D8192" : "auto"}
            buttonLabel="Accept All Tickets"
            variant="ghost"
            size={"lg"}
            w="auto"
            onClick={() => handleScreenChange("your-ticket")}
            border={`1px solid ${!isAuth ? "#7D8192" : "#0E9DE5"}`}
          />
        </Box>
      </Stack>

      {/* footer bar in ticket  */}
      {!isAuth && (
        <Box
          position="absolute"
          bottom={-4}
          left={0}
          zIndex={9999}
          w="100%"
          cursor="pointer"
          onClick={() => setIsAuth(!isAuth)}
        >
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
            onClick={() => setIsAuth(!isAuth)}
          >
            <Stack>
              <Flex
                direction="row"
                justifyItems="center"
                alignItems="center"
                justifyContent="space-between"
              >
                <Text fontSize="2xl" fontWeight="bold">
                  Sign-In to Accept Tickets
                </Text>
                <Text mt={2} fontSize="2xl" fontWeight="bold">
                  <HiOutlineChevronRight size={20} />
                </Text>
              </Flex>
              <Box>
                <Text color="#9A9FB2">
                  You must sign-in first to accept these tickets
                </Text>
              </Box>
            </Stack>
          </Stack>
        </Box>
      )}
    </Stack>
  );
};

export default TicketAccept;
