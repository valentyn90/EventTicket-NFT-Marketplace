import OrderBook from "@/types/OrderBook";
import { Button, HStack, Spinner, Text, VStack } from "@chakra-ui/react";
import React from "react";
import ShareButton from "../Components/ShareButton";

interface Props {
  selectedOrder: OrderBook;
  solPrice: number;
  nft_id: number;
  selectedSN: number;
  setOpenAlert: React.Dispatch<React.SetStateAction<boolean>>;
  cancellingNft: boolean;
}

const CancelNft: React.FC<Props> = ({
  selectedOrder,
  solPrice,
  nft_id,
  selectedSN,
  setOpenAlert,
  cancellingNft,
}) => {
  return (
    <VStack align={`start`} spacing={8} w="100%">
      <HStack justify={`start`}>
        <Text fontSize={["l", "l", "2xl"]}>List Price:</Text>
        <Text fontSize={"2xl"}>{selectedOrder.price} SOL</Text>
        <Text color={"gray"} fontSize={"2xl"}>
          {solPrice !== 0 &&
            `($${(solPrice * Number(selectedOrder.price)).toFixed(2)})`}
        </Text>
      </HStack>
      <VStack justify="center" spacing={[4, 4, 6]} w="100%">
        <ShareButton id={nft_id} serial_no={selectedSN} />
        <Button
          px={8}
          colorScheme="red"
          onClick={() => setOpenAlert(true)}
          disabled={
            cancellingNft ||
            process.env.NEXT_PUBLIC_ENABLE_MARKETPLACE === "false"
          }
          w="100%"
        >
          {cancellingNft ? <Spinner /> : "Cancel Listing"}
        </Button>
      </VStack>
    </VStack>
  );
};

export default CancelNft;
