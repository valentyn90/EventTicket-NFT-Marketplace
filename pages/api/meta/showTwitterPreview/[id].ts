import { getSupabaseFile } from "@/supabase/supabase-client";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function assetHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {

    const id = req.query.id as string;

    // const { data, error } = await getNftById(parseInt(id));
    const file_id = `twitter-preview/${id}.png`;
    const {data, error } = await getSupabaseFile(file_id)

    if (data) {
      res.setHeader("Content-Type", "image/png");
      res.send(data.stream())
    }

    else{
      const{data: dataResponse, error: errorFile } = await getSupabaseFile('twitter-preview/twitter.png')
      if (dataResponse) {
        res.setHeader("Content-Type", "image/png");
        res.send(dataResponse.stream())
      }else {
      
      res.status(500).send(error?.message);
      }
    }

    
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}
