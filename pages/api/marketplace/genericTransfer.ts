import { cancel, cancelOrder, transferViaCreditCard } from "@/mint/marketplace";
import generateKeypair, { getKeypair } from "@/mint/mint";
import { sleep } from "@/mint/utils/various";
import { supabase } from "@/supabase/supabase-admin";
import CreditCardSale from "@/types/CreditCardSale";
import * as web3 from "@solana/web3.js";
import base58 from "bs58";

import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    const { user } = await supabase.auth.api.getUserByCookie(req);
    let { from_user_id, to_user_id, mint, to_user_publicKey } = req.body;
    let authorized = false;

    // Uncomment to activate
    // if(user){

    //     const { data: admin_data, error: admin_error} = await supabase.from('user_details').select('role').match({user_id: user.id}).maybeSingle();

    //     if(admin_data && admin_data.role === 'admin'){
    //         authorized = true;
    //     }
    //     else
    //     {
    //        return res.status(500).json({error: "Not authorized"});
            
    //     }
    // }
    // else {
    //     return res.status(500).json({error: "Not logged in"});
        
    // }


    if (authorized) {
        const verifiedSolSvcKey = process.env.VERIFIED_INK_SOL_SERVICE_KEY!;
        const svcKeypair = await web3.Keypair.fromSecretKey(
            base58.decode(verifiedSolSvcKey)
        );

        console.log("Attempting to transfer nft to new owner");

        const from_keypair = (await getKeypair(from_user_id)) as web3.Keypair;
        console.log("got from_keypair");


        let to_keypair, to_publicKey
        if (to_user_publicKey) {
            to_publicKey = to_user_publicKey;
        } 
        else {
            try {
                to_keypair = (await getKeypair(to_user_id)) as web3.Keypair;
                to_publicKey = to_keypair.publicKey.toBase58();
                console.log("got to_keypair");
            }
            catch (e: any) {
                const { data } = await generateKeypair(to_user_id);
                if (data) {
                    to_publicKey = data.public_key
                }
            }
        }

        if (to_publicKey) {
            const sendToken = await transferViaCreditCard(
                mint,
                0,
                "USD",
                from_keypair,
                to_publicKey,
                svcKeypair
            )

            console.log(sendToken)
            if (sendToken.txId) {
                console.log("successfull")

                await supabase
                    .from("nft_owner")
                    .update([
                        {
                            owner_id: to_user_id,
                        },
                    ])
                    .match({ mint: mint });

                return res.status(200).json({ success: true, txId: sendToken.txId });


            }
            else {
                return res.status(200).json({ success: false, error: "Failed to transfer" });
            }
        } else {
            return res.status(200).json({ success: false, error: "Error generating public key for recipient" });
        }

    }
    
    return res.status(400).json({ error: "Not authorized" });

}
