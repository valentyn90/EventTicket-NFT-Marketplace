import userStore from "@/mobx/UserStore";
import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import React from "react";

const StepsModal = () => {
  let component;
  let title;

  switch (userStore.ui.cardCreationSteps[userStore.ui.selectedStep]) {
    case "Basic Info": {
      title = "Your Info";
      component = (
        <p>
          It starts with you. Enter some basic information inclduing your name,
          school, and state to get started.
        </p>
      );
      break;
    }
    case "Photo": {
      title = "Your Photo";
      component = (
        <>
          <p>
            Choose a high quality photo of just you, and we’ll take care of the
            rest. If the cropping is off, well fix it during our review.
          </p>
          <br />
          <p>Please use a PNG, JPG, or GIF up to 10MB in size.</p>
        </>
      );
      break;
    }
    case "Background": {
      title = "Your color";
      component = (
        <>
          <p>Personalise your card by selecting your colors...</p>
        </>
      );
      break;
    }
    case "Video": {
      title = "Your video";
      component = (
        <>
          <p>
            Your personal highlight! Upload a short video clip showing off your
            skills. 10–20 seconds is perfect. 30 seconds maximum.
          </p>
        </>
      );
      break;
    }
    case "Signature": {
      title = "Signature";
      component = (
        <>
          <p>
            Signing time! Use this space to autograph your collectible. We
            recommend using your finger or a trackpad.
          </p>
        </>
      );
      break;
    }
    case "Share": {
      title = "Share";
      component = (
        <>
          <p>
            It looks great! Now, let’s save all that hard work. Sign up with
            your Twitter or Google account.
          </p>
        </>
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
      isOpen={userStore.ui.openStepsModal}
      onClose={() => userStore.ui.setFieldValue("openStepsModal", false)}
    >
      <ModalOverlay backdropFilter="blur(3px)" />
      <ModalContent mt={"8rem"} mx={8} bg="white" color="black">
        <ModalCloseButton top={4} right={4} />
        <ModalHeader borderBottom={"1px solid rgba(0,0,0,0.1)"} mb={2}>
          {title}
        </ModalHeader>
        <ModalBody>{component}</ModalBody>
        <Box p={6}>
          <Button
            bg="viBlue"
            w="100%"
            color="white"
            display="block"
            boxShadow={"2xl"}
            onClick={() => userStore.ui.setFieldValue("openStepsModal", false)}
          >
            Close
          </Button>
        </Box>
      </ModalContent>
    </Modal>
  );
};

export default observer(StepsModal);
