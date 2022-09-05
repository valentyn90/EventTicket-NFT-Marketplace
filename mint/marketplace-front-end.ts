import { BN, web3, Wallet } from "@project-serum/anchor";
import base58 from "bs58";
import log from "loglevel";
import {
  getAtaForMint,
  getAuctionHouseBuyerEscrow,
  getAuctionHouseFeeAcct,
  getAuctionHouseProgramAsSigner,
  getAuctionHouseTradeState,
  getAuctionHouseTreasuryAcct,
  getMetadata,
  getTokenAmount,
  loadAuctionHouseProgram,
  loadAuctionHouseProgramAnchor,
} from "./utils/accounts";
import { TOKEN_PROGRAM_ID, WRAPPED_SOL_MINT } from "./utils/constants";
import { sendTransactionWithRetryWithKeypair } from "./utils/transactions";
import { getPriceWithMantissa } from "./utils/various";
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Cluster } from "@solana/web3.js";
import { decodeMetadata, Metadata } from "./utils/schema";
import { env } from "process";

export const buy = async (
  auctionHouse: string,
  walletWrapper: AnchorWallet | undefined,
  mint: string,
  price: number,
  currency: string,
  buy: boolean,
  user_id?: string,
  public_key?: string
): Promise<any> => {
  const auctionHouseSigns = false;
  const tokenAccount = null;
  const tokenSize = 1;
  // const auctionHouseKeypair = await web3.Keypair.fromSecretKey(base58.decode("SECRETKEY"))
  const auctionHouseKeypair = null;
  const env = process.env.NEXT_PUBLIC_SOL_ENV!;

  let env_name = "devnet";

  if(env === "https://ssc-dao.genesysgo.net/" || env.includes("mainnet")) {
    env_name = "mainnet-beta";
  }

  const auctionHouseKey = new web3.PublicKey(auctionHouse);

  const mintKey = new web3.PublicKey(mint);

  const auctionHouseKeypairLoaded = auctionHouseKeypair
    ? await web3.Keypair.fromSecretKey(base58.decode("SECRETKEY")) //loadWalletKey(auctionHouseKeypair)
    : null;
  const anchorProgram = await loadAuctionHouseProgramAnchor(walletWrapper, env_name, env);
  const auctionHouseObj = await anchorProgram.account.auctionHouse.fetch(
    auctionHouseKey
  );

  const buyPriceAdjusted = new BN(
    await getPriceWithMantissa(
      price,
      //@ts-ignore
      auctionHouseObj.treasuryMint,
      walletWrapper,
      anchorProgram
    )
  );

  const tokenSizeAdjusted = new BN(
    await getPriceWithMantissa(tokenSize, mintKey, walletWrapper, anchorProgram)
  );

  const [escrowPaymentAccount, escrowBump] = await getAuctionHouseBuyerEscrow(
    auctionHouseKey,
    walletWrapper!.publicKey
  );

  const results =
    await anchorProgram.provider.connection.getTokenLargestAccounts(mintKey);

  const tokenAccountKey: web3.PublicKey = tokenAccount
    ? new web3.PublicKey(tokenAccount)
    : results.value[0].address;

  const [tradeState, tradeBump] = await getAuctionHouseTradeState(
    auctionHouseKey,
    walletWrapper!.publicKey,
    tokenAccountKey,
    //@ts-ignore
    auctionHouseObj.treasuryMint,
    mintKey,
    tokenSizeAdjusted,
    buyPriceAdjusted
  );

  //@ts-ignore
  const isNative = auctionHouseObj.treasuryMint.equals(WRAPPED_SOL_MINT);

  const ata = (
    await getAtaForMint(
      //@ts-ignore
      auctionHouseObj.treasuryMint,
      walletWrapper!.publicKey
    )
  )[0];
  const transferAuthority = web3.Keypair.generate();
  const signers = isNative ? [] : [transferAuthority];
  const instruction = await anchorProgram.instruction.buy(
    tradeBump,
    escrowBump,
    buyPriceAdjusted,
    tokenSizeAdjusted,
    {
      accounts: {
        wallet: walletWrapper!.publicKey,
        paymentAccount: isNative ? walletWrapper!.publicKey : ata,
        transferAuthority: isNative
          ? web3.SystemProgram.programId
          : transferAuthority.publicKey,
        metadata: await getMetadata(mintKey),
        tokenAccount: tokenAccountKey,
        escrowPaymentAccount,
        //@ts-ignore
        treasuryMint: auctionHouseObj.treasuryMint,
        //@ts-ignore
        authority: auctionHouseObj.authority,
        auctionHouse: auctionHouseKey,
        //@ts-ignore
        auctionHouseFeeAccount: auctionHouseObj.auctionHouseFeeAccount,
        buyerTradeState: tradeState,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      },
    }
  );

  if (auctionHouseKeypairLoaded) {
    signers.push(auctionHouseKeypairLoaded);

    instruction.keys
      .filter((k) => k.pubkey.equals(auctionHouseKeypairLoaded.publicKey))
      .map((k) => (k.isSigner = true));
  }

  if (!isNative) {
    instruction.keys
      .filter((k) => k.pubkey.equals(transferAuthority.publicKey))
      .map((k) => (k.isSigner = true));
  }

  const instructions = [
    ...(isNative
      ? []
      : [
          Token.createApproveInstruction(
            TOKEN_PROGRAM_ID,
            ata,
            transferAuthority.publicKey,
            walletWrapper!.publicKey,
            [],
            buyPriceAdjusted.toNumber()
          ),
        ]),

    instruction,
    ...(isNative
      ? []
      : [
          Token.createRevokeInstruction(
            TOKEN_PROGRAM_ID,
            ata,
            walletWrapper!.publicKey,
            []
          ),
        ]),
  ];
  const res = await sendTransactionWithRetryWithKeypair(
    anchorProgram.provider.connection,
    walletWrapper!,
    instructions,
    signers,
    "max"
  );

  log.info("Made offer for ", price);

  return res;
};

