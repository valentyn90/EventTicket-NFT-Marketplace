import { handleRecruitClick } from "@/utils/shareCard";
import ShareIcon from "@/utils/svg/ShareIcon";
import { Button } from "@chakra-ui/react";
import { Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import React from "react";

interface Props {
  id?: number;
  buttonText?: string;
  serial_no?: number;
  width?: string | string[];
  flex?: number;
  color?: string;
  variant?: string;
  colorScheme?: string;
  background?: string;
  fill?: string;
  borderColor?: string;
  sale?: boolean;
}

const ShareButton: React.FC<Props> = ({
  id,
  buttonText = "Share",
  serial_no,
  width = "100%",
  flex = "unset",
  variant = "solid",
  color = "white",
  colorScheme = "blue",
  background,
  fill = "white",
  borderColor,
  sale = false,
}) => {
  const toast = useToast();

  async function handleClick(id: number | undefined) {
    const result = await handleRecruitClick(id, serial_no, sale);
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
      colorScheme={colorScheme}
      color={color}
      flex={flex}
      alignItems="center"
      px={8}
      variant={variant}
      width={width}
      background={background}
      borderColor={borderColor}
    >
      <ShareIcon marginRight="10px" fill={fill} />
      <Text pb="2px">{buttonText}</Text>
    </Button>
  );
};

export default ShareButton;
