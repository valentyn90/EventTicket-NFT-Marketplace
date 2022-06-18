import { transferViaCreditCard } from "@/mint/marketplace";
import createKeypair, { generateKeypair, getKeypair, NFTMintMaster, removeCollection, updateMetadata, uploadImageToArweave, uploadMetadataToArweave } from "@/mint/mint";
import { topUpBundlr } from "@/mint/mintNew";
import { generateMetadata } from "@/mint/utils/metadata";
import { web3 } from "@project-serum/anchor";
import { Keypair } from "@solana/web3.js";
import base58 from "bs58";
import { NextApiRequest, NextApiResponse } from "next";


export default async function mint(
    req: NextApiRequest,
    res: NextApiResponse
) {

    // const stuff = (await getKeypair('2654c2d2-ebad-4fd4-8ff0-d9545b83ee37') as web3.Keypair).secretKey.toString()

    // const stuff = await generateKeypair('2654c2d2-ebad-4fd4-8ff0-d9545b83ee37');
    // const stuff = (await getKeypair('e9e6deb9-b873-4c14-a521-de382afe0267') as Keypair).secretKey.toString();

    // const stuff = await uploadImageToArweave(142, 3);

    // OLD METADATA FUNCTION
    // const stuff = await updateMetadata(new web3.PublicKey("3JCjNiQss6K4dW2dGTmA4R6sJEa1Z7dDXp3AaaaT4aGs"));

    // const stuff = await removeCollection();

    // const stuff = await uploadImageToArweave(142)

    // const stuff = await uploadMetadataToArweave(96);

    // const start_time = Date.now();
    // console.log(`Start: ${start_time}`)

    // const verifiedSolSvcKey = process.env.VERIFIED_INK_SOL_SERVICE_KEY!;
    // const svc_keypair = await web3.Keypair.fromSecretKey(
    //     base58.decode(verifiedSolSvcKey)
    //   );
    // const seller_keypair = await getKeypair('348d305f-3156-44ec-98f6-5d052bea2aa8') as web3.Keypair

    // const stuff = await transferViaCreditCard(
    //     "5zJ2SJXi7tfhCsyRZVHeeNrzjH2qCSA2fzui4Y1qH5qF",
    //     4.44,
    //     "USD",
    //     seller_keypair,
    //     "DBfQBErRFtsuQZkae8tEFaoruRANyiVM6aPs2zuzsx3C", // VFD Treasury
    //     svc_keypair
    // )
    // const j = await  topUpBundlr()

    const stuff = {nothing: "here"};
    // const end_time = Date.now();
    // console.log(`End: ${end_time}`)
    // console.log(`Total: ${(end_time - start_time)/1000}`)

    return res.status(200).json(stuff);
}