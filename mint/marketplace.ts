import { supabase } from "@/supabase/supabase-admin";
import { BN, web3, Wallet } from "@project-serum/anchor";
import base58 from "bs58";
import log from "loglevel";
import {
  getAtaForMint,
  getAuctionHouseBuyerEscrow,
  getAuctionHouseProgramAsSigner,
  getAuctionHouseTradeState,
  getMetadata,
  loadAuctionHouseProgram,
} from "./utils/accounts";
import { TOKEN_PROGRAM_ID } from "./utils/constants";
import { sendTransactionWithRetryWithKeypair } from "./utils/transactions";
import { getPriceWithMantissa } from "./utils/various";
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { RiContactsBookLine } from "react-icons/ri";
import { KeySystems } from "hls.js";
import { truncate } from "fs/promises";

export const createOrder = async (
  mint: string,
  price: number,
  currency: string,
  buy: boolean,
  user_id?: string,
  public_key?: string
): Promise<any> => {
  const { data, error } = await supabase
    .from("order_book")
    .insert([
      {
        mint,
        price,
        currency,
        buy: false,
        active: true,
        user_id,
        public_key,
        onchain_success: true
      },
    ])
    .single();

  if (error) {
    console.log(error.message);
    return null;
  }
  return data;
};

export const cancelOrder = async (
  mint: string,
  price: number,
  currency: string,
  buy: boolean,
  user_id?: string,
  public_key?: string
): Promise<any> => {
  //Handle public_key null case

  const { data, error } = await supabase
    .from("order_book")
    .update({ active: false, onchain_success: true })
    .match({
      mint,
      price,
      currency,
      buy,
      active: true,
      user_id,
    });

  if (error) {
    console.log(error.message);
    return null;
  }
  return data;
};

export const sell = async (
  auctionHouse: string,
  seller_keypair: web3.Keypair,
  mint: string,
  price: number,
  currency: string,
  buy: boolean,
  seller_private_key: web3.Keypair,
  user_id?: string,
  public_key?: string,
  retry_count: number = 0
): Promise<any> => {
  const auctionHouseSigns = true;
  const tokenSize = 1;
  const auctionHouseKeypair = seller_keypair;
  const env = process.env.NEXT_PUBLIC_SOL_ENV as string;

  const auctionHouseKey = new web3.PublicKey(auctionHouse);
  const walletKeyPair = seller_private_key;

  const mintKey = new web3.PublicKey(mint);

  const auctionHouseKeypairLoaded = auctionHouseKeypair
  const anchorProgram = await loadAuctionHouseProgram(
    auctionHouseSigns ? auctionHouseKeypairLoaded : walletKeyPair,
    env
  );
  const auctionHouseObj = await anchorProgram.account.auctionHouse.fetch(
    auctionHouseKey
  );

  try {
    const buyPriceAdjusted = new BN(
      await getPriceWithMantissa(
        price,
        //@ts-ignore
        auctionHouseObj.treasuryMint,
        walletKeyPair,
        anchorProgram
      )
    );

    const tokenSizeAdjusted = new BN(
      await getPriceWithMantissa(
        tokenSize,
        mintKey,
        walletKeyPair,
        anchorProgram
      )
    );

    const tokenAccountKey = (
      await getAtaForMint(mintKey, walletKeyPair.publicKey)
    )[0];

    const [programAsSigner, programAsSignerBump] =
      await getAuctionHouseProgramAsSigner();
    // const metadata = await getMetadata(mintKey);

    const [tradeState, tradeBump] = await getAuctionHouseTradeState(
      auctionHouseKey,
      walletKeyPair.publicKey,
      tokenAccountKey,
      //@ts-ignore
      auctionHouseObj.treasuryMint,
      mintKey,
      tokenSizeAdjusted,
      buyPriceAdjusted
    );

    const [freeTradeState, freeTradeBump] = await getAuctionHouseTradeState(
      auctionHouseKey,
      walletKeyPair.publicKey,
      tokenAccountKey,
      //@ts-ignore
      auctionHouseObj.treasuryMint,
      mintKey,
      tokenSizeAdjusted,
      new BN(0)
    );

    const signers: web3.Keypair[] = [auctionHouseKeypair, walletKeyPair];

    const instruction = await anchorProgram.instruction.sell(
      tradeBump,
      freeTradeBump,
      programAsSignerBump,
      buyPriceAdjusted,
      tokenSizeAdjusted,
      {
        accounts: {
          wallet: walletKeyPair.publicKey,
          metadata: await getMetadata(mintKey),
          tokenAccount: tokenAccountKey,
          //@ts-ignore
          authority: auctionHouseObj.authority,
          auctionHouse: auctionHouseKey,
          //@ts-ignore
          auctionHouseFeeAccount: auctionHouseObj.auctionHouseFeeAccount,
          sellerTradeState: tradeState,
          freeSellerTradeState: freeTradeState,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: web3.SystemProgram.programId,
          programAsSigner,
          rent: web3.SYSVAR_RENT_PUBKEY,
        },
        signers,
      }
    );

    if (auctionHouseKeypairLoaded) {
      signers.push(auctionHouseKeypairLoaded);

      instruction.keys
        .filter((k) => k.pubkey.equals(auctionHouseKeypairLoaded.publicKey))
        .map((k) => (k.isSigner = true));
    }

    if (auctionHouseSigns) {
      instruction.keys
        .filter((k) => k.pubkey.equals(walletKeyPair.publicKey))
        .map((k) => (k.isSigner = true));
    }

      // console.log(`signers: ${signers.map((k) => k.publicKey.toBase58())}`)

    const tx = await sendTransactionWithRetryWithKeypair(
      anchorProgram.provider.connection,
      auctionHouseKeypair,
      [instruction],
      signers,
      "max"
    );

    return tx;
  } catch (e: any) {
    if (e.message.includes("Failed to find") && retry_count < 3) {
      console.log("Failed to find mint, trying in 5 seconds");
      // Wait 20 seconds and retry
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return sell(
        auctionHouse,
        seller_keypair,
        mint,
        price,
        currency,
        buy,
        seller_private_key,
        undefined,
        undefined,
        retry_count + 1
      );
    } else return { error: e.message };
  }

};