export async function buyInstructions(
  auctionHouseWithDetails: object,
  walletWrapper: AnchorWallet | undefined,
  mint: string,
  buyPrice: number
): Promise<any> {
  const tokenSize = 1;
  // @ts-ignore
  const auctionHouseKey = auctionHouseWithDetails.auctionHouseKey;
  const mintKey = new web3.PublicKey(mint);
  // @ts-ignore
  const anchorProgram = auctionHouseWithDetails.anchorProgram;
  // @ts-ignore
  const auctionHouseObj = auctionHouseWithDetails.auctionHouseObj;

  const buyPriceAdjusted = new BN(
    await getPriceWithMantissa(
      buyPrice,
      //@ts-ignore
      auctionHouseObj.treasuryMint,
      walletWrapper,
      anchorProgram
    )
  );

  const tokenSizeAdjusted = new BN(
    await getPriceWithMantissa(tokenSize, mintKey, walletWrapper, anchorProgram)
  );

  const [escrowPaymentAccount, escrowBump] = await getAuctionHouseBuyerEscrow(
    auctionHouseKey,
    walletWrapper!.publicKey
  );

  const results =
    await anchorProgram.provider.connection.getTokenLargestAccounts(mintKey);

  const tokenAccountKey: web3.PublicKey = results.value[0].address;

  const [tradeState, tradeBump] = await getAuctionHouseTradeState(
    auctionHouseKey,
    walletWrapper!.publicKey,
    tokenAccountKey,
    //@ts-ignore
    auctionHouseObj.treasuryMint,
    mintKey,
    tokenSizeAdjusted,
    buyPriceAdjusted
  );

  //@ts-ignore
  const isNative = auctionHouseObj.treasuryMint.equals(WRAPPED_SOL_MINT);

  const ata = (
    await getAtaForMint(
      //@ts-ignore
      auctionHouseObj.treasuryMint,
      walletWrapper!.publicKey
    )
  )[0];

  const transferAuthority = web3.Keypair.generate();
  const signers = isNative ? [] : [transferAuthority];
  const instruction = await anchorProgram.instruction.buy(
    tradeBump,
    escrowBump,
    buyPriceAdjusted,
    tokenSizeAdjusted,
    {
      accounts: {
        wallet: walletWrapper!.publicKey,
        paymentAccount: isNative ? walletWrapper!.publicKey : ata,
        transferAuthority: isNative
          ? web3.SystemProgram.programId
          : transferAuthority.publicKey,
        metadata: await getMetadata(mintKey),
        tokenAccount: tokenAccountKey,
        escrowPaymentAccount,
        //@ts-ignore
        treasuryMint: auctionHouseObj.treasuryMint,
        //@ts-ignore
        authority: auctionHouseObj.authority,
        auctionHouse: auctionHouseKey,
        //@ts-ignore
        auctionHouseFeeAccount: auctionHouseObj.auctionHouseFeeAccount,
        buyerTradeState: tradeState,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      },
    }
  );

  if (!isNative) {
    // @ts-ignore
    instruction.keys
      // @ts-ignore
      .filter((k) => k.pubkey.equals(transferAuthority.publicKey))
      // @ts-ignore
      .map((k) => (k.isSigner = true));
  }

  const instructions = [
    ...(isNative
      ? []
      : [
          Token.createApproveInstruction(
            TOKEN_PROGRAM_ID,
            ata,
            transferAuthority.publicKey,
            walletWrapper!.publicKey,
            [],
            buyPriceAdjusted.toNumber()
          ),
        ]),

    instruction,
    ...(isNative
      ? []
      : [
          Token.createRevokeInstruction(
            TOKEN_PROGRAM_ID,
            ata,
            walletWrapper!.publicKey,
            []
          ),
        ]),
  ];

  return {
    signers: signers,
    instructions: instructions,
  };
}

