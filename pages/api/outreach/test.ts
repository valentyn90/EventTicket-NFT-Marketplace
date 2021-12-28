import type { NextApiRequest, NextApiResponse } from "next";
import sendMail from "./send-mail";

export default async function outreach(
    req: NextApiRequest,
    res: NextApiResponse
) {

    const result = await sendMail()

    console.log(result)

    return res.status(200).json(result);

}
