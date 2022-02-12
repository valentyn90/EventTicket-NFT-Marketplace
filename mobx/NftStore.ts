import Nft from "@/types/Nft";
import dataURLtoFile from "@/utils/dataUrlToFile";
import {
  approveNftCard,
  attachFileToNft,
  deleteNftById,
  insertFileToSupabase,
  saveTeamColors,
  setMuxValues,
  stepThreeSubmit,
  updateNft,
  updateNftScreenshotUrl,
  uploadFileToStorage,
} from "@/supabase/supabase-client";
import { makeAutoObservable } from "mobx";
import { UserStore } from "./UserStore";
import { updateTwitter, updateUsername } from "@/supabase/userDetails";

export class NftStore {
  store: UserStore;

  id: number;
  user_id = "";
  user_details_id = "";

  first_name = "";
  last_name = "";

  photo_file: number | undefined = undefined;
  photo: string = "";

  signature_file: number | undefined = undefined;
  signature: string = "";

  sport = "";
  sport_position = "";
  usa_state = "";

  quotes = "";
  high_school = "";
  graduation_year = "";

  approved = false;
  finished = false;
  minted = false;

  mux_upload_id: string | null = null;
  mux_asset_id: string | null = null;
  mux_playback_id: string | null = null;
  mux_max_resolution: string | null = null;

  screenshot_file_id: number | null = null;

  color_top: string | null = null;
  color_bottom: string | null = null;
  color_transition: string | null = null;

  constructor(
    input: Nft,
    store: UserStore,
    nftPhoto: string = "",
    nftSignature: string = ""
  ) {
    makeAutoObservable(this);
    this.store = store;
    this.photo = nftPhoto;
    this.signature = nftSignature;
    this.id = input.id;
    this.mux_asset_id = input.mux_asset_id;
    this.mux_upload_id = input.mux_upload_id;
    this.mux_playback_id = input.mux_playback_id;
    this.mux_max_resolution = input.mux_max_resolution;
    this.user_id = input.user_id;
    this.user_details_id = input.user_details_id;
    this.first_name = input.first_name;
    this.last_name = input.last_name;
    this.photo_file = input.photo_file;
    this.signature_file = input.signature_file;
    this.sport = input.sport;
    this.sport_position = input.sport_position;
    this.usa_state = input.usa_state;
    this.quotes = input.quotes;
    this.high_school = input.high_school;
    this.graduation_year = input.graduation_year;
    this.approved = input.approved;
    this.finished = input.finished;
    this.minted = input.minted;
    this.screenshot_file_id = input.screenshot_file_id;
    this.color_top = input.color_top;
    this.color_bottom = input.color_bottom;
    this.color_transition = input.color_transition;
  }

  deleteThisNft = async (): Promise<boolean> => {
    const res = await deleteNftById(
      this.id,
      this.photo_file,
      this.signature_file
    );
    if (res) {
      // success
      this.store.deleteNft();
      return true;
    } else {
      return false;
    }
  };

  updateStepOne = async (): Promise<boolean> => {
    const { data, error } = await updateNft({
      nft_id: this.id,
      firstName: this.store.nftInput?.first_name,
      lastName: this.store.nftInput?.last_name,
      gradYear: this.store.nftInput?.graduation_year,
    });

    const user_name = `${this.store.nftInput?.first_name} ${this.store.nftInput?.last_name}`;
    const { data: data2, error: error2 } = await updateUsername(
      user_name,
      this.store.userDetails.id
    );

    const { data: updateTwitterData, error: updateTwitterError } =
      await updateTwitter(
        this.store.nftInput.twitter,
        this.store.userDetails.id
      );

    if (error) {
      alert(error.message);
      return false;
    } else {
      this.store.userDetails.setFieldValue("user_name", user_name);
      this.store.userDetails.setFieldValue(
        "twitter",
        this.store.nftInput.twitter
      );
      return true;
    }
  };

  setFieldValue = (field: string, value: any) => {
    // @ts-ignore
    this[field] = value;
  };

