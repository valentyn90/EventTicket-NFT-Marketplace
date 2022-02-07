import React, { Component, useCallback } from "react";
import {
  Box,
  Heading,
  useColorModeValue,
  Text,
  Button,
  useToast,
} from "@chakra-ui/react";
import Faq from "react-faq-component";
import { PrivacyWrapper } from "../utils/legalStyles";
import {
  AnchorWallet,
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { buy, buyAndExecute } from "@/mint/marketplace-front-end";

const Buy: React.FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [processing, setProcessing] = React.useState(false);
  const toast = useToast();
  const anchorWallet = useAnchorWallet();

  const AUCTION_HOUSE = process.env.NEXT_PUBLIC_AUCTION_HOUSE;

  const buyClick = useCallback(async () => {
    if (!publicKey) throw new WalletNotConnectedError();

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: Keypair.generate().publicKey,
        lamports: 1,
      })
    );

    const auctionHouse = AUCTION_HOUSE!;
    const mint = "BhyQBX9sV4uEvqFLSaXezR4Gq7geQT2wgvys2tiUCwJL"; // nft 162, serial_no 10

    setProcessing(true);

    const res = await buy(
      auctionHouse,
      anchorWallet,
      mint,
      0.1,
      "sol",
      true,
      undefined,
      anchorWallet?.publicKey.toBase58()
    );

    // const signature = await sendTransaction(transaction, connection);

    // const res = await connection.confirmTransaction(signature, 'processed');

    if (res.txid) {
      console.log(res);
      toast({
        position: "top",
        description: `Transaction ID: ${res.txid}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        position: "top",
        description: res.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    setProcessing(false);
  }, [publicKey, sendTransaction, connection]);

  const bidExecuteClick = useCallback(async () => {
    if (!publicKey) throw new WalletNotConnectedError();

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: Keypair.generate().publicKey,
        lamports: 1,
      })
    );

    const auctionHouse = AUCTION_HOUSE!;
    const mint = "BhyQBX9sV4uEvqFLSaXezR4Gq7geQT2wgvys2tiUCwJL"; // nft 162, serial_no 10
    const seller = "CuJMiRLgcG35UwyM1a5ZGWHRYn1Q6vatHHqZFLsxVEVH"; // will look this up in the future

    setProcessing(true);

    // const res = await buy(auctionHouse,anchorWallet,mint,.1,"sol",true,undefined,anchorWallet?.publicKey.toBase58())
    const res = await buyAndExecute(
      auctionHouse,
      anchorWallet,
      mint,
      0.1,
      anchorWallet?.publicKey.toBase58()!,
      seller
    );

    // const signature = await sendTransaction(transaction, connection);

    // const res = await connection.confirmTransaction(signature, 'processed');

    if (res.txid) {
      console.log(res);
      toast({
        position: "top",
        description: `Transaction ID: ${res.txid}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        position: "top",
        description: res.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    setProcessing(false);
  }, [publicKey, sendTransaction, connection]);

  return (
    <Box bg={useColorModeValue("gray.50", "inherit")} as="section" py="10">
      <Box
        maxW={{ base: "xl", md: "2xl", lg: "7xl" }}
        mx="auto"
        px={{ base: "6", md: "8" }}
      >
        <Box textAlign="center" maxW="3xl" mx="auto">
          <Heading
            size="2xl"
            fontWeight="extrabold"
            letterSpacing="tight"
            paddingBottom="10"
          >
            Buy
          </Heading>
          <Button
            mr="10"
            variantColor="blue"
            onClick={buyClick}
            disabled={!publicKey}
            variant="outline"
            size="lg"
            mb="10"
          >
            {processing ? "Processing..." : "Bid"}
          </Button>
          <Button
            mr="10"
            variantColor="blue"
            onClick={bidExecuteClick}
            disabled={!publicKey}
            variant="outline"
            size="lg"
            mb="10"
          >
            {processing ? "Processing..." : "Bid and Execute"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Buy;
