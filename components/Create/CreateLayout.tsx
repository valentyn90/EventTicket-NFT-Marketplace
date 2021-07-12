import React from "react";
import { Stack, StackProps, useColorModeValue, Box } from "@chakra-ui/react";
import { Card } from "../ui/Card";

// interface Props {
//   children: React.ReactNode;
// }

const CreateLayout: React.FC = (props: StackProps) => {
  return (
    <Box
      bg={useColorModeValue("gray.50", "inherit")}
      minH="100vh"
      py="12"
      px={{ base: "4", lg: "8" }}
    >
      <Box maxWidth="1200px" mx="auto">
        <Card {...props} />
      </Box>
    </Box>
  );
};

export default CreateLayout;
