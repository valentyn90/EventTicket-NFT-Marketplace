import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/supabase/supabase-admin";
import { mintAndTransferNFT } from "@/mint/mintNew";

export default async function mintInk(
    req: NextApiRequest,
    res: NextApiResponse
) {

    const { user } = await supabase.auth.api.getUserByCookie(req);
    if (!user) {
        return res.status(500).json({ error: "Not authenticated." });
    }

    const { serial_no, nft_id } = req.body;

    const { data: nftOwnerData, error: nftOwnerError } = await supabase
        .from("nft_owner")
        .select("*")
        .eq("nft_id", nft_id)
        .eq("serial_no", serial_no)
        .eq("owner_id", user.id)
        .maybeSingle();

    if (nftOwnerError || !nftOwnerData) {
        return res.status(500).json({ error: "Error finding nft owner." });
    }

    const mint = await mintAndTransferNFT(nft_id, serial_no)

    if(mint && mint.success){
        return res.status(200).json({"mint": mint});
    }
    else {
        return res.status(500).json({mint})
    }
    
}