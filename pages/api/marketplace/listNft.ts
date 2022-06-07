import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/supabase/supabase-admin";
import { listNft, updateMetadata } from "@/mint/mintNew";


export default async function listNftAPI(
    req: NextApiRequest,
    res: NextApiResponse
) {

    const { user } = await supabase.auth.api.getUserByCookie(req);
    if (!user) {
        return res.status(500).json({ error: "Not authenticated." });
    }

    const { mint, price, currency, buy } = req.body;

    const { data: nftOwnerData, error: nftOwnerError } = await supabase
        .from("nft_owner")
        .select("*")
        .eq("mint", mint)
        .maybeSingle();

    if (nftOwnerError || !nftOwnerData) {
        return res.status(500).json({ error: "Error finding nft owner." });
    }


    // Check to ensure owner is the same as the user calling the API
    if (nftOwnerData.owner_id !== user.id) {
        return res.status(500).json({ error: "User is not the owner of this NFT." });
    }


    if (nftOwnerData.state === "transferred") {

        const signature = await listNft(nftOwnerData.owner_id, mint, price, currency, buy)

        if (signature && signature.success) {
            return res.status(200).json({ "success": true, "order": signature.order });
        }
        else {
            return res.status(500).json({ error: "Error placing order." });
        }
    }
    else {
        return res.status(500).json({error: "Error placing order. NFT is not available for sale." });
    }

}