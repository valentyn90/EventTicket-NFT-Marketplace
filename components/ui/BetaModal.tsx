import { Box, Button, Heading, HStack, Link, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, StackProps, Text, useDisclosure } from "@chakra-ui/react";
import * as React from "react";
import { useEffect, useState } from "react";

export const BetaModal = (props: StackProps): JSX.Element | null => {
  const [visible, setVisible] = useState<boolean>(false);
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleAcceptance = () => {
    localStorage.setItem("DFX-beta-banner", "visible");
    setVisible(false);
  };

  useEffect(() => {
    const hasSeenCookie = localStorage.getItem("DFX-beta-banner");
    if (!hasSeenCookie) {
      setVisible(true);
    }
  }, []);


  if (!visible) {
    return null;
  }

  return (

    <Modal
      size="lg"
      isOpen={visible}
      isCentered
      closeOnOverlayClick={false}
      onClose={() => {
        handleAcceptance();
      }}
    >
      <ModalOverlay />
      <ModalContent>
      
        <ModalBody>
          <Box as="section">
            <Box
              maxW="2xl"
              mx="auto"
              px={{ base: '4', lg: '6' }}
              py={{ base: '16', sm: '12' }}
              textAlign="center"
            >
              <Heading size="2xl" fontWeight="bold" letterSpacing="tight" py='2'>
                VerifiedInk is in Beta
              </Heading>
              <Text mt="4" fontSize="lg">
                We're excited to have you be one of the first athletes to use VerifiedInk. 
                This website is in beta - you will find bugs 
                and the service can go down. Thank you for helping make VerifiedInk a reality.
              </Text>
              <Button mt="8" as="a" onClick={handleAcceptance} size="lg" colorScheme="blue" fontWeight="bold" textColor="whiteAlpha.800">
                Understood - Let's do this!
              </Button>
            </Box>
          </Box>

        </ModalBody>
      </ModalContent>
    </Modal>




  );
};