export async function executeSale(
  auctionHouseWithDetails: object,
  walletWrapper: AnchorWallet | undefined,
  mint: string,
  buyPrice: number,
  buyerWalletPubKey: web3.PublicKey,
  sellerWalletPubKey: web3.PublicKey
): Promise<any> {
  const tokenSize = 1;
  // @ts-ignore
  const auctionHouseKey = auctionHouseWithDetails.auctionHouseKey;
  const mintKey = new web3.PublicKey(mint);
  // @ts-ignore
  const anchorProgram = auctionHouseWithDetails.anchorProgram;
  // @ts-ignore
  const auctionHouseObj = auctionHouseWithDetails.auctionHouseObj;

  //@ts-ignore
  const isNative = auctionHouseObj.treasuryMint.equals(WRAPPED_SOL_MINT);
  const buyPriceAdjusted = new BN(
    await getPriceWithMantissa(
      buyPrice,
      //@ts-ignore
      auctionHouseObj.treasuryMint,
      walletWrapper,
      anchorProgram
    )
  );

  const tokenSizeAdjusted = new BN(
    await getPriceWithMantissa(tokenSize, mintKey, walletWrapper, anchorProgram)
  );

  const tokenAccountKey = await getAtaForMint(mintKey, sellerWalletPubKey);

  const buyerTradeState = (
    await getAuctionHouseTradeState(
      auctionHouseKey,
      buyerWalletPubKey,
      tokenAccountKey[0],
      //@ts-ignore
      auctionHouseObj.treasuryMint,
      mintKey,
      tokenSizeAdjusted,
      buyPriceAdjusted
    )
  )[0];

  const sellerTradeState = (
    await getAuctionHouseTradeState(
      auctionHouseKey,
      sellerWalletPubKey,
      tokenAccountKey[0],
      //@ts-ignore
      auctionHouseObj.treasuryMint,
      mintKey,
      tokenSizeAdjusted,
      buyPriceAdjusted
    )
  )[0];

  const [freeTradeState, freeTradeStateBump] = await getAuctionHouseTradeState(
    auctionHouseKey,
    sellerWalletPubKey,
    tokenAccountKey[0],
    //@ts-ignore
    auctionHouseObj.treasuryMint,
    mintKey,
    tokenSizeAdjusted,
    new BN(0)
  );
  const [escrowPaymentAccount, bump] = await getAuctionHouseBuyerEscrow(
    auctionHouseKey,
    buyerWalletPubKey
  );
  const [programAsSigner, programAsSignerBump] =
    await getAuctionHouseProgramAsSigner();
  const metadata = await getMetadata(mintKey);

  const metadataObj = await anchorProgram.provider.connection.getAccountInfo(
    metadata
  );

  const metadataDecoded: Metadata = decodeMetadata(
    // @ts-ignore
    Buffer.from(metadataObj.data)
  );

  // console.log(metadataDecoded);

  const remainingAccounts = [];

  // @ts-ignore
  for (let i = 0; i < metadataDecoded.data.creators.length; i++) {
    remainingAccounts.push({
      // @ts-ignore
      pubkey: new web3.PublicKey(metadataDecoded.data.creators[i].address),
      isWritable: true,
      isSigner: false,
    });
    if (!isNative) {
      const ata: any = await getAtaForMint(
        //@ts-ignore
        auctionHouseObj.treasuryMint,
        remainingAccounts[remainingAccounts.length - 1].pubkey
      );
      remainingAccounts.push({
        pubkey: ata[0],
        isWritable: true,
        isSigner: false,
      });
    }
  }

  const signers: any[] = [];
  //@ts-ignore
  const tMint: web3.PublicKey = auctionHouseObj.treasuryMint;

  const buyerReceiptTokenAccount = await getAtaForMint(
    mintKey,
    buyerWalletPubKey
  );

  const instruction = await anchorProgram.instruction.executeSale(
    bump,
    freeTradeStateBump,
    programAsSignerBump,
    buyPriceAdjusted,
    tokenSizeAdjusted,
    {
      accounts: {
        buyer: buyerWalletPubKey,
        seller: sellerWalletPubKey,
        metadata,
        tokenAccount: tokenAccountKey[0],
        tokenMint: mintKey,
        escrowPaymentAccount,
        treasuryMint: tMint,
        sellerPaymentReceiptAccount: isNative
          ? sellerWalletPubKey
          : (
              await getAtaForMint(tMint, sellerWalletPubKey)
            )[0],
        buyerReceiptTokenAccount: buyerReceiptTokenAccount[0],
        //@ts-ignore
        authority: auctionHouseObj.authority,
        auctionHouse: auctionHouseKey,
        //@ts-ignore
        auctionHouseFeeAccount: auctionHouseObj.auctionHouseFeeAccount,
        //@ts-ignore
        auctionHouseTreasury: auctionHouseObj.auctionHouseTreasury,
        sellerTradeState,
        buyerTradeState,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
        ataProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        programAsSigner,
        rent: web3.SYSVAR_RENT_PUBKEY,
        freeTradeState,
      },
      remainingAccounts,
      signers,
    }
  );

  // console.log(`Instruction keys BEFORE: ${JSON.stringify(instruction.keys)}`);

  instruction.keys
    .filter((k: any) => k.pubkey.equals(walletWrapper!.publicKey))
    .map((k: any) => (k.isSigner = true));

  // console.log(`Instruction keys: ${JSON.stringify(instruction.keys)}`);

  return {
    signers: signers,
    instructions: [instruction],
  };
}

