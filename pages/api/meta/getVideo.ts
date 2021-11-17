import type { NextApiRequest, NextApiResponse } from "next";
import cheerio from "cheerio";

export default async function assetHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const response = await fetch(req.body.hudlUrl);
    const html = await response.text();

    const $ = cheerio.load(html);

    const videoUrl = $('meta[property="og:video:url"]').attr("content");

    res.status(200).json({ videoUrl });
  } catch (err) {
    console.log(err);
    res.status(500);
  }
}