  getMuxUpload = async () => {
    const checkUploadStatus = async () => {
      // Get upload data by id
      const res = await fetch(`/api/mux/upload/${this.mux_upload_id}`);

      const data = await res.json();
      if (data.upload) {
        // if upload object is ready, set muxUploadId
        this.setFieldValue("mux_asset_id", data.upload.asset_id);
        // once upload is available then start fetching the asset
        this.getMuxAsset();
        clearInterval(checkUploadInterval);
      }
    };
    // run method immediately
    checkUploadStatus();
    // run on interval after
    const checkUploadInterval = setInterval(checkUploadStatus, 5000);
  };

  getMuxAsset = async () => {
    const checkAssetStatus = async () => {
      if (this.mux_asset_id) {
        const res = await fetch(`/api/mux/asset/${this.mux_asset_id}`);
        const data = await res.json();
        // First check if status is ready
        if (data.asset?.status === "ready") {
          // Use m3u8 video
          this.setFieldValue("mux_playback_id", data.asset.playback_id);
          this.store.nftInput.setVideoUploading(false);

          // but continue to work until static renditions is ready then this is done
          if (data.asset?.static_renditions.status === "ready") {
            this.updateMuxIdsInSupabase(
              data.asset.static_renditions.files.length
            );
            clearInterval(checkAssetInterval);
          }
        } else if (data.asset?.errors?.messages) {
          this.store.nftInput.setVideoUploading(false);
          this.store.nftInput.setErrorMessage(data.asset?.errors?.messages[0]);
          clearInterval(checkAssetInterval);
        }
      }
    };
    // run method immediately
    checkAssetStatus();
    // run on interval after
    const checkAssetInterval = setInterval(checkAssetStatus, 5000);
  };

  updateMuxIdsInSupabase = async (static_reditions: string) => {
    const count_renditions = parseInt(static_reditions);
    let file_name = "low";
    if (count_renditions > 2) {
      file_name = "high";
    } else if (count_renditions > 1) {
      file_name = "medium";
    }
    try {
      const { data, error } = await setMuxValues(
        this.id,
        this.mux_asset_id,
        this.mux_playback_id,
        this.mux_upload_id,
        file_name
      );
    } catch (err) {
      console.log(err);
    }
  };

  stepThreeSubmit = async (): Promise<boolean> => {
    const { data, error } = await stepThreeSubmit({
      nft_id: this.id,
      highSchool: this.store.nftInput.high_school,
      usaState: this.store.nftInput.usa_state,
      sport: this.store.nftInput.sport,
      sportPosition: this.store.nftInput.sport_position,
    });

    if (error) {
      alert(error.message);
      return false;
    } else {
      return true;
    }
  };

  saveTeamColors = async (): Promise<boolean> => {
    const { data, error } = await saveTeamColors(
      this.id,
      this.store.nftInput.color_top,
      this.store.nftInput.color_bottom,
      this.store.nftInput.color_transition
    );
    if (data) {
      this.setFieldValue("color_top", this.store.nftInput.color_top);
      this.setFieldValue("color_bottom", this.store.nftInput.color_bottom);
      this.setFieldValue(
        "color_transition",
        this.store.nftInput.color_transition
      );
      return true;
    } else {
      console.log(error);
      return false;
    }
  };

  updateThisPhoto = (photo_id: number, photoFile: File): void => {
    this.photo_file = photo_id;
    this.photo = URL.createObjectURL(photoFile);
  };

  uploadPhotoToSupabase = async (): Promise<boolean> => {
    try {
      // 1. set the path name
      const filePath = `${this.store.id}/${new Date().getTime()}${
        this.store.nftInput.localPhoto?.name
      }`;
      const ogFilePath = `${this.store.id}/${new Date().getTime()}${
        this.store.nftInput.ogPhoto?.name
      }`;

      // 1. upload image file
      const { data, error } = await uploadFileToStorage(
        filePath,
        this.store.nftInput.localPhoto as File
      );
      const { data: ogData, error: ogError } = await uploadFileToStorage(
        ogFilePath,
        this.store.nftInput.ogPhoto as File
      );

      if (error) {
        alert(error.message);
        return false;
      }
      if (ogError) {
        alert(ogError.message);
        return false;
      }

      // 2. create file object
      // create new file object in db and attach to user
      const { data: data2, error: error2 } = await insertFileToSupabase(
        filePath,
        this.id
      );
      const { data: ogData2, error: ogError2 } = await insertFileToSupabase(
        ogFilePath,
        this.id
      );

      if (error2) {
        alert(error2.message);
        return false;
      }
      if (ogError2) {
        alert(ogError2.message);
        return false;
      }

      // 3. attach file object to user
      const { data: data3, error: error3 } = await attachFileToNft(
        "photo_file",
        (data2 as any)[0].id,
        this.id
      );
      const { data: ogData3, error: ogError3 } = await attachFileToNft(
        "og_photo_id",
        (ogData2 as any)[0].id,
        this.id
      );

      // 4. set file object
      this.updateThisPhoto(
        (data2 as any)[0].id,
        this.store.nftInput.localPhoto as File
      );

      this.store.nftInput.resetLocalPhoto();
      // 5. reset nftinput photo data
      return true;
    } catch (err) {
      alert("There was an error. Please contact website admin.");
      console.log(err);
      return false;
    }
  };