export async function buyAndExecuteSale(
  auctionHouseWithDetails: object,
  walletWrapper: AnchorWallet | undefined,
  mint: string,
  buyPrice: number,
  buyerWalletPubKey: web3.PublicKey,
  sellerWalletPubKey: web3.PublicKey,
  executeOnly: boolean = false
): Promise<any> {
  // @ts-ignore
  const auctionHouseKey = auctionHouseWithDetails.auctionHouseKey;
  new web3.PublicKey(mint);
  // @ts-ignore
  const anchorProgram = auctionHouseWithDetails.anchorProgram;
  // @ts-ignore
  const buyInstructionsArray = await buyInstructions(
    auctionHouseWithDetails,
    walletWrapper,
    mint,
    buyPrice
  );

  const executeSaleInstructionArray = await executeSale(
    auctionHouseWithDetails,
    walletWrapper,
    mint,
    buyPrice,
    buyerWalletPubKey,
    sellerWalletPubKey
  );
  const instructionsArray = executeOnly
    ? executeSaleInstructionArray.instructions
    : [
        buyInstructionsArray.instructions,
        executeSaleInstructionArray.instructions,
      ].flat();
  const signersArray = executeOnly
    ? executeSaleInstructionArray.signers
    : [
        buyInstructionsArray.signers,
        executeSaleInstructionArray.signers,
      ].flat();

  console.log("----------------------");
  console.log(instructionsArray[0].keys.map((k: any) => k.pubkey.toBase58()));
  console.log(
    JSON.stringify(
      instructionsArray[0].keys.map((k: any) => {
        k.pubkey.toBase58(), k.isSigner, k.isWritable;
      })
    )
  );

  const txData = await sendTransactionWithRetryWithKeypair(
    anchorProgram.provider.connection,
    walletWrapper!,
    instructionsArray,
    signersArray,
    "max"
  );

  return txData;
}

