import userStore from "@/mobx/UserStore";
import BlueCheck from "@/svgs/BlueCheck";
import {
  Box,
  Button,
  HStack,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";

interface Props {
  cardRef: React.RefObject<HTMLFormElement>;
}

const CardFormModal: React.FC<Props> = ({ cardRef }) => {
  const [disabled, setDisabled] = useState(true);
  let component;
  let title;

  useEffect(() => {
    if (userStore.ui.cardFormModalInput === "sport") {
      if (userStore.nftInput.sport !== "") {
        setDisabled(false);
      } else {
        setDisabled(true);
      }
    }
  }, [userStore.ui.cardFormModalInput, userStore.nftInput.sport]);

  useEffect(() => {
    return () => {
      userStore.ui.setCardFormModal(false, "");
    };
  }, []);

  switch (userStore.ui.cardFormModalInput) {
    case "sport": {
      const sports = [
        "Basketball",
        "Football",
        "Hockey",
        "Baseball",
        "Softball",
        "Soccer",
        "Swimming",
        "Track & Field",
        "Volleyball",
        "Wrestling",
        "Golf",
        "Other",
      ];
      title = "Select your sport";
      component = (
        <VStack maxH="50vh" overflow={"auto"} align="start" spacing={2}>
          {sports.map((s, i) => (
            <HStack
              w="100%"
              justify="space-between"
              align="center"
              px={6}
              py={4}
              cursor="pointer"
              borderBottom="1px solid rgba(0,0,0,0.1)"
              key={i}
              background={
                s === userStore.nftInput.sport ? "rgba(0,0,0,0.01)" : ""
              }
              onClick={() => {
                if (s !== userStore.nftInput.sport) {
                  userStore.nftInput.setInputValue("sport", s);
                } else if (s === userStore.nftInput.sport) {
                  userStore.nftInput.setInputValue("sport", "");
                }
              }}
            >
              <Text>{s}</Text>
              {userStore.nftInput.sport === s && (
                <Box>
                  <BlueCheck />
                </Box>
              )}
            </HStack>
          ))}
        </VStack>
      );
      break;
    }
    default: {
      title = "";
      component = null;
      break;
    }
  }

  return (
    <Modal
      size="md"
      isOpen={userStore.ui.openCardFormModal}
      onClose={() => userStore.ui.setFieldValue("openCardFormModal", false)}
    >
      <ModalOverlay backdropFilter="blur(3px)" />
      <ModalContent
        mt={["4rem", "4rem", "8rem"]}
        mx={8}
        bg="white"
        color="black"
      >
        <ModalCloseButton top={4} right={4} />
        <ModalHeader borderBottom={"1px solid rgba(0,0,0,0.1)"} mb={2}>
          {title}
        </ModalHeader>
        <ModalBody p={0}>{component}</ModalBody>
        <Box p={6}>
          <Button
            bg="viBlue"
            w="100%"
            color="white"
            display="block"
            boxShadow={"2xl"}
            disabled={disabled}
            onClick={() => {
              userStore.ui.setFieldValue("openCardFormModal", false);
              cardRef.current?.dispatchEvent(
                new Event("submit", { cancelable: true, bubbles: true })
              );
            }}
            _hover={{ bg: "viBlue", color: "white" }}
          >
            Next
          </Button>
        </Box>
      </ModalContent>
    </Modal>
  );
};

export default observer(CardFormModal);
