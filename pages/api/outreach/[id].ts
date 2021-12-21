import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../supabase/supabase-admin";
import sendMessage from "./send-dm";


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
        case "minted":
            //send minted message
            if (user_details.data.twitter !== "") {
                const twitter_handle = user_details.data.twitter;
                const referral_code = user_details.data.referral_code;
                const response = await sendMintedDM(twitter_handle, nft_id, referral_code);
                console.log(response);

                return res.status(200).json({ user_details });
            }

        case "abandoned":
        //send abandoned message to finish card


    }

    return res.status(500).json({ user_details });

    


}


async function sendMintedDM(twitter_handle: string, nft_id: string, referral_code: string) {

    // twitter_handle = "linsky"

    const message = `
Congratulations!

Your VerifiedInk has been minted. You can view and share your VerifiedInk here: https://verifiedink.us/card/${nft_id}

Now, you can grow your collection. Send your referral code to 5 other athletes and you automatically receive one \
of their inks. So refer the best players you know before someone else does. If you get 5 people to create Inks in \
the next 48 hours you will get 5 more referrals and a 1 of 1 founders drop.

Happy collection growing!
-Nate
    
You get 5 of these referrals. If you get all 5 to sign up in the next 48 hours you get 5 more. Once they’re gone, they’re \
gone - but this is a chance for 10 more cards in your collection that you can keep, trade, or sell. You can invite as many \
people as you want, but after 5 use your code, that’s it. They’ll have to join our waitlist.
`

    const message2 = `Your referral link is: https://verifiedink.us/create?referralCode=${referral_code}
Your referral code is: ${referral_code}`


    const result = await sendMessage(twitter_handle, message);

    const result2 = await sendMessage(twitter_handle, message2);

    return result;

}