export async function buyAndExecute(
  auctionHouse: string,
  walletWrapper: AnchorWallet | undefined,
  mint: string,
  buyPrice: number,
  buyerWalletPubKey: string,
  sellerWalletPubKey: string
): Promise<any> {
  const buyerKey = new web3.PublicKey(buyerWalletPubKey);
  const sellerKey = new web3.PublicKey(sellerWalletPubKey);
  const env = process.env.NEXT_PUBLIC_SOL_ENV!;

  const auctionHouseWithDetails = await getAuctionHouseWithDetails(
    auctionHouse,
    env,
    walletWrapper
  );

  const txData = await buyAndExecuteSale(
    auctionHouseWithDetails,
    walletWrapper,
    mint,
    buyPrice,
    buyerKey,
    sellerKey,
    false
  );

  return txData;
}

export async function getAuctionHouseWithDetails(
  auctionHouse: string,
  env: string,
  walletWrapper: AnchorWallet | undefined
) {
  const auctionHouseKey: web3.PublicKey = new web3.PublicKey(auctionHouse);
  const auctionHouseFeesAccount = await getAuctionHouseFeeAcct(auctionHouseKey);
  const auctionHouseTreasuryAccount = await getAuctionHouseTreasuryAcct(
    auctionHouseKey
  );

  let customRpcUrl = null;
  if(env != 'devnet'){
    customRpcUrl = env
  }

  const anchorProgram = await loadAuctionHouseProgramAnchor(
    walletWrapper,
    env as Cluster,
    customRpcUrl
  );
  const auctionHouseObj = await anchorProgram.account.auctionHouse.fetch(
    auctionHouseKey
  );
  // @ts-ignore
  const isNative = auctionHouseObj.treasuryMint.equals(WRAPPED_SOL_MINT);

  const treasuryAmount = await getTokenAmount(
    anchorProgram,
    //@ts-ignore
    auctionHouseObj.auctionHouseTreasury,
    //@ts-ignore
    auctionHouseObj.treasuryMint
  );

  const feeAmount = await anchorProgram.provider.connection.getBalance(
    //@ts-ignore
    auctionHouseObj.auctionHouseFeeAccount
  );

  return {
    auctionHouse: auctionHouse,
    auctionHouseKey: auctionHouseKey,
    auctionHouseFeesAccount: auctionHouseFeesAccount,
    auctionHouseTreasuryAccount: auctionHouseTreasuryAccount,
    auctionHouseObj: auctionHouseObj,
    //@ts-ignore
    sellerFeeBasisPoints: auctionHouseObj.sellerFeeBasisPoints,
    //@ts-ignore
    requiresSignOff: auctionHouseObj.requiresSignOff,
    //@ts-ignore
    canChangeSalePrice: auctionHouseObj.canChangeSalePrice,
    //@ts-ignore
    ahBump: auctionHouseObj.bump,
    //@ts-ignore
    ahFeeBump: auctionHouseObj.feePayerBump,
    //@ts-ignore
    ahTreasuryBump: auctionHouseObj.treasuryBump,
    anchorProgram: anchorProgram,
    balance: {
      feeAmount: feeAmount,
      treasuryAmount: treasuryAmount,
    },
    base58Details: {
      auctionHouse: auctionHouseKey.toBase58(),
      // @ts-ignore
      treasuryMint: auctionHouseObj.treasuryMint.toBase58(),
      // @ts-ignore
      authority: auctionHouseObj.authority.toBase58(),
      //@ts-ignore
      creator: auctionHouseObj.creator.toBase58(),
      //@ts-ignore
      feePayerAcct: auctionHouseObj.auctionHouseFeeAccount.toBase58(),
      //@ts-ignore
      treasuryAcct: auctionHouseObj.auctionHouseTreasury.toBase58(),
      //@ts-ignore
      feePayerWithdrawalAcct:
        auctionHouseObj.feeWithdrawalDestination.toBase58(),
      //@ts-ignore
      treasuryWithdrawalAcct:
        auctionHouseObj.treasuryWithdrawalDestination.toBase58(),
    },
  };
}
