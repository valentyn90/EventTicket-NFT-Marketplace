import userStore from "@/mobx/UserStore";
import {
  attachFileToNft,
  insertFileToSupabase,
  uploadFileToStorage,
} from "@/supabase/supabase-client";
import AsyncMethodReturn from "@/types/AsyncMethodReturn";
import { checkImageSize, resizeImageFile } from "@/utils/imageFileResizer";
import { toJS } from "mobx";

async function updatePhoto(
  e: React.FormEvent,
  nftId: number | undefined
): Promise<AsyncMethodReturn> {
  e.preventDefault();

  if (!nftId)
    return {
      success: false,
      message: "No Nft id provided",
    };

  let filePath = "";
  let ogFilePath = "";

  if (!userStore.loggedIn) {
    // 1. set the path name
    filePath = `tempnft/${userStore.temp_user_id}/${new Date().getTime()}${
      userStore.nftInput.localPhoto?.name || "photo.png"
    }`;
    ogFilePath = `tempnft/${userStore.temp_user_id}/${new Date().getTime()}_og${
      userStore.nftInput.ogPhoto?.name || "og_photo.png"
    }`;
  } else {
    filePath = `${userStore.id}/${new Date().getTime()}${
      userStore.nftInput.localPhoto?.name || "photo.png"
    }`;
    ogFilePath = `${userStore.id}/${new Date().getTime()}_og${
      userStore.nftInput.ogPhoto?.name || "og_photo.png"
    }`;
  }

  const { data, error } = await uploadFileToStorage(
    filePath,
    userStore.nftInput.localPhoto as File
  );

  const { data: ogData, error: ogError } = await uploadFileToStorage(
    ogFilePath,
    userStore.nftInput.ogPhoto as File
  );

  if (error) {
    console.log({ error });
    return {
      success: false,
      message: error.message,
    };
  }
  if (ogError) {
    console.log({ ogError });
    return {
      success: false,
      message: ogError.message,
    };
  }

  // 2. create file object
  const { data: data2, error: error2 } = await insertFileToSupabase(
    filePath,
    nftId
  );
  const { data: ogData2, error: ogError2 } = await insertFileToSupabase(
    ogFilePath,
    nftId
  );

  if (error2) {
    console.log({ error2 });
    return {
      success: false,
      message: error2.message,
    };
  }
  if (ogError2) {
    console.log({ ogError2 });
    return {
      success: false,
      message: ogError2.message,
    };
  }

  const attachRes = await fetch(`/api/create/update-photo`, {
    method: "POST",
    headers: new Headers({ "Content-Type": "application/json" }),
    credentials: "same-origin",
    body: JSON.stringify({
      nft_id: nftId,
      file_id: (data2 as any)[0].id,
      column: "photo_file",
    }),
  });

  const attachRes2 = await fetch(`/api/create/update-photo`, {
    method: "POST",
    headers: new Headers({ "Content-Type": "application/json" }),
    credentials: "same-origin",
    body: JSON.stringify({
      nft_id: nftId,
      file_id: (ogData2 as any)[0].id,
      column: "og_photo_id",
    }),
  });

  if (attachRes.ok && attachRes2.ok) {
    const attachResJson = await attachRes.json();
    const attachResJson2 = await attachRes2.json();

    if (attachResJson.success && attachResJson2.success) {
      userStore.nftInput.resetLocalPhoto();
      userStore.ui.nextStep();
      return {
        success: true,
        message: "Photo updated",
      };
    } else {
      return {
        success: false,
        message: "Error updating photo",
      };
    }
  } else {
    return {
      success: false,
      message: "Photo update failed",
    };
  }
}

export default updatePhoto;
