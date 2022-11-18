import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../supabase/supabase-admin";
import sendMessage from "./send-dm";
import sendMail from "./send-mail";


export default async function outreach(
    req: NextApiRequest,
    res: NextApiResponse
) {

    const nft_id = req.query.id as string

    //retreive user's twitter handle + email from supabase
    const user_id = await supabase.from("nft").select("user_id").eq("id", req.query.id).maybeSingle();
    const user_details = await supabase.from("user_details").select("*").eq("user_id", user_id.data.user_id).maybeSingle();

    //pull message type from query string
    const message_type = req.query.message_type as string;

    switch (message_type) {
        // Add created version
        case "created":
            //send created message
            if (user_details.data.twitter !== "") {
                const twitter_handle = user_details.data.twitter;
                const referral_code = user_details.data.referral_code;
                const response = await sendCreatedDM(twitter_handle, nft_id, referral_code);
            }
            if (user_details.data.email !== "") {
                const email_response = await sendMail(parseInt(nft_id), "created");
            }
            return res.status(200).json({ "message": "Sent Created Messages" });

        case "abandoned":
            // send abandoned message to finish card
            if (user_details.data.twitter !== "") {
                const twitter_handle = user_details.data.twitter;
                const response = await sendAbandonedDM(twitter_handle, nft_id);
            }
            if (user_details.data.email !== "") {
                const email_response = await sendMail(parseInt(nft_id), "abandoned");
            }
            const nudge_record = await supabase.from("admin_actions").insert({ nft_id, type: "nudge"})
            return res.status(200).json({ "message": "Sent Abandoned Messages" });

        case "changes_required":
            if (user_details.data.twitter !== "") {
                const twitter_handle = user_details.data.twitter;
                const response = await sendChangesRequiredDM(twitter_handle, nft_id);
            }
            if (user_details.data.email !== "") {
                const email_response = await sendMail(parseInt(nft_id), "changes_required");
            }
            const feedback_record = await supabase.from("admin_actions").insert({ nft_id, type: "feedback"})
            return res.status(200).json({ "message": "Sent Changes Required Messages" });
        
        case "minted":
            if (user_details.data.twitter !== "") {
                const twitter_handle = user_details.data.twitter;
                const referral_code = user_details.data.referral_code;
                const response = await sendMintedDM(twitter_handle, nft_id, referral_code);
            }
            if (user_details.data.email !== "") {
                const email_response = await sendMail(parseInt(nft_id), "minted");
            }
            return res.status(200).json({ "message": "Sent Mint Messages" });




    }

    return res.status(500).json({ "message": "Something went wrong" });



}


async function sendCreatedDM(twitter_handle: string, nft_id: string, referral_code: string) {

    // twitter_handle = "linsky"

    const message = `
Congratulations!

You just created your NFT on VerifiedInk! Your Ink will be verified and minted in the next few days, \
but you can view and share it here: https://verifiedink.us/card/${nft_id}

Now, grow your collection! 

Your referral link is: https://verifiedink.us/create?referralCode=${referral_code}

Send your referral code to 5 other athletes and you automatically receive one of their inks. \
So, refer the best players you know before someone else does. If you get 5 people to create Inks \
in the next 48 hours you will get 5 more referrals and a 1 of 1 Founder's drop. So don’t wait!

Happy collection growing!
-Nate
`

    const message2 = `https://verifiedink.us/create?referralCode=${referral_code}`


    const result2 = await sendMessage(twitter_handle, message2);
    const result = await sendMessage(twitter_handle, message);

    

    return result;

}

async function sendMintedDM(twitter_handle: string, nft_id: string, referral_code: string) {
    const message = `
Congratulations!

Your VerifiedInk has been verified and minted! The Marketplace is now in preview. \
If you are a class of 22 grad, you can list your VerifiedInk for sale here:
https://verifiedink.us/collection

Your referral link is: https://verifiedink.us/create?referralCode=${referral_code}
Your referral code is: ${referral_code}
`

    const result = await sendMessage(twitter_handle, message);
    return result

}

async function sendAbandonedDM(twitter_handle: string, nft_id: string) {
    const message = `Don't quit now, you're so close! In just a few minutes you could be profiting off \
your years of hard work and talent. Finish your VerifiedInk using the link above ^ https://verifiedink.us/create`

    const result = await sendMessage(twitter_handle, message);

    return result
}

async function sendChangesRequiredDM(twitter_handle: string, nft_id: string) {
    const message = `We've reviewed your VerifiedInk and found some changes that need to be made before it's minted. Please \
visit https://verifiedink.us/create to make the requested changes.`

    const result = await sendMessage(twitter_handle, message);

    return result
}
