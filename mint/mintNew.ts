import * as web3 from "@solana/web3.js";
import base58 from "bs58";
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { supabase } from "@/supabase/supabase-admin";
import crypto from "crypto-js";
import randCrypto from "crypto";
import { resourceUsage } from "process";
import { stringifyPubkeysAndBNsInObject } from "./utils/util";
import Bundlr from "@bundlr-network/client";
import { getFileFromSupabase } from "@/supabase/supabase-client";
import { SelectPicker } from "rsuite";
import { generateMetadata } from "./utils/metadata";
import Key from "@/types/Key";
import BigNumber from "bignumber.js";
import { checkTokenBalance } from "./utils/accounts";
import { Account } from "@metaplex-foundation/mpl-core"
// import { Metadata, UpdatePrimarySaleHappenedViaToken, SetAndVerifyCollectionCollection, Edition } from "@metaplex-foundation/mpl-token-metadata";
import {createSetAndVerifyCollectionInstruction, createUpdatePrimarySaleHappenedViaTokenInstruction} from "@metaplex-foundation/mpl-token-metadata";
import { Metaplex, keypairIdentity, bundlrStorage, findMasterEditionV2Pda, findMetadataPda, createNftOperation, BundlrStorageDriver, useMetaplexFile } from "@metaplex-foundation/js";
import generateKeypair, { getKeypair } from "./mint";
import { createOrder, sell } from "./marketplace";
// import { Connection, clusterApiUrl } from "@solana/web3.js";

//https://openquest.xyz/quest/create-burn-nft-solana

const verifiedSolSvcKey = process.env.VERIFIED_INK_SOL_SERVICE_KEY!;
const env = process.env.NEXT_PUBLIC_SOL_ENV!;
const verified_treasury_public_key = "DBfQBErRFtsuQZkae8tEFaoruRANyiVM6aPs2zuzsx3C";
const AUCTION_HOUSE = process.env.NEXT_PUBLIC_AUCTION_HOUSE;


