import { transferViaCreditCard } from "@/mint/marketplace";
import generateKeypair, { getKeypair } from "@/mint/mint";
import { sleep } from "@/mint/utils/various";
import { supabase } from "@/supabase/supabase-admin";
import * as web3 from "@solana/web3.js";
import base58 from "bs58";

import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    let { email } = req.body;

    const user_id = await supabase.from('user_details').select('user_id').match({ email }).maybeSingle();
    console.log(user_id);

    if (user_id.data) {

        // Lookup in drop_credit_card_sales table
        const drop_credit_card_sale = await supabase.from('drop_credit_card_sale').select('*').match({ user_id: user_id.data.user_id, status: '2_payment_completed' });

        console.log(drop_credit_card_sale)
        if (drop_credit_card_sale.data && drop_credit_card_sale.data[0]) {
            await supabase
                .from("drop_credit_card_sale")
                .update({
                    status: "3_assigning_random_nfts",
                })
                .match({ stripe_tx: drop_credit_card_sale.data[0].stripe_tx })
                .single();

            // Shortcut here for Naas, need to generalize using drop id  
            const { data: remaining_nfts, error: remaining_nfts_error } =
                await supabase.from('nft_owner').select('*').in('nft_id', [1160, 1161, 1162]).eq('owner_id', 'a5e225d1-4936-4523-8d21-85127d4b806e')

            if (remaining_nfts) {
                let transfer_nfts = [];

                for (let i = 0; i < drop_credit_card_sale.data[0].quantity; i++) {
                    //select random nft from remaining nfts
                    const random_nft = remaining_nfts[Math.floor(Math.random() * remaining_nfts.length)];
                    transfer_nfts.push(random_nft.id);
                }

                console.log(transfer_nfts);

                await supabase.from('nft_owner').update({ owner_id: user_id.data.user_id, state: "awaiting_transfer" }).in('id', transfer_nfts);

                await supabase
                    .from("drop_credit_card_sale")
                    .update({
                        status: "4_nfts_assigned",
                    })
                    .match({ stripe_tx: drop_credit_card_sale.data[0].stripe_tx })
                    .single();

                return res.status(200).json({ message: "transfer successful", transfer_nfts: transfer_nfts });
            }



        }
        else {
            return res.status(200).json({ message: "No completed credit card sale found" });
        }
    }

    return res.status(400).json({ error: "No user found" });

}
