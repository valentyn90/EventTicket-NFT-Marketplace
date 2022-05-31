import { supabase } from "@/supabase/supabase-admin";
import { NextApiRequest, NextApiResponse } from "next";

export default async function mint(
    req: NextApiRequest,
    res: NextApiResponse
) {

    const { user } = await supabase.auth.api.getUserByCookie(req);

    if (!user) {
        return res.status(500).json({ error: "Not authenticated." });
    }

    const ar_id = req.query.ar_id;
    const nft_id = req.query.nft_id;

    const { data, error } = await supabase.from("ar_mapping").select("*").eq("ar_id", ar_id).maybeSingle();
    console.log(data)
    if (!data) {
        // Not associated yet
        const { data, error } = await supabase.from("ar_mapping").insert({
            ar_id: ar_id,
            nft_id: nft_id
        })
        if (error) {
            return res.status(500).json({ error: "Error inserting data." });
        }
        return res.status(200).json({ data: "Success" });
    }
    else {
        return res.status(500).json({ error: "AR already associated" });
    }


}