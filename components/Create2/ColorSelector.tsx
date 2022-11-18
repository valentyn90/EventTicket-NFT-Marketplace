import { Box, Button, CloseButton, HStack, Text } from "@chakra-ui/react";
import React from "react";
import { CirclePicker } from "react-color";
import userStore from "@/mobx/UserStore";
import { observer } from "mobx-react-lite";

interface Props {
  top: boolean;
  cardRef: React.RefObject<HTMLFormElement>;
  width: number | undefined;
}

const ColorSelector: React.FC<Props> = ({ top, cardRef, width }) => {
  const theColors = [
    "#CE393D",
    "#D06536",
    "#D9B145",
    "#4E9E46",
    "#4E9E8A",
    "#4A9BDF",
    "#6322DC",
    "#C236CF",
    "#D03587",
    "#4F5567",
  ];

  function handleTopColor(color: any, event: any) {
    userStore.nftInput.setInputValue("color_top", color.hex);
    if (width && width < 992) {
      userStore.ui.setBottomEditComponent("background-bottom");
      window.scrollTo({
        top: 350,
        behavior: "smooth",
      });
    }
  }

  function handleBottomColor(color: any, event: any) {
    userStore.nftInput.setInputValue("color_bottom", color.hex);
  }

  return (
    <Box
      borderTop={["1px solid", "1px solid", "none"]}
      borderColor="lightPurple"
      background={["blueBlack2", "blueBlack2", "unset"]}
      position={["fixed", "fixed", "unset"]}
      px="8"
      py="8"
      bottom="0"
      width={["100vw", "100vw", "90%"]}
      display="flex"
      flexDir={"column"}
    >
      <HStack w="100%" align="start" justify={"space-between"}>
        <Text mb={6}>{top ? "Top Color" : "Bottom Color"}</Text>
        <CloseButton
          display={["block", "block", "none"]}
          onClick={() => userStore.ui.setFieldValue("bottomEditComponent", "")}
        />
      </HStack>
      <CirclePicker
        width="100%"
        onChange={top ? handleTopColor : handleBottomColor}
        colors={theColors}
      />
      <Box mt={6} display={["block", "block", "none"]}>
        <Button
          onClick={() => {
            if (userStore.ui.bottomEditComponent === "background-top") {
              userStore.ui.setFieldValue(
                "bottomEditComponent",
                "background-bottom"
              );
              window.scrollTo({
                top: 200,
                behavior: "smooth",
              });
            } else if (
              userStore.ui.bottomEditComponent === "background-bottom"
            ) {
              cardRef.current?.dispatchEvent(
                new Event("submit", { cancelable: true, bubbles: true })
              );
            }
          }}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default observer(ColorSelector);
