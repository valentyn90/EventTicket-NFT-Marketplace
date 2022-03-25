import { NextApiRequest, NextApiResponse } from "next";

export default async function create(
    req: NextApiRequest,
    res: NextApiResponse
  ) {

    const mkt = req.query.mkt

    const response = await fetch(
        `https://ftx.com/api/markets/${mkt}`
      )

    res.status(200).json(response.body);

  }