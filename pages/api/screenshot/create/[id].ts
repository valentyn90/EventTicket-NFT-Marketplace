import { NextApiRequest, NextApiResponse } from "next";
const { chromium } = require('playwright');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = req.query.id as string;

  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`https://verifiedink.us/screenshot/${id}`, { waitUntil: 'networkidle' });
    const elementHandle = await page.$('.card-container');
    const data = await elementHandle.screenshot({ omitBackground: true });
    await browser.close();
    var base64data = "data:image/png;base64, " + Buffer.from(data).toString("base64");
    res.send(base64data);
  }
  catch (err) {
    console.log(err);
    res.status(400);
  }
}
