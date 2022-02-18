import { createOrder, sell } from "@/mint/marketplace";
import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/supabase/supabase-admin";
import { getKeypair, NFTMintMaster } from "@/mint/mint";
import { web3 } from "@project-serum/anchor";
import base58 from "bs58";
import NftOwner from "@/types/NftOwner";

const verifiedSolSvcKey = process.env.VERIFIED_INK_SOL_SERVICE_KEY!;
const AUCTION_HOUSE = process.env.NEXT_PUBLIC_AUCTION_HOUSE;

export default async function create(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { user } = await supabase.auth.api.getUserByCookie(req);

  if (!user) {
    return res.status(500).json({ error: "Not authenticated." });
  }

  const { serial_no, nft_id, price, currency, buy } = req.body;

  if (price <= 0) {
    return res.status(500).json({ error: "Price is not valid." });
  }

  // check if user owns selling nft
  // nft_owner -> serial_no + nft_id = user.id

  // serial_no
  // nft_id
  // price
  // currency
  // buy (or sell)

  // Check if NFT is minted and mint if not

  const { data: nftOwnerData, error: nftOwnerError } = await supabase
    .from("nft_owner")
    .select("*")
    .eq("nft_id", nft_id)
    .eq("serial_no", serial_no)
    .maybeSingle();

  if (nftOwnerError || !nftOwnerData) {
    return res.status(500).json({ error: "Error finding nft owner." });
  }

  // Check if user owns selling nft.

  if (nftOwnerData.owner_id !== user.id) {
    return res.status(500).json({ error: "Not nft owner." });
  }

  // sellInk(nftOwnerData, nft_id, serial_no, price, currency, buy, user.id);
  let mint = "";
  // Check if NFT card is minted
  if (nftOwnerData.mint) {
    mint = nftOwnerData.mint;
  } else {
    // not minted, mint it
    const mintCall = await NFTMintMaster(nft_id, serial_no);

    if (mintCall.mint) {
      mint = mintCall.mint;
    }
  }

  if (mint !== "" && mint !== null) {
    // get user's public key
    const { data: keyData, error: keyError } = await supabase
      .from("keys")
      .select("public_key")
      .eq("user_id", user.id)
      .single();

    if (keyData) {
      const serviceKeypair = await web3.Keypair.fromSecretKey(
        base58.decode(verifiedSolSvcKey)
      );

      const seller_private_key = (await getKeypair(user.id)) as web3.Keypair;

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
          user.id,
          keyData.public_key
        );

        console.log({ order });

        if (order !== null) {
          return res.status(200).json({ success: true, order });
        }
      } else {
        // Order Failed, should send back to frontend
        return res.status(500).json({ error: "Error creating error." });
      }

      console.log({ ahSell });
    }
  }

  return res.status(500).json({ error: "There was an error." });
}
