import { NextApiRequest, NextApiResponse } from "next";

export default async function create(
    req: NextApiRequest,
    res: NextApiResponse
  ) {

    const mkt = req.query.mkt
    const response1 = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd`)

    const data1 = await response1.json()

    const price = data1.solana.usd



    return res.status(200).json({result: {price: price}})

    const response = await fetch(
        `https://ftx.com/api/markets/${mkt}`
      )

    res.status(200).json(response.body);

  }