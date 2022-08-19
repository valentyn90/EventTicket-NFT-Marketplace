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

    // given an array of objects with a probability field, return an array with objects having that probability distribution
    const weightedArray = function (arr: any[]) {
        const weights = Array().concat(...arr.map((obj: any) => Array(Math.ceil(obj.probability * 100)).fill(obj)));
        return weights;
    }

    if (user_id.data) {

        // Lookup in drop_credit_card_sales table
        const fan_challenge_orders = await supabase.from('fan_challenge_orders')
            .select('*').match({ user_id: user_id.data.user_id, status: '2_payment_completed' });

        console.log(fan_challenge_orders)
        if (fan_challenge_orders.data && fan_challenge_orders.data[0]) {
            await supabase
                .from("fan_challenge_orders")
                .update({
                    status: "3_assigning_random_nfts",
                })
                .match({ stripe_tx: fan_challenge_orders.data[0].stripe_tx })
                .single();

            // Shortcut here for Naas, need to generalize using drop id  
            const { data: remaining_nfts, error: remaining_nfts_error } =
                await supabase.from('nft_owner').select('*').in('nft_id', [1160, 1161, 1162]).eq('owner_id', 'a5e225d1-4936-4523-8d21-85127d4b806e')

            const { data: fan_challenge } = await supabase.from('fan_challenge').select('*').match({ id: fan_challenge_orders.data[0].fc_id }).maybeSingle();

            if (fan_challenge) {
                const team_id = fan_challenge_orders.data[0].team_id;
                const nfts = fan_challenge.nfts;
                console.log(nfts);

                const weighted = weightedArray(nfts);
                const order_id = fan_challenge_orders.data[0].id;
                let assigned_nfts = [];


                for (let i = 0; i < fan_challenge_orders.data[0].quantity; i++) {
                    const nft = weighted[Math.floor(Math.random() * weighted.length)]
                    assigned_nfts.push({ fc_id: fan_challenge.id, user_id: user_id.data.user_id, nft_id: nft.nft_id, team_id: team_id, order_id });
                }

                console.table(assigned_nfts);

                const {data: fan_challenge_nfts} = await supabase.from('fan_challenge_nfts').insert(assigned_nfts);

                await supabase
                    .from("fan_challenge_orders")
                    .update({
                        status: "4_nfts_assigned",
                    })
                    .match({ stripe_tx: fan_challenge_orders.data[0].stripe_tx })
                    .single();

                return res.status(200).json({ message: "Assignment successful", assigned_nfts: assigned_nfts });



            }
            return res.status(200).json({ message: "No challenge found" });

        }
        else {
            return res.status(200).json({ message: "No completed credit card sale found" });
        }
    }

    return res.status(400).json({ error: "No user found" });

}
