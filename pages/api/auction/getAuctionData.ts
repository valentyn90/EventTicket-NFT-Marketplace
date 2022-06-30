import { supabase } from "@/supabase/supabase-client";
import { data } from "cheerio/lib/api/attributes";
import { NextApiRequest, NextApiResponse } from "next";


export default async function getAuctionData(
    req: NextApiRequest,
    res: NextApiResponse
) {

    const {data: data_auction, error} = await supabase.from('auction')
        .select(`
            id,
            user_details (user_name),
            description,
            headline,
            items,
            teams,
            min_bid,
            min_increment,
            start_time,
            end_time
        `).eq('id', req.query.auction_id).single()

    if(data_auction){
        const {data: teams, error} = await supabase.from('school')
        .select('*').in('id', data_auction.teams)

        const {data: items, error: items_error} = await supabase.from('nft_owner')
        .select('*').in('id', data_auction.items)

        const {data: active_bids, error: active_bids_error} = await supabase.from('auction_bids')
        .select('bid_id, bid_amount, bid_team_id, auction_id, user_id, status')
        .eq('auction_id', data_auction.id)
        .eq('status', 'confirmed')
        .order('bid_amount', {ascending: false})
        .limit(data_auction.items.length || 1)
    
    const data = {
        "auction_id": data_auction.id,
        "athlete_name": data_auction.user_details.user_name,
        "description": data_auction.description,
        "headline": data_auction.headline,
        "items": items,
        "auction_teams": teams,
        "active_bids": active_bids,
        "min_bid": data_auction.min_bid,
        "min_increment": data_auction.min_increment,
        "start_time": data_auction.start_time,
        "end_time": data_auction.end_time,
    }


    return res.status(200).json(data);
    }
}

