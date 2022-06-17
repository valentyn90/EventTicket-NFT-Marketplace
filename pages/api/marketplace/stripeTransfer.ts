import { cancel, cancelOrder, transferViaCreditCard } from "@/mint/marketplace";
import generateKeypair, { getKeypair } from "@/mint/mint";
import { supabase } from "@/supabase/supabase-admin";
import CreditCardSale from "@/types/CreditCardSale";
import * as web3 from "@solana/web3.js";
import base58 from "bs58";

import { NextApiRequest, NextApiResponse } from "next";

const verifiedSolSvcKey = process.env.VERIFIED_INK_SOL_SERVICE_KEY!;
const AUCTION_HOUSE = process.env.NEXT_PUBLIC_AUCTION_HOUSE;



export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    let { user_id } = req.body;

    console.log("user_id", user_id);

    // find any order that are not in "transferred", "pending", or "2b_payment_rejected" state
    const { data, error } = await supabase
        .from("credit_card_sale")
        .select("*")
        .eq("user_id", user_id)
        .not("status", "eq", "transferred")
        .not("status", "eq", "pending")
        .not("status", "eq", "2b_payment_rejected")

    // For each order

    data?.forEach(async (creditCardSale: CreditCardSale) => {
        const { data: orderData, error: orderError } = await supabase
            .from("order_book")
            .select("*")
            .match({ id: creditCardSale.order_book_id })

        let activeOrder = null;
        if (orderData && orderData.length > 0) {
            activeOrder = orderData[0];
        }

        console.log({ activeOrder });

        const actual_seller_keypair = (await getKeypair(
            activeOrder.user_id
        )) as web3.Keypair;
        const auctionHouse = AUCTION_HOUSE!;
        const svcKeypair = await web3.Keypair.fromSecretKey(
            base58.decode(verifiedSolSvcKey)
        );

        let userIdKey = "";

        // Check if user already has a key
        const { data: keyData, error: keyError } = await supabase
            .from("keys")
            .select("*")
            .eq("user_id", user_id)
            .single();

        if (!keyData) {
            // no key for userid, create one
            const { data } = await generateKeypair(user_id);
            if (data) {
                userIdKey = data.public_key;
            }
        } else {
            userIdKey = keyData.public_key;
        }

        if (creditCardSale.status === "2_payment_completed") {
            // Delist in DB
            const canceledOrder = await cancelOrder(
                activeOrder.mint,
                activeOrder.price,
                activeOrder.currency,
                activeOrder.buy,
                activeOrder.user_id,
                activeOrder.public_key
            );

            if (canceledOrder.error) {
                console.log({ error: "Error with storing cancel record in db", message: canceledOrder.error });
            }

            // Delist on chain

            try {

                const ahCancel = await cancel(
                    auctionHouse,
                    svcKeypair,
                    activeOrder.mint,
                    activeOrder.price,
                    activeOrder.currency,
                    activeOrder.buy,
                    actual_seller_keypair
                );

            }
            catch (err: any) {
                console.log({ error: "Error with delisting on chain", message: err });
            }

            finally {

                creditCardSale.status = "3_onchain_listing_cancelled";
                console.log(creditCardSale.status + " Updated")
                // order cancelled on chain
                await supabase
                    .from("credit_card_sale")
                    .update({
                        status: "3_onchain_listing_cancelled",
                    })
                    .match({ id: creditCardSale.id })
            }
        }


        if (creditCardSale.status === "3_onchain_listing_cancelled") {

            // Actually transfer the nft to the new owner
            console.log("Transferring nft to new owner");
            const sendToken = await transferViaCreditCard(
                creditCardSale.mint,
                activeOrder.price,
                activeOrder.currency,
                actual_seller_keypair,
                userIdKey,
                svcKeypair
            )

            if (sendToken.txId) {
                creditCardSale.status = "4_transferred_no_mail";
                // update nft_owner table with new owner
                await supabase
                    .from("nft_owner")
                    .update([
                        {
                            owner_id: user_id,
                        },
                    ])
                    .match({ mint: creditCardSale.mint });

                await supabase
                    .from("credit_card_sale")
                    .update({
                        status: "4_transferred_no_mail",
                    })
                    .match({ id: creditCardSale.id })
                    .single();
            }
        }

        if (creditCardSale.status === "4_transferred_no_mail") {
            // record sale in completed sale table
            const { data: sale, error: saleError } = await supabase
                .from("completed_sale")
                .insert([
                    {
                        price: (creditCardSale.price_usd * 0.01),
                        transaction: creditCardSale.stripe_tx,
                        mint: creditCardSale.mint,
                        currency: "USD",
                        buyer_public_key: userIdKey,
                        seller_public_key: activeOrder.public_key,
                    },
                ]);
            if (saleError) {
                console.log({ error: "Error with storing sale record in db", message: saleError });
            }
            await supabase
                .from("credit_card_sale")
                .update({
                    status: "transferred",
                })
                .match({ id: creditCardSale.id })
                .single();



            // Send success email to seller and buyer
            //    await sendPurchaseMail(
            //      eventObject.customer_email,
            //      eventObject.metadata.nft_id,
            //      eventObject.metadata.sn,
            //      eventObject.metadata.card_preview_image)

        }

        // Still need to send money to the correct address




    })


    return res.json(data)
}