export async function mintAndTransferNFT(nft_id: number, serial_no: number) {

  try {
    const { data, error } = await supabase
      .from("nft_owner")
      .select("*")
      .eq("nft_id", nft_id)
      .eq("serial_no", serial_no)
      .maybeSingle();

    if (data.mint) {
      console.log("Already minted:", data.mint);
      return { mint: data.mint , success:true };
    }

    const { data: nft_details, error: nft_details_error } = await supabase
      .from("nft")
      .select("*")
      .match({ id: nft_id })
      .maybeSingle();

    const user_id = data.owner_id;
    const keypair = await web3.Keypair.fromSecretKey(
      base58.decode(verifiedSolSvcKey)
    );
    const connection = new web3.Connection(
      env == "devnet" ? web3.clusterApiUrl("devnet") : env,
      "confirmed"
    );

    // Get owner's public key
    const { data: user_key, error: error2 } = await supabase
      .from("keys")
      .select("public_key")
      .match({ user_id: user_id })
      .maybeSingle();

    let user_public_key = "";

    if (user_key) {
      user_public_key = user_key.public_key;
    } else {
      const { success, data, message } = await generateKeypair(
        user_id
      );
      if (success && data) {
        user_public_key = data.public_key;
      } else {
        console.log(message);
        return {success:false, error:message };
      }
    }
    /////
    const metaplex = Metaplex.make(connection).use(keypairIdentity(keypair))
      .use(bundlrStorage(
        env.includes("dev") ?
          {
            address: 'https://devnet.bundlr.network',
            providerUrl: 'https://api.devnet.solana.com',
            timeout: 60000,
            withdrawAfterUploading: false,
          } : {
            withdrawAfterUploading: false,
          }
      ));

    let metadata_uri = ""

    if (data.state && data.state.includes("https")) {
      metadata_uri = data.state;
    }
    else {

      /// Get Image of NFT
      const screenshot = await fetch(
        `https://verified-api.vercel.app/api/screenshot/create/${nft_id}?serial_no=${serial_no}`
      );
      let dataurl = await screenshot.text();
      dataurl = dataurl.split(", ")[1];

      const buffer = Buffer.from(dataurl, "base64");

      const tags = [{ name: "Content-Type", value: "image/png" }];

      const { uri, metadata } = await metaplex.nfts().uploadMetadata({
        name: `${nft_details.first_name} ${nft_details.last_name} #${serial_no}/${nft_details.edition_quantity}`,
        symbol: "VFDINK",
        description: `VerifiedInk is a self-issued NFT platform for athletes to easily
       capitalize on their Name, Image, and Likeness.
       This NFT was created personally by ${nft_details.first_name} ${nft_details.last_name}.
       Proceeds from the initial purchase of their mint go directly to them, and they earn a
       royalty on all subsequent sales.
       [https://verifiedink.us/card/${nft_details.id}?serial_no=${serial_no.toString()}](https://verifiedink.us/card/${nft_details.id}?serial_no=${serial_no.toString()})
       `,
        image: await useMetaplexFile(buffer, `${nft_id}_${serial_no}.png`, { "tags": tags }),
        seller_fee_basis_points: 1000,
        external_url: `https://verifiedink.us/card/${nft_details.id}?serial_no=${serial_no.toString()}`,
        attributes: [
          {
            trait_type: "Name",
            value: `${nft_details.first_name} ${nft_details.last_name}`,
          },
          {
            trait_type: "Graduation Year",
            value: (nft_details.graduation_year + 2000).toString(),
          },
          {
            trait_type: "School",
            value: nft_details.high_school,
          },
          {
            trait_type: "State",
            value: nft_details.usa_state,
          },
          {
            trait_type: "Sport",
            value: nft_details.sport,
          },
          {
            trait_type: "Position",
            value: nft_details.sport_position,
          },
          {
            trait_type: "Serial Number",
            value: serial_no.toString(),
          },
          {
            trait_type: "Id",
            value: nft_details.id,
          },
          {
            trait_type: "Edition",
            value: nft_details.edition_name,
          },
          {
            trait_type: "Rarity",
            value: nft_details.edition_rarity,
          },
          {
            trait_type: "Mint Size",
            value: nft_details.edition_quantity.toString(),
          },
          {
            trait_type: "Verified Year",
            value: nft_details.vfd_year.toString(),
          },
        ],
        properties: {
          category: "image",
          creators: [
            {
              address: process.env.NEXT_PUBLIC_SOL_SERVICE_KEY_PUBLIC,
              share: 0,
            },
            {
              address: verified_treasury_public_key,
              share: 60,
            },
            {
              address: user_public_key,
              share: 40,
            },
          ],
        },
      });

      console.log(uri)
      metadata_uri = uri
      await supabase.from("nft_owner").update(
        {
          state: metadata_uri
        }
      ).eq("nft_id", nft_id)
        .eq("serial_no", serial_no)
        .single();

    }

    const input =
    {
      uri: metadata_uri,
      isMutable: true,
      owner: new web3.PublicKey(user_public_key),
      maxSupply: 0,
    }

    const operation = createNftOperation(input)
    const createNftOutput = await metaplex.operations().execute(operation);

    console.log(`nft.mint: ${createNftOutput.mint.publicKey}`)

    await supabase.from("nft_owner").update(
      {
        mint: createNftOutput.mint.publicKey.toBase58(),
        state: "minted"
      }
    ).eq("nft_id", nft_id)
      .eq("serial_no", serial_no)
      .single();

    return { mint: createNftOutput.mint.publicKey.toBase58() , success:true }

  }
  catch (err) {
    console.log("Caught an Error: ", err)
    // console.error(err)
    return {success:false, error: err}
  }

}