  deleteThisVideo = () => {
    this.mux_playback_id = null;
  };

  deleteThisSignature = () => {
    this.signature = "";
  };

  updateThisSignature = (id: number, sig_file: File) => {
    this.signature_file = id;
    this.signature = URL.createObjectURL(sig_file);
  };

  uploadSignatureToSupabase = async (sigFile: File): Promise<boolean> => {
    try {
      const filePath = `${
        this.store.id
      }/${new Date().getTime()}signaturePic.png`;

      const { data, error } = await uploadFileToStorage(filePath, sigFile);

      if (error) {
        alert(error.message);
        return false;
      }

      const { data: data2, error: error2 } = await insertFileToSupabase(
        filePath,
        this.id
      );

      const { data: data3, error: error3 } = await attachFileToNft(
        "signature_file",
        (data2 as any)[0].id,
        this.id
      );

      this.updateThisSignature((data2 as any)[0].id, sigFile);

      return true;
    } catch (err) {
      alert("There was an error. Please contact website admin.");
      console.log(err);
      return false;
    }
  };

  async setNFTCardScreenshotTwitter(nft_id: number): Promise<boolean> {
    const res = fetch(`/api/meta/uploadTwitterPreview/${nft_id}`);
    return true;
  }

  async setNftCardScreenshot(
    nft_id: number,
    user_id: string
  ): Promise<boolean> {
    // Get screenshot of nft card
    const res = await fetch(
      `https://verified-api.vercel.app/api/screenshot/create/${nft_id}`
    );
    if (res.status === 200) {
      const file_name = `nftcard_screenshot.png`;
      const data = await res.text();

      // This is the image file to upload to supabase
      const base64Image = dataURLtoFile(data, file_name);

      const file_path = `${user_id}/${new Date().getTime()}${file_name}`;

      try {
        // Upload file
        const { data: uploadData, error: uploadError } =
          await uploadFileToStorage(file_path, base64Image);

        if (!uploadError) {
          // Create new file object in db and attach to user
          const { data: insertData, error: insertError } =
            await insertFileToSupabase(file_path, nft_id);

          if (!insertError) {
            // attach file object to user
            const { data: attachData, error: attachError } =
              await attachFileToNft(
                "screenshot_file_id",
                (insertData as any)[0].id,
                nft_id
              );
            if (!attachError) {
              // done
              if (nft_id === this.id) {
                this.setFieldValue(
                  "screenshot_file_id",
                  (insertData as any)[0].id
                );
              }
              const twitter_screenshot_res =
                await this.setNFTCardScreenshotTwitter(nft_id);
              if (twitter_screenshot_res) {
                return true;
              } else {
                return true;
              }
            } else {
              alert(attachError.message);
              return false;
            }
          } else {
            alert(insertError.message);
            return false;
          }
        } else {
          alert(uploadError.message);
          return false;
        }
      } catch (err) {
        console.log(err);
        return false;
      }
    } else {
      // error
      console.log("Error getting nft card screenshot");
      return false;
    }
  }

  async stepSevenSubmit(): Promise<boolean> {
    const { data, error } = await approveNftCard(this.id);
    if (error) {
      alert(error.message);
      return false;
    }
    this.setFieldValue("approved", true);
    return true;
  }
}