// NEED TO UPDATE THIS CANCEL FUNCTION TO WORK AS ABOVE
export const cancel = async (
  auctionHouse: string,
  seller_keypair: web3.Keypair,
  mint: string,
  price: number,
  currency: string,
  buy: boolean,
  seller_private_key: web3.Keypair,
  user_id?: string,
  public_key?: string
): Promise<any> => {
  const auctionHouseSigns = true;
  const tokenSize = 1;
  // const auctionHouseKeypair = await web3.Keypair.fromSecretKey(base58.decode("SECRETKEY"))
  const auctionHouseKeypair = seller_keypair;
  const env = process.env.NEXT_PUBLIC_SOL_ENV as string;

  const auctionHouseKey = new web3.PublicKey(auctionHouse);
  const walletKeyPair = seller_private_key;

  const mintKey = new web3.PublicKey(mint);

  const auctionHouseKeypairLoaded = auctionHouseKeypair
  const anchorProgram = await loadAuctionHouseProgram(
    auctionHouseSigns ? auctionHouseKeypairLoaded! : walletKeyPair,
    env
  );
  const auctionHouseObj = await anchorProgram.account.auctionHouse.fetch(
    auctionHouseKey
  );

  const buyPriceAdjusted = new BN(
    await getPriceWithMantissa(
      price,
      //@ts-ignore
      auctionHouseObj.treasuryMint,
      walletKeyPair,
      anchorProgram
    )
  );

  const tokenSizeAdjusted = new BN(
    await getPriceWithMantissa(tokenSize, mintKey, walletKeyPair, anchorProgram)
  );

  const tokenAccountKey = (
    await getAtaForMint(mintKey, walletKeyPair.publicKey)
  )[0];

  const tradeState = (
    await getAuctionHouseTradeState(
      auctionHouseKey,
      walletKeyPair.publicKey,
      tokenAccountKey,
      //@ts-ignore
      auctionHouseObj.treasuryMint,
      mintKey,
      tokenSizeAdjusted,
      buyPriceAdjusted
    )
  )[0];

  console.log(
    "EVERYTHING",
    auctionHouseKey,
    walletKeyPair.publicKey,
    tokenAccountKey,
    //@ts-ignore
    auctionHouseObj.treasuryMint,
    mintKey,
    tokenSizeAdjusted,
    buyPriceAdjusted,
    "---------------"
  );

  console.log(`tradeState: ${tradeState}`);

  const signers: web3.Keypair[] = [auctionHouseKeypair, walletKeyPair];

  const instruction = await anchorProgram.instruction.cancel(
    buyPriceAdjusted,
    tokenSizeAdjusted,
    {
      accounts: {
        wallet: walletKeyPair.publicKey,
        tokenAccount: tokenAccountKey,
        tokenMint: mintKey,
        //@ts-ignore
        authority: auctionHouseObj.authority,
        auctionHouse: auctionHouseKey,
        //@ts-ignore
        auctionHouseFeeAccount: auctionHouseObj.auctionHouseFeeAccount,
        tradeState,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers,
    }
  );

  console.log(`tradeState.toBase58(): ${tradeState.toBase58()}`);

  if (auctionHouseKeypairLoaded) {
    signers.push(auctionHouseKeypairLoaded);

    instruction.keys
      .filter((k) => k.pubkey.equals(auctionHouseKeypairLoaded.publicKey))
      .map((k) => (k.isSigner = true));
  }

  if (auctionHouseSigns) {
    instruction.keys
      .filter((k) => k.pubkey.equals(walletKeyPair.publicKey))
      .map((k) => (k.isSigner = true));
  }

  console.log(instruction.keys.map((k) => k.pubkey.toBase58()));

  const tx = await sendTransactionWithRetryWithKeypair(
    anchorProgram.provider.connection,
    auctionHouseKeypair,
    [instruction],
    signers,
    "max"
  );

  return tx;
};
