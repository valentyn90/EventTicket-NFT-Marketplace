import { supabase } from "@/supabase/supabase-client";
import { NextApiRequest, NextApiResponse } from "next";


export default async function getChallengeData(
    req: NextApiRequest,
    res: NextApiResponse
) {

    const {data: challenge_data} = await supabase.from('fan_challenge').select('*').match({id: req.query.fc_id}).single()

    if(challenge_data){
        const {data: teams, error} = await supabase.from('school')
        .select('*').in('id', challenge_data.teams)

        const {data} = await supabase.rpc('fc_leaderboard',{
            _teams: challenge_data.teams,
            _fc_id: challenge_data.id
        })

        const return_data = {
            ...challenge_data,
            leaderboard: data,
        }
        if(data){
            return res.status(200).json(return_data)
        }

    }

    return res.status(400).json({error: "No challenge found"})



}