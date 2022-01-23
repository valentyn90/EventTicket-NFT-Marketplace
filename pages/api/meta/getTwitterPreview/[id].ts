import { getFileLinkFromSupabase, getNftById } from "@/supabase/supabase-client";
import type { NextApiRequest, NextApiResponse } from "next";
import jimp from "jimp";

export default async function assetHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {

    const id = req.query.id as string;

    const { data, error } = await getNftById(parseInt(id));
    if (error) { console.log("no nft found") }

    if (data) {
      const { publicUrl: public_url, error: error2 } = await getFileLinkFromSupabase(data.screenshot_file_id);

      if (public_url) {

        const image = await jimp.read(public_url);

        const square = image.contain(1600, 800);

        const imageBuffer = await square.getBufferAsync(jimp.MIME_PNG)

        res.setHeader("Content-Type", "image/png");
        res.send(imageBuffer);
        // res.status(200).json({ public_url });
      }
    }

    
  } catch (err) {
    console.log(err);
    res.status(500);
  }
}
