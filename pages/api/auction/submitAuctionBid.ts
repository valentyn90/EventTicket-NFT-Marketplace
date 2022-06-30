import { NextApiRequest, NextApiResponse } from "next";


export default async function getAuctionData(
    req: NextApiRequest,
    res: NextApiResponse
) {

    const data = {

    }

    return res.status(200).json(data);
}

