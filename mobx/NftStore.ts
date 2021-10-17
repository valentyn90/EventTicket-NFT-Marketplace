import Nft from "@/types/Nft";
import dataURLtoFile from "@/utils/dataUrlToFile";
import {
  approveNftCard,
  attachFileToNft,
  deleteNftById,
  insertFileToSupabase,
  setMuxValues,
  stepThreeSubmit,
  updateNft,
  updateNftScreenshotUrl,
  uploadFileToStorage,
} from "@/utils/supabase-client";
import { makeAutoObservable } from "mobx";
import { UserStore } from "./UserStore";

export class NftStore {
  store: UserStore;

  id: number;
  user_id = "";

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

  screenshot_file_id: number | null = null;

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
    this.user_id = input.user_id;
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

  updateThisNft = async (): Promise<boolean> => {
    const { data, error } = await updateNft({
      nft_id: this.id,
      firstName: this.store.nftInput?.first_name,
      lastName: this.store.nftInput?.last_name,
      gradYear: this.store.nftInput?.graduation_year,
    });
    if (error) {
      alert(error.message);
      return false;
    } else {
      return true;
    }
  };

  setInputValue = (field: string, value: any) => {
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
        this.setInputValue("mux_asset_id", data.upload.asset_id);
        // once upload is available then start fetching the asset
        this.getMuxAsset();
        // this.store
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

        if (data.asset?.status === "ready") {
          this.store.nftInput.setVideoUploading(false);
          this.setInputValue("mux_playback_id", data.asset.playback_id);
          this.updateMuxIdsInSupabase();
          clearInterval(checkAssetInterval);
        }
      }
    };
    // run method immediately
    checkAssetStatus();
    // run on interval after
    const checkAssetInterval = setInterval(checkAssetStatus, 5000);
  };

  updateMuxIdsInSupabase = async () => {
    try {
      const { data, error } = await setMuxValues(
        this.id,
        this.mux_asset_id,
        this.mux_playback_id,
        this.mux_upload_id
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

  updateThisPhoto = (photo_id: number, photoFile: File): void => {
    this.photo_file = photo_id;
    this.photo = URL.createObjectURL(photoFile);
  };

  uploadPhotoToSupabase = async (): Promise<boolean> => {
    try {
      // 1. set the path name
      const filePath = `${this.store.id}/${new Date().getTime()}${this.store.nftInput.localPhoto?.name
        }`;

      // 1. upload image file
      const { data, error } = await uploadFileToStorage(
        filePath,
        this.store.nftInput.localPhoto as File
      );

      if (error) {
        alert(error.message);
        return false;
      }

      // 2. create file object
      // create new file object in db and attach to user
      const { data: data2, error: error2 } = await insertFileToSupabase(
        filePath,
        this.id
      );

      if (error2) {
        alert(error2.message);
        return false;
      }

      // 3. attach file object to user
      const { data: data3, error: error3 } = await attachFileToNft(
        "photo_file",
        (data2 as any)[0].id,
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
      const filePath = `${this.store.id
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

  async setNftCardScreenshot(): Promise<boolean> {
    // Get screenshot of nft card
    const res = await fetch(`/api/screenshot/create/${this.id}`);
    if (res.status === 200) {
      const file_name = `nftcard_screenshot.png`;
      const data = await res.text();

      // This is the image file to upload to supabase
      const base64Image = dataURLtoFile(data, file_name);

      const file_path = `${this.store.id
        }/${new Date().getTime()}${file_name}`;

      try {
        // Upload file
        const { data: uploadData, error: uploadError } =
          await uploadFileToStorage(file_path, base64Image);

        if (!uploadError) {
          // Create new file object in db and attach to user
          const { data: insertData, error: insertError } =
            await insertFileToSupabase(file_path, this.id);

          if (!insertError) {
            // attach file object to user
            const { data: attachData, error: attachError } =
              await attachFileToNft(
                "screenshot_file_id",
                (insertData as any)[0].id,
                this.id
              );
            if (!attachError) {
              // done
              this.setInputValue(
                "screenshot_file_id",
                (insertData as any)[0].id
              );
              return true;
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

  async stepSixSubmit(): Promise<boolean> {
    const { data, error } = await approveNftCard(this.id);
    if (error) {
      alert(error.message);
      return false;
    }
    return true;
  }
}
