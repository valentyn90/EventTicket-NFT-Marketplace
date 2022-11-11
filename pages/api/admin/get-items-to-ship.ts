import { supabase } from "@/supabase/supabase-admin";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    // get item from query string
    const { item } = req.query;

    console.log(item)

    const { data: contacts } = await supabase.from('contact').select('*')

    let order_table = 'drop_credit_card_sale'
    let nft_table = 'drop_nfts'

    if (item == "ar") {

        // {
        //     "id": 29,
        //     "created_at": "2022-10-26T03:42:59+00:00",
        //     "user_id": null,
        //     "nft_id": null,
        //     "email": "aaron.linsky+pp@gmail.com",
        //     "quantity": 1,
        //     "total_cost": 19.99,
        //     "stripe_tx": "cs_live_b1sFSkqnjq1U3zrYA4bx3gPHvtG7pKRDXOXJhyd5o7JNPT4Oxd8ULj9J6O",
        //     "tx_status": "pending",
        //     "shipped": null,
        //     "status": "2_payment_completed",
        //     "ship_to_email": null
        //   }


        const { data: unshipped_orders, error } = await supabase.from('ar_credit_card_sale')
            .select('*')
            .is('shipped', null)
            .eq('status', '2_payment_completed')
            .order('id', { ascending: true })

        if (unshipped_orders && contacts) {
            const unshipped_orders_with_contact = unshipped_orders.filter(order => {
                return contacts.some(contact => contact.email === (order.ship_to_email || order.email))
            })
            const unshipped_orders_with_contact_info = unshipped_orders_with_contact.map(order => {
                const contact = contacts.find(contact => contact.email === (order.ship_to_email || order.email))
                return { ...order, contact }
            })

            let nfts: any[] = []

            unshipped_orders_with_contact.map(
                order => {
                    const order_nft =
                    {
                        nft_id: order.nft_id,
                        ar_id: null,
                        serial_no: null,
                        order_id: order.id,
                    }
                    // insert 3 nfts for each order
                    for (let i = 0; i < order.quantity; i++) {
                        nfts.push(order_nft)
                    }
                }
            )
            
            const full_data = unshipped_orders_with_contact_info.map(order => {
                const order_nfts = nfts!.filter(nft => nft.order_id === order.id)
                return { ...order, order_nfts }
            })


            return res.status(200).json({ full_data })
        }

    }
    else {

        if (item == 'challenge') {
            order_table = 'fan_challenge_orders'
            nft_table = 'fan_challenge_nfts'
        }

        const { data: unshipped_orders, error } = await supabase.from(order_table)
            .select('*, user_details(email)')
            .is('shipped', null)
            .eq('status', '4_nfts_assigned')
            .order('id', { ascending: true })

        if (unshipped_orders && contacts) {
            //filter unshipped_orders to only those that have a contact
            const unshipped_orders_with_contact = unshipped_orders.filter(order => {
                return contacts.some(contact => contact.email === order.user_details.email)
            })

            // add contact info to unshipped_orders
            const unshipped_orders_with_contact_info = unshipped_orders_with_contact.map(order => {
                const contact = contacts.find(contact => contact.email === order.user_details.email)
                return { ...order, contact }
            })

            // add specific nfts to unshipped_orders

            const { data: nfts, error } = await supabase.from(nft_table).select('*')
                .in('order_id', unshipped_orders_with_contact_info.map(order => order.id))

            const full_data = unshipped_orders_with_contact_info.map(order => {
                const order_nfts = nfts!.filter(nft => nft.order_id === order.id)
                return { ...order, order_nfts }
            })

            console.log(full_data[0])
            return res.status(200).json({ full_data })
        }
    }


    return res.status(200).json({ success: false });



}