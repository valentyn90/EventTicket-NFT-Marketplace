import userStore from "@/mobx/UserStore";
import { Box, Button, Text } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import React from "react";

const CreateInputSection = () => {
  /**
   * 
   * ok so in here
   * we are checking the steps.
   * if it's step 1, then check the step 1 required inputs.
   * if it's step 2 then check the required step 1 inputs
   * 
   */


  return (
    <Box>
      {userStore.ui.disableContinue ? (
        <Text w="75%" margin="0 auto" textAlign={"center"} mb={8}>
          Tap the <span className="blue-text">highlighted</span> area of the
          card above to get started.
        </Text>
      ) : (
        <Text w="75%" margin="0 auto" textAlign={"center"} mb={8}>
          Great job! Tap <span className="blue-text">Continue</span> below to
          move to the next stage.
        </Text>
      )}
      <Button
        w="75%"
        margin="0 auto"
        display="block"
        disabled={userStore.ui.disableContinue}
        // onClick={handleContinue}
      >
        Continue
        {/* {submitting ? <Spinner /> : "Continue"} */}
      </Button>
    </Box>
  );
};

export default observer(CreateInputSection);
