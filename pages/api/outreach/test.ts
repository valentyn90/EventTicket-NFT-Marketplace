import type { NextApiRequest, NextApiResponse } from "next";
import sendMail, { sendAuctionMail } from "./send-mail";

export default async function outreach(
    req: NextApiRequest,
    res: NextApiResponse
) {

    // const result = await sendAuctionMail("c0a957a5-3b1c-43d9-b0d4-8794b385e58c","1","350","2")

    const result = {nothing: "nothing"}
    console.log(result)

    return res.status(200).json(result);

}
