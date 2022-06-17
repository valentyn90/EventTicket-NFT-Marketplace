import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/supabase/supabase-admin";
import { updateMetadata } from "@/mint/mintNew";


export default async function mintInk(
    req: NextApiRequest,
    res: NextApiResponse
) {

    const { user } = await supabase.auth.api.getUserByCookie(req);
    if (!user) {
        return res.status(500).json({ error: "Not authenticated." });
    }

    const { mint } = req.body;

    const { data: nftOwnerData, error: nftOwnerError } = await supabase
        .from("nft_owner")
        .select("*")
        .eq("mint", mint)
        .maybeSingle();

    if (nftOwnerError || !nftOwnerData) {
        return res.status(500).json({ error: "Error finding nft owner." });
    }

    console.log(nftOwnerData.state)
    if (nftOwnerData.state === "minted") {

        const signature = await updateMetadata(mint)

        if (signature && signature.success) {
            return res.status(200).json({ "mint": mint });
        }
        else {
            return res.status(500).json({ error: "Error updating metadata." });
        }
    }
    else {
        return res.status(200).json({ "mint": mint });
    }

}