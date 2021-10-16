import { NextApiRequest, NextApiResponse } from "next";
const FormData = require("form-data");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = req.query.id as string;
  const width = 800;
  const height = 1200;
  const output = "image"; // image = res.blob, json = res.json
  const file_type = "png";
  const omit_background = "true";
  const wait_for_event = "load";
  const selector = ".card-container";
  const fresh = "true";

  const query = `&width=${width}&height=${height}&output=${output}&file_type=${file_type}&omit_background=${omit_background}&wait_for_event=${wait_for_event}&selector=${selector}&fresh=${fresh}`;
  const verifiedink_url = `https%3A%2F%2Fverifiedink.us%2Fscreenshot%2F${id}`;
  const query_url = `https://shot.screenshotapi.net/screenshot?token=${process.env.NEXT_PUBLIC_SCREENSHOT_API_TOKEN}&url=${verifiedink_url}${query}`;
  try {
    const fetch_res = await fetch(query_url);
    const data = await fetch_res.blob();

    data.arrayBuffer().then((buf) => {
      var base64data =
        "data:image/png;base64, " + Buffer.from(buf).toString("base64");
      res.send(base64data);
    });
  } catch (err) {
    console.log(err);
    res.status(400);
  }
}