export async function updateMetadata(mint: string) {

  try {

    const keypair = await web3.Keypair.fromSecretKey(
      base58.decode(verifiedSolSvcKey)
    );
    const connection = new web3.Connection(
      env == "devnet" ? web3.clusterApiUrl("devnet") : env,
      "confirmed"
    );

    const metaplex = Metaplex.make(connection).use(keypairIdentity(keypair))
      .use(bundlrStorage(
        env.includes("dev") ?
          {
            address: 'https://devnet.bundlr.network',
            providerUrl: 'https://api.devnet.solana.com',
            timeout: 60000,
          } : undefined
      ));

    const nft = await metaplex.nfts().findByMint(new web3.PublicKey(mint))


    const { nft: nft_updated } = await metaplex.nfts().update(
      nft,
      {
        primarySaleHappened: true,
      }
    )

    const collectionMint = env.includes("dev") ? new web3.PublicKey("4qjeoA4TVBBWuQzUsfaCxn2vryQyixFyJ5jXqhFT9pjz")
      : new web3.PublicKey("4DJn2yqPiT9QZvM4t4RLv7XhhTs7mwKSCsBpGxyq25MV");

    const collectionMasterEdition = await findMasterEditionV2Pda(collectionMint);
    const collectionMetadata = await findMetadataPda(collectionMint);

    const metadataAccount = await findMetadataPda(new web3.PublicKey(mint));

    const signVerifyMetadata =
    {
      metadata: metadataAccount,
      collectionAuthority: keypair.publicKey, 
      payer: keypair.publicKey,            //new web3.PublicKey("CuJMiRLgcG35UwyM1a5ZGWHRYn1Q6vatHHqZFLsxVEVH"),
      updateAuthority: keypair.publicKey,    //new web3.PublicKey("CuJMiRLgcG35UwyM1a5ZGWHRYn1Q6vatHHqZFLsxVEVH"),
      collectionMint: collectionMint,                     //new web3.PublicKey("4qjeoA4TVBBWuQzUsfaCxn2vryQyixFyJ5jXqhFT9pjz"),
      collection: collectionMetadata,
      collectionMasterEditionAccount: collectionMasterEdition
    }

    const tx = createSetAndVerifyCollectionInstruction(signVerifyMetadata)

    const transaction = new web3.Transaction().add(
      tx,
    )

    const { signature } = await metaplex.rpc().sendAndConfirmTransaction(transaction)

    console.log(signature)

    await supabase.from("nft_owner").update(
      {
        state: "transferred"
      }
    ).eq("mint", mint)
      .single();

    return { signature: signature, success: true }
  }
  catch (err) {
    console.log('Caught a metadata Error:',err)
    return { success:false, error:err}
  }
}

export async function listNft(user_id: string, mint: string, price: number, currency: string, buy: boolean) {
  const serviceKeypair = await web3.Keypair.fromSecretKey(
    base58.decode(verifiedSolSvcKey)
  );

  const seller_private_key = (await getKeypair(user_id)) as web3.Keypair;

  const auctionHouse = AUCTION_HOUSE!;

  const ahSell = await sell(
    auctionHouse,
    serviceKeypair,
    mint,
    price,
    currency,
    buy,
    seller_private_key
  );

  if (ahSell.txid) {
    const order = await createOrder(
      mint,
      price,
      currency,
      buy,
      user_id,
      seller_private_key.publicKey.toBase58()
    );

    if (order !== null) {
      return { success: true, order };
    }
  }
  else return { success: false };
}

export async function topUpBundlr() {
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
  const bundlr = new Bundlr(
    "https://node1.bundlr.network",
    "solana",
    verifiedSolSvcKey
  );

  // Get your current balance
  let balance = await bundlr.getLoadedBalance();
  const price = await bundlr.utils.getPrice("solana", 10000);

  if (balance.toNumber() < 1000) {
    console.log("Top up")
    await bundlr.fund(new BigNumber(1e9))
    // 1 SOL
  }

  console.log(`Balance = ${balance}`)
  console.log(`Price = ${price}`)

  return


}