import { NextApiRequest, NextApiResponse } from "next";
import chromium from "chrome-aws-lambda";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = req.query.id as string;
  const serial_no = req.query.serial_no as string;

  let serial_string = serial_no === undefined ? "1" : serial_no;

  try {
    const browser = await chromium.puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });
    const page = await browser.newPage();
    await page.goto(
      `https://verifiedink.us/screenshot/${id}?serial_no=${serial_string}`,
      { waitUntil: "networkidle0" }
    );
    await page.waitForSelector(".background-img");
    const elementHandle = await page.$(".card-container");
    const data = await elementHandle?.screenshot({ omitBackground: true });

    await browser.close();
    if (data) {
      var base64data =
        "data:image/png;base64, " + Buffer.from(data).toString("base64");
      res.send(base64data);
    } else {
      res.status(400);
    }
  } catch (err) {
    console.log(err);
    res.status(400);
  }
}
