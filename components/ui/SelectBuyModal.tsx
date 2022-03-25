import OrderBook from "@/types/OrderBook";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useRef } from "react";

interface Props {
  selectedOrder: OrderBook;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleBuyNftCrypto: (orderBook: OrderBook) => void;
  nft_id: number;
  sn: number;
}

const SelectBuyModal: React.FC<Props> = ({
  selectedOrder,
  isOpen,
  setIsOpen,
  handleBuyNftCrypto,
  nft_id,
  sn,
}) => {
  const router = useRouter();
  const onClose = () => setIsOpen(false);
  const cancelRef = useRef(null);

  return (
    <AlertDialog
      isCentered={true}
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="3xl" fontWeight="bold">
            Payment Method
          </AlertDialogHeader>

          <AlertDialogBody>
            <VStack mt={4} spacing={6}>
              <Box
                border="1px solid white"
                p={4}
                borderRadius="10px"
                cursor="pointer"
                transition="all .1s ease-in-out"
                _hover={{
                  background: "rgba(255,255,255,0.1)",
                }}
                w="100%"
                onClick={() => {
                  handleBuyNftCrypto(selectedOrder);
                  onClose();
                }}
              >
                <VStack align={"start"}>
                  <Text fontWeight="bold">Crypto Wallet</Text>
                  <Text color="gray.300">Phantom, Solflare, etc...</Text>
                </VStack>
              </Box>
              <Box
                border="1px solid white"
                p={4}
                borderRadius="10px"
                cursor="pointer"
                transition="all .1s ease-in-out"
                _hover={{
                  background: "rgba(255,255,255,0.1)",
                }}
                w="100%"
                onClick={() => {
                  router.push({
                    pathname: "/checkout",
                    query: {
                      nft_id,
                      serial_no: sn,
                    },
                  });
                  onClose();
                }}
              >
                <VStack align={"start"}>
                  <Text fontWeight="bold">Credit Card</Text>
                  <Text color="gray.300">Visa, MC, ApplePay, GooglePay</Text>
                </VStack>
              </Box>
            </VStack>
          </AlertDialogBody>

          <AlertDialogFooter></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default SelectBuyModal;
