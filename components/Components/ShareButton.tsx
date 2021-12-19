import { handleRecruitClick } from "@/utils/shareCard";
import ShareIcon from "@/utils/svg/ShareIcon";
import { Button } from "@chakra-ui/react";
import { Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import React from "react";

interface Props {
  id?: number;
  buttonText?: string;
}

const ShareButton: React.FC<Props> = ({ id, buttonText = "Share" }) => {
  const toast = useToast();

  async function handleClick(id: number | undefined) {
    const result = await handleRecruitClick(id);
    if (result === "Clipboard") {
      toast({
        position: "top",
        description: "Link is copied to your clipboard.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  return (
    <Button
      onClick={() => handleClick(id)}
      colorScheme="blue"
      color="white"
      mb="4"
      flex="row"
      alignItems="center"
      px={8}
      // width={["100%", "100%", "unset"]}
    >
      <ShareIcon marginRight="10px" />
      <Text pb="2px">{buttonText}</Text>
    </Button>
  );
};

export default ShareButton;
