import { NextApiRequest, NextApiResponse } from "next";

//temporary
import { eventTabs } from "@/components/Events/utils/tier";
import { supabase } from "@/supabase/supabase-admin";


const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY!);

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "POST") {
        try {
            const {
                email,
                user_id,
                quantity,
                event_id,
                ticket_type_id
            } = req.body;


            // Look up price from db (for not just looking up in config)
            const ticket_type = eventTabs.find((tab) => tab.id === ticket_type_id);
            const price = ticket_type?.price;

            if (price) {
                const stripePrice = (price * 100).toFixed(0)

                const product_id = ticket_type?.stripe_product;

                // Ensure tickets exist for that ticket type and reserve them

                const { data: tickets } = await supabase.from("event_ticket_owner")
                .select('*').is('on_hold', null)
                .eq('event_id',event_id)
                .is('owner_id',null)
                .eq('tier_id',ticket_type_id)
                .limit(quantity);

                if(tickets && tickets.length < quantity) {
                    return res.status(500).json({ error: "Not enough tickets available" });
                }

                

                // update the first "quantity" tickets by id to be on hold as of now
                const { data: updatedTickets, error } = await supabase.from("event_ticket_owner")
                .update({ on_hold: new Date() })
                .in('ticket_id',tickets!.map((ticket) => ticket.ticket_id))

                if(error) {
                    console.log(error)
                }
                
                
                console.log(updatedTickets)

                // Create Order in DB
                const { data: orderData, error: orderError } = await supabase
                    .from("event_credit_card_sale").insert(
                        [{
                            user_id,
                            email,
                            quantity,
                            price,
                            status: "pending",
                            event_id,
                            tier_id: ticket_type_id
                        }]
                    ).single();
               
                // Create Checkout Sessions from body params.
                const session = await stripe.checkout.sessions.create({
                    line_items: [
                        {
                            // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                            price_data: {
                                currency: "usd",
                                product: product_id,
                                unit_amount: stripePrice,
                            },
                            quantity: quantity,
                        },
                    ],
                    customer_email: email,
                    mode: "payment",
                    success_url: `${req.headers.origin}/events/${event_id}/success?session_id={CHECKOUT_SESSION_ID}&email=${email}&success=true&quantity=${quantity}&price=${price}&order_id=${orderData.id}`,
                    cancel_url: `${req.headers.origin}/events/${event_id}?&session_id={CHECKOUT_SESSION_ID}&canceled=true`,
                    metadata: {
                        event_id,
                        user_id,
                        tier_id: ticket_type_id 
                        //   card_preview_image: imageLink,
                        //   nft_type // standard or premium
                    }
                });

                const {data: updateOrderData, error: updateOrderError} = await supabase
                    .from("event_credit_card_sale")
                    .update({stripe_tx: session.id})
                    .match({id: orderData.id})

                console.log(updateOrderData || updateOrderError)

                
                // Associate tickets with order -- this does not mean the tickets are assigned to the user yet
                const { data: ticketOrderData, error: ticketOrderError } = await supabase
                    .from("event_order_ticket").insert(
                        updatedTickets!.map((ticket) => {
                            return {
                                ticket_id: ticket.ticket_id,
                                order_id: orderData.id
                            }
                        }))

                if (ticketOrderData) {
                    return res.status(200).json({ sessionUrl: session.url });
                }
                else if (orderError) {
                    res.status(500).json(orderError.message);
                }

            } else {
                res.status(500).json({ statusCode: 500, message: 'No price' });
            }


        }

        catch (error: any) {
            console.log(error);
            res.status(500).json({ statusCode: 500, message: error.message });
        }
    }
}