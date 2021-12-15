import type { NextApiRequest, NextApiResponse } from "next";

export default async function assetClipHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!req.body.asset_id) {
    res.status(500).json({ error: true });
  }

  const encodedData = Buffer.from(
    `${process.env.NEXT_PUBLIC_MUX_TOKEN_ID}:${process.env.NEXT_PUBLIC_MUX_TOKEN_SECRET}`
  ).toString("base64");

  const response = await fetch(`https://api.mux.com/video/v1/assets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${encodedData}`,
    },
    body: JSON.stringify({
      input: [
        {
          url: `mux://assets/${req.body.asset_id}`,
          start_time: req.body.start_time,
          end_time: req.body.end_time,
        },
      ],
      mp4_support: "standard",
      playback_policy: ["public"],
    }),
  })
    .then((res) => res.json())
    .catch((error) => Promise.reject(error));

  if (response.data) {
    res.status(200).json({
      playback_ids: response.data.playback_ids,
      id: response.data.id,
      source_asset_id: response.data.source_asset_id,
    });
  } else {
    console.log(response.data);
    res.status(500).json({ error: true });
  }
}
