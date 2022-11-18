import userStore from "@/mobx/UserStore";
import ChevronLeft from "@/svgs/ChevronLeft";
import ChevronRight from "@/svgs/ChevronRight";
import QuestionMark from "@/svgs/QuestionMark";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import React, { useEffect, useRef, useState } from "react";
import StepsModal from "./CardCreationStepsModal";

interface Props {
  children: JSX.Element | JSX.Element[] | null;
}

const Create2Layout: React.FC<Props> = ({ children }) => {
  const [progressWidth, setProgressWidth] = useState(0);
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (barRef.current) {
      // set the width of the progress bar
      setProgressWidth(barRef.current.offsetWidth * userStore.ui.stepsRatio);
    }
  }, [userStore.ui.stepsRatio, barRef.current]);

  return (
    <VStack
      justify={"space-between"}
      align={"stretch"}
      maxW={["auto", "auto", "1200px"]}
      margin={[0, 0, "5rem auto"]}
      borderRadius={[0, 0, "5px"]}
      border={["", "", "0.5px solid"]}
      borderColor={["", "", "lightPurple"]}
      boxShadow={"0px 10px 30px 0px #040D274D"}
      ref={barRef}
    >
      <HStack
        bg={["darkPurple", "darkPurple", "blueBlack2"]}
        align={"center"}
        spacing={0}
        borderTop={[
          "1px solid rgba(255,255,255,0.1)",
          "1px solid rgba(255,255,255,0.1)",
          "unset",
        ]}
        borderBottom={["1px solid", "1px solid", "2px solid"]}
        borderBottomColor={[
          "rgba(255,255,255,0.1)",
          "rgba(255,255,255,0.1)",
          "lightPurple",
        ]}
        position="relative"
      >
        <Box
          height="2px"
          w={progressWidth}
          position="absolute"
          background="viBlue"
          bottom="-2px"
          left="0"
          // zIndex={"99999"}
        />
        <Box
          display="flex"
          alignItems="center"
          height="40px"
          width="50px"
          px={3}
          py={1}
          flexGrow={0}
          borderRight="1px solid rgba(255,255,255,0.1)"
        >
          <Text color="viBlue" fontSize={"lg"}>
            {userStore.ui.stepsTaken}
          </Text>
        </Box>
        <HStack
          height="40px"
          px={3}
          py={1}
          flexGrow={1}
          justify={"space-between"}
          borderRight="1px solid rgba(255,255,255,0.1)"
        >
          <Text fontWeight={"bold"} fontSize="lg">
            {userStore.ui.step}
          </Text>
          <Box
            onClick={() => userStore.ui.setFieldValue("openStepsModal", true)}
          >
            <QuestionMark />
          </Box>
        </HStack>
        <Box
          display="flex"
          alignItems="center"
          height="40px"
          px={4}
          py={1}
          flexGrow={0}
          borderRight="1px solid rgba(255,255,255,0.1)"
          onClick={() => userStore.ui.previousStep()}
        >
          <ChevronLeft fill={userStore.ui.stepChevronLeftFill} />
        </Box>
        <Box
          display="flex"
          alignItems={"center"}
          height="40px"
          px={4}
          py={2}
          flexGrow={0}
          onClick={() => userStore.ui.nextStep()}
        >
          <ChevronRight fill={userStore.ui.stepChevronRightFill} />
        </Box>
      </HStack>
      {children}
      <StepsModal />
    </VStack>
  );
};

export default observer(Create2Layout);
