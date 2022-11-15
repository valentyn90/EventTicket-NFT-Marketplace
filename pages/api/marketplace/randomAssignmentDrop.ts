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

    let { email, drop_id } = req.body;

    const user_id = await supabase.from('user_details').select('user_id').match({ email }).maybeSingle();
    console.log(user_id);

    if (user_id.data) {

        // Lookup in drop_credit_card_sales table
        const drop_credit_card_sale = await supabase.from('drop_credit_card_sale').select('*').match({ user_id: user_id.data.user_id, drop_id: drop_id, status: '2_payment_completed' });

        console.log(drop_credit_card_sale)
        if (drop_credit_card_sale.data && drop_credit_card_sale.data[0]) {
            await supabase
                .from("drop_credit_card_sale")
                .update({
                    status: "3_assigning_random_nfts",
                })
                .match({ stripe_tx: drop_credit_card_sale.data[0].stripe_tx })
                .single();

            const { data: drop } = await supabase.from('drop').select('*').match({ id: drop_id }).maybeSingle()

            // Need to pipe through premimum logic here
            const { data: remaining_standard_nfts, error: remaining_nfts_error } =
                await supabase.from('nft_owner').select('*').in('nft_id', drop.nfts).eq('owner_id', drop.athlete_id)
            const { data: remaining_premium_nfts } =
                await supabase.from('nft_owner').select('*').eq('nft_id', drop.premium_nft).eq('owner_id', drop.athlete_id)

            const remaining_nfts = drop_credit_card_sale.data[0].nft_type === "standard" ? remaining_standard_nfts : remaining_premium_nfts;


            if (remaining_nfts) {
                let transfer_nfts: any[] = [];

                for (let i = 0; i < drop_credit_card_sale.data[0].quantity; i++) {
                    while (transfer_nfts.length === i) {
                        //select random nft from remaining nfts
                        const random_nft = remaining_nfts[Math.floor(Math.random() * remaining_nfts.length)];
                        console.log(random_nft.id)
                        if (!transfer_nfts.includes(random_nft.id)) {
                            transfer_nfts.push(random_nft.id);
                        }
                    }
                }

                console.log(transfer_nfts);

                await supabase.from('nft_owner').update({ owner_id: user_id.data.user_id, state: "awaiting_transfer" }).in('id', transfer_nfts);

                // create new entries in drop_nfts table
                const order_id = drop_credit_card_sale.data[0].id;
                const drop_id = drop_credit_card_sale.data[0].drop_id;
                const status = "awating_shipment";

                const { data: nfts, error: nfts_error } = await supabase.from('nft_owner').select('nft_id, serial_no').in('id', transfer_nfts);

                let drop_nfts: Partial<any> = [];

                nfts?.map((nft) => {
                    drop_nfts.push({
                        order_id,
                        drop_id,
                        nft_id: nft.nft_id,
                        serial_no: nft.serial_no,
                        status,
                        opened: false,
                        user_id: user_id.data.user_id,
                    });
                })

                await supabase.from('drop_nfts').insert(drop_nfts);


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
