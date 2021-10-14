import { NextApiRequest, NextApiResponse } from "next";
const FormData = require("form-data");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = req.query.id as string;
<<<<<<< HEAD
  // const test_url = `https://verifiedink.us/card/${id}`;
  const verifiedink_url = `https://verifiedink.us/screenshot/${id}&width=800&height=1200&output=image&file_type=png&omit_background=true&wait_for_event=load&selector=.card-container`;
  const query_url = `https://shot.screenshotapi.net/screenshot?token=${process.env.NEXT_PUBLIC_SCREENSHOT_API_TOKEN}&url=${verifiedink_url}`;
=======
  const width = 800;
  const height = 1200;
  const output = "json"; //switch this to image when storing the image
  const file_type = "png";
  const omit_background = "true";
  const wait_for_event = "load";
  const selector = ".card-container";
  const fresh = "true";

  const query = `&width=${width}&height=${height}&output=${output}&file_type=${file_type}&omit_background=${omit_background}&wait_for_event=${wait_for_event}&selector=${selector}&fresh=${fresh}`;
  const verifiedink_url = `https%3A%2F%2Fverifiedink.us%2Fscreenshot%2F${id}`;
  const query_url = `https://shot.screenshotapi.net/screenshot?token=${process.env.NEXT_PUBLIC_SCREENSHOT_API_TOKEN}&url=${verifiedink_url}${query}`;
>>>>>>> 85bbc98 (Setting background to white for screenshot route + forcing fresh screenshot in the api call)
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
