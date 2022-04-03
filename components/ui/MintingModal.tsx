import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Text,
} from "@chakra-ui/react";
import styled, { keyframes } from "styled-components";
import React, { useCallback, useEffect, useRef, useState } from "react";

const ellipsis = keyframes`
  0%   { content: ''; }
  25%  { content: '.'; }
  50%  { content: '..'; }
  75%  { content: '...'; }
  100% { content: ''; }
`;

const Loader = styled.p`
  &:after {
    display: inline-block;
    animation: ${ellipsis} steps(1, end) 2s infinite;
    content: "";
  }
`;

interface Props {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const MintingModal: React.FC<Props> = ({ isOpen, setIsOpen }) => {
  const onClose = () => setIsOpen(false);
  const cancelRef = useRef(null);

  const [countdown, setCountdown] = useState(90);

  useEffect(() => {
    let interval: any = null;
    if (isOpen) {
      interval = setInterval(() => {
        if (countdown > 0) {
          setCountdown((countdown) => countdown - 1);
        } else {
          clearInterval(interval);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, countdown]);

  return (
    <AlertDialog
      isCentered={true}
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader
            fontSize="2xl"
            fontWeight="bold"
          >
            Listing Your VerifiedInk
            </AlertDialogHeader>

          <AlertDialogBody>
            Your VerifiedInk is minting then listing on the Solana Network.
            <br/><br/>
            Please do not navigate to another page, this can sometimes take up to 90 seconds.
          </AlertDialogBody>
          <AlertDialogBody>
            {countdown > 0 ? `Time to list: ${countdown}s` : <Loader>Just a little longer</Loader>}
          </AlertDialogBody>

          <AlertDialogFooter>
            {/* <Button ref={cancelRef} onClick={onClose}>
              Ok
            </Button> */}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default MintingModal;
