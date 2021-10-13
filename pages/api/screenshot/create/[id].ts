import { NextApiRequest, NextApiResponse } from "next";
const FormData = require("form-data");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = req.query.id as string;
  // const test_url = `https://verifiedink.us/card/${id}`;
  const verifiedink_url = `https://verifiedink.us/screenshot/${id}&width=800&height=1200&output=image&file_type=png&omit_background=true&wait_for_event=load&selector=.card-container`;
  const query_url = `https://shot.screenshotapi.net/screenshot?token=${process.env.NEXT_PUBLIC_SCREENSHOT_API_TOKEN}&url=${verifiedink_url}`;
  try {
    const fetch_res = await fetch(query_url);
    const data = await fetch_res.json();
    res.status(200).json({ data });
    return true;
  } catch (err) {
    console.log(err);
    res.status(400);
  }
}
