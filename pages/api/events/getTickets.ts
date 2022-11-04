// Next API route to return tickets for a given event owned by a given user

import { supabase } from "@/supabase/supabase-admin";
import { NextApiRequest, NextApiResponse } from "next";
import events from "@/components/Events/events.json";
import { eventTabs } from "@/components/Events/utils/tier"


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    const { event_id } = req.query;

    // get user from supabase auth cookie

    const { user } = await supabase.auth.api.getUserByCookie(req);
    if (!user) {
        return res.status(500).json({ error: "Not authenticated." });
    }

    const { data: tickets, error } = await supabase
        .from("event_ticket_owner")
        .select(`*`)
        .eq('event_id', event_id)
        .eq('owner_id', user.id)

        const ticketsWithTier = tickets!.map((ticket: any) => {
            const tier = eventTabs.find((tab) => tab.id === ticket.tier_id)
            return { ...ticket, tier }
        })
    
    const tickets_all_data = ticketsWithTier.map((ticket: any) => {
        return { ...ticket, event: events[0] }
    })

    // console.log(tickets_all_data)

    res.status(200).json(tickets_all_data)

    // get tickets from supabase
    // const {data: tickets_data, error} = await supabase
    //     .from("tickets")
    //     .select("*")
    //     .eq("event_id", event_id)
    //     .eq("owner", user.id)

    const tickets_data = [
        {
            "ticket_id": "1",
            "event": {
                "event_id": "1",
                "name": "Battleground 2K22",
                "description": "Event 1 description",
                "image": "https://picsum.photos/200/300",
                "date": "2022-12-03",
                "time": "18:00",
                "venue": "Dickie's Arena",
                "city": "Fort Worth",
                "state": "TX",
            },
            "owner": "1",
            "section": "100",
            "row": "A",
            "seat": "9",
        },
        {
            "ticket_id": "2",
            "event": {
                "event_id": "1",
                "name": "Battleground 2K22",
                "description": "Event 1 description",
                "image": "https://picsum.photos/200/300",
                "date": "2022-12-03",
                "time": "18:00",
                "venue": "Dickie's Arena",
                "city": "Fort Worth",
                "state": "TX",
            },
            "owner": "1",
            "section": "100",
            "row": "A",
            "seat": "10",
        }
        ,
        {
            "ticket_id": "3",
            "event": {
                "event_id": "1",
                "name": "Battleground 2K22",
                "description": "Event 1 description",
                "image": "https://picsum.photos/200/300",
                "date": "2022-12-03",
                "time": "18:00",
                "venue": "Dickie's Arena",
                "city": "Fort Worth",
                "state": "TX",
            },
            "owner": "1",
            "section": "100",
            "row": "A",
            "seat": "11",
        }

    ]

    // return tickets
    res.status(200).json(tickets_data)

}