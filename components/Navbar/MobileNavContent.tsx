import { CloseButton, Flex, useColorModeValue } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import * as React from "react";

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
}

export const MobileNavContent: React.FC<Props> = (props) => {
  const { isOpen, onClose, children } = props;
  const bg = "blueBlack";
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          transition={{ duration: 0.1 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Flex
            direction="column"
            w="100%"
            bg={bg}
            h="100vh"
            overflow="auto"
            pos="absolute"
            top={0}
            left={0}
            zIndex={20}
            px={2}
            py={2}
          >
            {children}
            <CloseButton pos="absolute" top={4} right={4} onClick={onClose} />
          </Flex>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
