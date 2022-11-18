import userStore from "@/mobx/UserStore";
import {
  attachFileToNft,
  insertFileToSupabase,
  uploadFileToStorage,
} from "@/supabase/supabase-client";
import AsyncMethodReturn from "@/types/AsyncMethodReturn";
import dataURLtoFile from "@/utils/dataUrlToFile";
import { checkImageSize, resizeImageFile } from "@/utils/imageFileResizer";
import cookieCutter from "cookie-cutter";

async function updateSignature(
  nftId: number | undefined,
  signature: any,
  isMobile: boolean
): Promise<AsyncMethodReturn> {
  if (!nftId) {
    return {
      success: false,
      message: "No NFT ID provided",
    };
  }

  const newSigFile = await dataURLtoFile(
    signature.current.toDataURL(),
    "signaturePic.png"
  );

  // rotate newsigfile 90 degrees counter clockwise

  const { width, height }: any = await checkImageSize(newSigFile);

  let imgToUpload: any;

  if (isMobile) {
    imgToUpload = await resizeImageFile(newSigFile, width, height, 100, 270);
  } else {
    imgToUpload = newSigFile;
  }

  let filePath = "";
  if (userStore.loggedIn) {
    filePath = `${userStore.id}/${new Date().getTime()}signaturePic.png`;
  } else {
    const temp_user_id = cookieCutter.get("temp_user_id");
    filePath = `tempnft/${temp_user_id}/${new Date().getTime()}signaturePic.png`;
  }

  const { data, error } = await uploadFileToStorage(
    filePath,
    imgToUpload as File
  );

  if (error) {
    console.log(error);
    return {
      success: false,
      message: "Error uploading signature to storage",
    };
  }

  const { data: data2, error: error2 } = await insertFileToSupabase(
    filePath,
    nftId
  );

  if (error2) {
    console.log(error2);
    return {
      success: false,
      message: "Error attaching signature to NFT",
    };
  }

  const res = await fetch("/api/create/update-signature", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      column: "signature_file",
      id: (data2 as any)[0].id,
      nft_id: nftId,
    }),
  });

  if (res.ok) {
    const resJson = await res.json();

    if (resJson.success) {
      userStore.ui.nextStep();
      return {
        success: true,
        message: "Signature updated",
      };
    } else {
      return {
        success: false,
        message: "Error updating signature",
      };
    }
  } else {
    return {
      success: false,
      message: "Error updating signature",
    };
  }
}

export default updateSignature;
