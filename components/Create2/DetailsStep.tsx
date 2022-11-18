import userStore from "@/mobx/UserStore";
import { Box, Button, Text } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";

const DetailsStep = () => {
  return (
    <>
      <Box>
        <Text w="75%" margin="0 auto" textAlign={"center"} mb={8}>
          Tap the <span className="blue-text">highlighted</span> area of the
          card above to get started.
        </Text>
        <Button
          w="75%"
          margin="0 auto"
          display="block"
          disabled={userStore.ui.disableContinue}
        >
          Continue
        </Button>
      </Box>
    </>
  );
};

export default observer(DetailsStep);
