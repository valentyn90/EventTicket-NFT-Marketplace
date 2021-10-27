import { handleRecruitClick } from "@/utils/shareCard";
import ShareIcon from "@/utils/svg/ShareIcon";
import { Button } from "@chakra-ui/react";
import { Text } from "@chakra-ui/layout";
import React from "react";

interface Props {
  id?: number;
}

const ShareButton: React.FC<Props> = ({ id }) => {
  return (
    <Button
      onClick={() => handleRecruitClick(id)}
      colorScheme="blue"
      color="white"
      mb="4"
      flex="row"
      alignItems="center"
      px={8}
      width={["100%", "100%", "unset"]}
    >
      <ShareIcon marginRight="10px" />
      <Text pb="2px">Share</Text>
    </Button>
  );
};

export default ShareButton;
