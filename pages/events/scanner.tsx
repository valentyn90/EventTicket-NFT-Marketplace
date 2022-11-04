import React, { useState } from "react";
import { Stack, Text, Box } from "@chakra-ui/react";
import QrScanner from "@/components/ui/_partials/QrScanner";
import Container from "@/components/ui/_partials/Container";

type ScannerStatus = "scanning" | "success" | "error";

const Scanner = () => {
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [screen, setScreen] = useState<ScannerStatus>("scanning");
  const getScreen = () => {
    switch (screen) {
      case "success":
        return (
          <Stack justifyContent="center" alignItems="center">
            <Text fontSize="3xl" fontWeight="bold" textAlign="center">
              Ticket Verified
            </Text>
            <Stack direction="row" alignItems="center" spacing={8}>
              <Stack direction="row" alignItems="center">
                <Text color="#7D8192" textAlign="center">
                  Section
                </Text>
                <Text textAlign="center" fontSize="2xl" fontWeight="bold">
                  G
                </Text>
              </Stack>
              <Stack direction="row" alignItems="center">
                <Text color="#7D8192" textAlign="center">
                  Section
                </Text>
                <Text textAlign="center" fontSize="2xl" fontWeight="bold">
                  G
                </Text>
              </Stack>
              <Stack direction="row" alignItems="center">
                <Text color="#7D8192" textAlign="center">
                  Section
                </Text>
                <Text textAlign="center" fontSize="2xl" fontWeight="bold">
                  G
                </Text>
              </Stack>
            </Stack>
          </Stack>
        );
      case "error":
        return (
          <Stack justifyContent="center" alignItems="center">
            <Text fontSize="3xl" fontWeight="bold" textAlign="center">
              Ticket Invalid
            </Text>
            <Text color="#7D8192" textAlign="center">
              Ticket expired / no longer valid
            </Text>
          </Stack>
        );
      case "scanning":
        return null;
      default:
        return null;
    }
  };

  const checkTicket = (data: any) => {
    console.log("The data are", data);
  };

  return (
    <Stack overflow="hidden" position="relative" height="92vh">
      <Stack justifyContent="center" alignItems="center">
        <Text fontSize="3xl" fontWeight="bold" textAlign="center">
          Scan Tickets
        </Text>
        <Text color="#7D8192" textAlign="center">
          Line up Ticket Code in the window and wait for confirmation
        </Text>
      </Stack>
      <Container>
        <QrScanner
          scanDelay={2000}
          isError={screen === "error"}
          isSuccess={screen === "success"}
          onScan={(data) => checkTicket(data)}
        />
      </Container>
      <Box>{getScreen()}</Box>
    </Stack>
  );
};

export default Scanner;
