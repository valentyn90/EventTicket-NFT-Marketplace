import userStore from "@/mobx/UserStore";
import { Box, Text } from "@chakra-ui/layout";
import { observer } from "mobx-react-lite";
import React from "react";
import { CirclePicker } from "react-color";
import styled from "styled-components";

const BorderWrapper = styled.span`
  [title="#ffffff"] {
    border: 1px solid black;
  }
`;

const ColorPicker = () => {
  const transitionColors = ["#000000", "#ffffff"];
  const theColors = [
    "#C53030",
    "#DD6B20",
    "#E2C307",
    "#25855A",
    "#63B3ED",
    "#3182CE",
    "#2C5282",
    "#6B46C1",
    "#744210",
    "#718096",
    "#000000",
  ];

  function changeColorPickerActive(colorSpan: any, color: string) {
    // since the colors are nested but i need to iterate over them I have to go up the node
    // chain to the parent element that is holding the full list of colors
    const children =
      colorSpan.parentElement.parentElement.parentElement.parentElement
        .children;
    for (const child of children) {
      const colorSpan = getDeepestChildAtIndex(child, 0); // see helper function below

      // undo your custom active color styles here
      colorSpan.style.border = "none";
    }

    // do whatever you want with the active color here.
    colorSpan.style.backgroundColor = color;
    colorSpan.style.boxShadow = "";
    colorSpan.style.transition = "";
    colorSpan.style.border = "2px solid #fff";
  }
  //@ts-ignore
  function getDeepestChildAtIndex(startingEl: any, index: any) {
    const child = startingEl.children[index];
    if (!child) return startingEl;
    return getDeepestChildAtIndex(child, index);
  }

  function handleTopColor(color: any, event: any) {
    userStore.nftInput.setInputValue("color_top", color.hex);
    changeColorPickerActive(event.target, color.hex);
  }
  function handleTransitionColor(color: any, event: any) {
    userStore.nftInput.setInputValue("color_transition", color.hex);
    changeColorPickerActive(event.target, color.hex);
  }
  function handleBottomColor(color: any, event: any) {
    userStore.nftInput.setInputValue("color_bottom", color.hex);
    changeColorPickerActive(event.target, color.hex);
  }

  return (
    <Box mt={["1rem", "1rem", "0"]}>
      <Box mb={4}>
        <Text mb={2}>Top Color</Text>
        <BorderWrapper>
          <CirclePicker
            width="100%"
            onChange={handleTopColor}
            colors={theColors}
          />
        </BorderWrapper>
      </Box>
      <Box mb={4}>
        <Text mb={2}>Transition</Text>
        <BorderWrapper>
          <CirclePicker
            width="100%"
            onChange={handleTransitionColor}
            colors={theColors}
          />
        </BorderWrapper>
      </Box>
      <Box mb={4}>
        <Text mb={2}>Bottom Color</Text>
        <BorderWrapper>
          <CirclePicker
            width="100%"
            onChange={handleBottomColor}
            colors={theColors}
          />
        </BorderWrapper>
      </Box>
    </Box>
  );
};

export default observer(ColorPicker);
