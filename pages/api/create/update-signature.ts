import { supabase } from "@/supabase/supabase-admin";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { column, id, nft_id } = req.body;

  try {
    const { data, error } = await supabase
      .from("nft")
      .update([
        {
          [column]: id,
        },
      ])
      .match({ id: nft_id });

    if (error) {
      console.log(error);
      return res.status(200).json({
        success: false,
        message: error.message,
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Updated!",
    });
  } catch (err) {
    console.log(err);
    return res
      .status(200)
      .json({ success: false, message: "There was an error." });
  }
}
