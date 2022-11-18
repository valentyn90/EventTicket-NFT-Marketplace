import userStore from "@/mobx/UserStore";
import { setMuxValues } from "@/supabase/supabase-client";
import AsyncMethodReturn from "@/types/AsyncMethodReturn";

async function updateVideo(
  nftId: number | undefined,
  mux_upload_id: string,
  mux_asset_id: string,
  mux_playback_id: string,
  count_renditions: string
): Promise<AsyncMethodReturn> {
  if (!nftId)
    return {
      success: false,
      message: "No Nft id provided",
    };

  const res = await fetch(`/api/create/update-video`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify({
      nft_id: nftId,
      mux_upload_id,
      mux_asset_id,
      mux_playback_id,
      count_renditions,
    }),
  });

  if (res.ok) {
    const resJson = await res.json();

    if (resJson.success) {
      userStore.ui.nextStep();
      return {
        success: true,
        message: "Video updated",
      };
    } else {
      return {
        success: false,
        message: "Error updating video",
      };
    }
  } else {
    return {
      success: false,
      message: "Error updating video",
    };
  }
}

export default updateVideo;
