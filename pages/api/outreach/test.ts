import type { NextApiRequest, NextApiResponse } from "next";
import sendMail, { sendAddressMail, sendAuctionMail } from "./send-mail";

export default async function outreach(
    req: NextApiRequest,
    res: NextApiResponse
) {


    // const addresses = [
    //     "aaronhlevitan@gmail.com",
    // ]

    // let count = 0
    // for (const address of addresses) {
    //     console.log(address)
    //     await sendAddressMail(address);
    //     count = count + 1
    // }

    // const result = await sendAddressMail("nathan.slutzky@gmail.com")

    const result = {nothing: "nothing"}
    // console.log(result)

    return res.status(200).json( result );

}
