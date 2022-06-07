import React, { useState, useRef } from "react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react";

interface Props {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  confirmCancel: boolean;
  setConfirmCancel: React.Dispatch<React.SetStateAction<boolean>>;
}

const AlertModal: React.FC<Props> = ({
  isOpen,
  setIsOpen,
  confirmCancel,
  setConfirmCancel,
}) => {
  const onClose = () => setIsOpen(false);
  const cancelRef = useRef(null);

  return (
    <AlertDialog
      isCentered={true}
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Cancel listing
          </AlertDialogHeader>

          <AlertDialogBody>
            Are you sure? You can't undo this action afterwards.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} isDisabled={confirmCancel}>
              Nevermind
            </Button>
            <Button
              colorScheme="red"
              onClick={() => {
                setConfirmCancel(true);
                // onClose();
              }}
              ml={3}
              isLoading={confirmCancel}
            >
              Cancel listing
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default AlertModal;
