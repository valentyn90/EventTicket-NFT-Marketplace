import userStore from "@/mobx/UserStore";
import { supabase } from "@/supabase/supabase-client";
import AsyncMethodReturn from "@/types/AsyncMethodReturn";

async function updateColors(
  nftId: number | undefined,
  color_top: string,
  color_bottom: string
): Promise<AsyncMethodReturn> {
  if (!nftId)
    return {
      success: false,
      message: "No Nft id provided",
    };

  const res = await fetch(`/api/create/update-colors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify({
      nft_id: nftId,
      color_top,
      color_bottom,
    }),
  });

  if (res.ok) {
    const resJson = await res.json();

    if (resJson.success) {
      userStore.ui.nextStep();
      return {
        success: true,
        message: "Colors updated",
      };
    } else {
      return {
        success: false,
        message: "Error updating colors",
      };
    }
  } else {
    return {
      success: false,
      message: "Error updating colors",
    };
  }
}

export default updateColors;
