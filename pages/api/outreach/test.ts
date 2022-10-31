import type { NextApiRequest, NextApiResponse } from "next";
import sendMail, { sendAddressMail, sendAuctionMail, sendFanChallengeEmail, sendGenericDropPurchaseMail } from "./send-mail";

export default async function outreach(
    req: NextApiRequest,
    res: NextApiResponse
) {


    // const addresses = [
    //     "ryan.rossi@itsovertime.com",
    //     "cgroup6278@yahoo.com",
    //     "mbell107@gmail.com",
    //     "wkperry93@gmail.com",
    //     "pyattepressurewash@gmail.com"
    // ]

    // let count = 0
    // for (const address of addresses) {
    //     console.log(address)
    //     await sendAddressMail(address);
    //     count = count + 1
    // }

    // const result = await sendGenericDropPurchaseMail('348d305f-3156-44ec-98f6-5d052bea2aa8', 1, 150, 5, 'premium')

    const result = { nothing: "nothing" }
    // console.log(result)

    return res.status(200).json(result);

}
