import { supabase } from "@/supabase/supabase-admin";
import * as web3 from "@solana/web3.js";
import { BN, } from "@project-serum/anchor";
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
import { createConnection } from "@/utils/web3/queries";
import { Account, PublicKey, Transaction } from "@solana/web3.js";
import { AuctionHouse } from "@metaplex-foundation/mpl-auction-house/dist/src/generated";

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
    return error;
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
  let env_name = "mainnet-beta";

  if (env.includes("dev")) {
    env_name = "devnet";
  }

  const connection = new web3.Connection(
    env == "devnet" ? web3.clusterApiUrl("devnet") : env,
    "confirmed"
  );

  const auctionHouseKey = new web3.PublicKey(auctionHouse);
  const walletKeyPair = seller_private_key;

  const mintKey = new web3.PublicKey(mint);

  const auctionHouseKeypairLoaded = auctionHouseKeypair
  const anchorProgram = await loadAuctionHouseProgram(
    auctionHouseSigns ? auctionHouseKeypairLoaded : walletKeyPair,
    env_name, env
  );
  const auctionHouseObj = await anchorProgram.account.auctionHouse.fetch(
    auctionHouseKey
  );

  // const auctionHouseNew = await AuctionHouse.fromAccountAddress(connection, auctionHouseKey)



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
      "confirmed"
    );

    console.log(`Listing tx: ${JSON.stringify(tx)}`);
    return tx;
  } catch (e: any) {
    // if (e.message.includes("Failed to find") && retry_count < 3) {
    if (e.message.includes("Failed to find") && retry_count <= 3) {
      console.log("Failed to find mint, trying in 5 seconds");
      // Wait 5 seconds and retry
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
  let env_name = "mainnet-beta";

  if (env.includes("dev")) {
    env_name = "devnet";
  }

  const auctionHouseKey = new web3.PublicKey(auctionHouse);
  const walletKeyPair = seller_private_key;

  const mintKey = new web3.PublicKey(mint);

  const auctionHouseKeypairLoaded = auctionHouseKeypair
  const anchorProgram = await loadAuctionHouseProgram(
    auctionHouseSigns ? auctionHouseKeypairLoaded! : walletKeyPair,
    env_name, env
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
    "confirmed"
  );

  console.log(`Cancel tx: ${JSON.stringify(tx)}`);
  return tx;
};

export const sendTokenVfd = async (
  connection: web3.Connection,
  amount: number,
  destination: PublicKey,
  source: PublicKey,
  wallet: web3.Keypair,
  mint: PublicKey,
  feePayer: web3.Keypair
): Promise<any> => {

  const txs = [];
  const destAta = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mint,
    destination,
  );


  // const recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const transactionBlockhashCtor = {
    // blockhash: recentBlockhash,
    feePayer: feePayer.publicKey,
  };

  // Can't Buy the same token twice with a credit card
  // try {
  //   // check if the account exists
  //   console.log("Checking if account exists")
  //   const accountInfo = await connection.getAccountInfo(destAta)
  //   console.log(accountInfo)
  // } catch {
  //   console.log("Account does not exist")
  txs.push(

    Token.createAssociatedTokenAccountInstruction(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      mint,
      destAta,
      destination,
      feePayer.publicKey,
    )

  )
  // }

  txs.push(

    Token.createTransferInstruction(
      TOKEN_PROGRAM_ID,
      source,
      destAta,
      wallet.publicKey,
      [],
      amount,
    ),

  );




  const transaction = new Transaction(transactionBlockhashCtor);
  txs.forEach(instruction => transaction.add(instruction));

  const signature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [wallet, feePayer],

  );

  return { txId: signature };

}

export const transferViaCreditCard = async (
  mint: string,
  price: number,
  currency: string,
  seller_private_key: web3.Keypair,
  buyer_public_key: string,
  svcKeypair: web3.Keypair
): Promise<any> => {

  const connection = createConnection(process.env.NEXT_PUBLIC_SOL_ENV!)

  //send minimal sol to seller account to pay for the transaction
  // const transaction = new web3.Transaction().add(
  //   web3.SystemProgram.transfer({
  //     fromPubkey: svcKeypair.publicKey,
  //     toPubkey: seller_private_key.publicKey,
  //     lamports: web3.LAMPORTS_PER_SOL * 0.003,
  //   }),
  // );



  // console.log("Attempting to send some sol")
  // Sign transaction, broadcast, and confirm
  // const signature = await web3.sendAndConfirmTransaction(
  //   connection,
  //   transaction,
  //   [svcKeypair],
  //   {
  //     skipPreflight: true,
  //   }
  // );

  // console.log("Sol sent")

  const token = new Token(
    connection,
    new PublicKey(mint),
    TOKEN_PROGRAM_ID,
    seller_private_key
  )

  const fromTokenAccount = await token.getOrCreateAssociatedAccountInfo(
    seller_private_key.publicKey
  );

  console.log("Attempting to send")
  //Loop and attempt to send 3 times
  for (let i = 0; i < 3; i++) {

    try {
      const sendToken = await sendTokenVfd(
        connection,
        1,
        new PublicKey(buyer_public_key),
        fromTokenAccount.address,
        seller_private_key,
        new PublicKey(mint),
        svcKeypair
      )
      return sendToken
    }
    catch (e) {
      console.log(e)
    }

    
  }

  return { error: "Failed to send token" }



  // const sendToken = await actions.sendToken({
  //   connection,
  //   amount: 1,
  //   destination: new PublicKey(buyer_public_key),
  //   source: fromTokenAccount.address,
  //   wallet: new NodeWallet(seller_private_key),
  //   mint: new PublicKey(mint),
  // })


}

