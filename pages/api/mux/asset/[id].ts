import type { NextApiRequest, NextApiResponse } from "next";
import Mux from "@mux/mux-node";
const { Video } = new Mux(
  process.env.NEXT_PUBLIC_MUX_TOKEN_ID,
  process.env.NEXT_PUBLIC_MUX_TOKEN_SECRET
);

export default async function assetHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const asset = await Video.Assets.get(req.query.id as string);
        res.json({
          asset: {
            id: asset.id,
            status: asset.status,
            errors: asset.errors,
            playback_id: (asset.playback_ids as any)[0].id,
            max_stored_resolution: asset.max_stored_resolution,
            static_renditions: asset.static_renditions
          },
        });
      } catch (e) {
        console.error("Request error", e);
        res.status(500).json({ error: "Error getting upload/asset" });
      }
      break;
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
