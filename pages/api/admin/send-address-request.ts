import { supabase } from "@/supabase/supabase-admin";
import { push } from "mixpanel-browser";
import type { NextApiRequest, NextApiResponse } from "next";
import { IoConstructOutline } from "react-icons/io5";
import { sendAddressMail } from "../outreach/send-mail";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {



    let all_emails: string[] = [];
    let emails_to_send: string[] = [];

    // Look up all orders that don't have an address
    // AR
    const { data: ar_orders } = await supabase.from('ar_credit_card_sale')
        .select('ship_to_email, email')
        .is('shipped', null)
        .eq('status', '2_payment_completed')


    if (ar_orders) {
        const emails = ar_orders.map((order) => {
            if (order.ship_to_email && order.ship_to_email !== '') {
                return order.ship_to_email
            } else {
                return order.email
            }
        })

        all_emails.push(...emails)

        // const {data: already_have_contact} =  await supabase.from('contact')
        // .select('email')
        // .in('email', emails)

        // if(already_have_contact && already_have_contact.length > 0){
        //     // remove those already_have_contact entries from the emails list
        //     const already_have_contact_emails = already_have_contact.map((contact) => contact.email)
        //     const filtered_emails = emails.filter((email) => !already_have_contact_emails.includes(email))
        //     all_emails.push(...filtered_emails)
        // }
        // else {
        //     all_emails.push(...emails)
        // }
    }

    // Drops
    const { data: drop_orders } = await supabase.from('drop_credit_card_sale')
        .select('user_details(email)')
        .is('shipped', null)
        .eq('status', '4_nfts_assigned')

    if (drop_orders) {
        const emails = drop_orders.map((order) => order.user_details.email)
        all_emails.push(...emails)
    }

    // Fan Challenges
    const { data: fan_challenge_orders, error } = await supabase.from('fan_challenge_orders')
        .select('user_details(email)')
        .is('shipped', null)
        .eq('status', '4_nfts_assigned')

    if (fan_challenge_orders) {
        const emails = fan_challenge_orders.map((order) => order.user_details.email)
        all_emails.push(...emails)
    }



    // Remove emails if we already have contact info

    const { data: already_have_contact } = await supabase.from('contact')
        .select('email')
        .in('email', all_emails)

    if (already_have_contact && already_have_contact.length > 0) {
        // remove those already_have_contact entries from the emails list
        const already_have_contact_emails = already_have_contact.map((contact) => contact.email)
        const filtered_emails = all_emails.filter((email) => !already_have_contact_emails.includes(email))
        emails_to_send.push(...filtered_emails)
    }
    else {
        emails_to_send.push(...all_emails)
    }

    // remove duplicates from emails_to_send
    emails_to_send = [...new Set(emails_to_send)]

    // Remove any orders that have already been requested 3 times

    const { data: already_requested } = await supabase.from('contact_requests')
        .select('email')
        .in('email', emails_to_send)

    // get a count of how many times each email has been requested
    if (already_requested && already_requested.length > 0) {
        const email_counts = already_requested.reduce((acc, curr) => {
            if (acc[curr.email]) {
                acc[curr.email] = acc[curr.email] + 1
            } else {
                acc[curr.email] = 1
            }
            return acc
        }, {})

        // provide a list of emails that have been requested 2 times
        const emails_to_remove = Object.keys(email_counts).filter((email) => email_counts[email] >= 3)

        // remove those emails from the emails_to_send list
        emails_to_send = emails_to_send.filter((email) => !emails_to_remove.includes(email))
    }

    // Record the emails that we are sending requests to
    const { data: record_requests } = await supabase.from('contact_requests')
        .insert(emails_to_send.map((email) => {
            return {
                email: email,
            }
        }))


    // Send email to the remaining orders
    // for (const email of emails_to_send) {
    //     await sendAddressMail(email);
    // }
  
    return res.status(200).json(emails_to_send)


}