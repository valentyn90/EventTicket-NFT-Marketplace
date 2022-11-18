import { setMuxValues } from "@/supabase/supabase-client";
import Nft from "@/types/Nft";
import { makeAutoObservable } from "mobx";
import userStore from "./UserStore";

export class NftInput {
  first_name: string = "";
  last_name: string = "";
  graduation_year: string = "";
  twitter: string = "";
  high_school: string = "";
  usa_state: string = "";
  sport: string = "";
  sport_position: string = "";
  preview_rotation: number = 0;
  photoUploading: boolean = false;
  videoUploading: boolean = false;
  localVideo: File | undefined = undefined;
  localSignature: any = null;
  localPhoto: File | undefined = undefined;
  ogPhoto: File | undefined = undefined;

  color_top: string = "";
  color_bottom: string = "";
  color_transition: string = "";

  errorMessage = "";

  mux_upload_id: string | null = null;
  mux_asset_id: string | null = null;
  mux_playback_id: string | null = null;
  mux_max_resolution: string | null = null;
  count_renditions: string | null = null;

  constructor(input: Nft | null) {
    makeAutoObservable(this);
    this.first_name = input?.first_name || "";
    this.last_name = input?.last_name || "";
    this.sport = input?.sport || "";
    this.sport_position = input?.sport_position || "";
    this.usa_state = input?.usa_state || "";
    this.high_school = input?.high_school || "";
    this.graduation_year = input?.graduation_year || "";
    this.color_top = input?.color_top || "";
    this.color_bottom = input?.color_bottom || "";
    this.color_transition = input?.color_transition || "";
  }

  setValues = (input: Nft, twitter: string) => {
    this.first_name = input?.first_name || "";
    this.last_name = input?.last_name || "";
    this.twitter = twitter;
    this.sport = input?.sport || "";
    this.sport_position = input?.sport_position || "";
    this.usa_state = input?.usa_state || "";
    this.high_school = input?.high_school || "";
    this.graduation_year = input?.graduation_year || "";
    this.color_top = input?.color_top || "";
    this.color_bottom = input?.color_bottom || "";
    this.color_transition = input?.color_transition || "";
  };

  resetValues = () => {
    this.first_name = "";
    this.last_name = "";
    this.graduation_year = "";
    this.twitter = "";
    this.high_school = "";
    this.usa_state = "";
    this.sport = "";
    this.sport_position = "";
    this.preview_rotation = 0;
    this.photoUploading = false;
    this.videoUploading = false;
    this.localVideo = undefined;
    this.localSignature = null;
    this.localPhoto = undefined;
    this.color_top = "";
    this.color_bottom = "";
    this.color_transition = "";
  };

  deleteThisVideo = () => {
    this.mux_playback_id = null;
  };

  setLocalPhoto = (photo: File) => {
    this.localPhoto = photo;
  };

  setErrorMessage = (msg: string) => {
    this.errorMessage = msg;
    setTimeout(() => {
      this.setInputValue("errorMessage", "");
    }, 3000);
  };

  resetLocalPhoto = () => {
    this.preview_rotation = 0;
    this.localPhoto = undefined;
    this.ogPhoto = undefined;
  };

  setLocalSignature = (sig: any) => {
    this.localSignature = sig;
  };

  resetLocalVideo = () => {
    this.localVideo = undefined;
  };

  setLocalVideo = (video: File) => {
    this.localVideo = video;
  };

  setVideoUploading = (upload: boolean) => {
    this.videoUploading = upload;
  };

  setPhotoUploading = (upload: boolean) => {
    this.photoUploading = upload;
  };

  setRotation = (rotate: number) => {
    this.preview_rotation = rotate;
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
        clearInterval(checkUploadInterval);
      }
    };
    // run method immediately
    checkUploadStatus();
    // run on interval after
    const checkUploadInterval = setInterval(checkUploadStatus, 5000);
  };

  getMuxAsset = async () => {
    /**
     * need to make a request to the mux url to see if
     * the request works.
     */
    const checkAssetStatus = async () => {
      if (this.mux_asset_id) {
        const res = await fetch(`/api/mux/asset/${this.mux_asset_id}`);
        const data = await res.json();
        // First check if status is ready
        if (data.asset?.status === "ready") {
          // Use m3u8 video

          // but continue to work until static renditions is ready then this is done
          if (data.asset?.static_renditions.status === "ready") {
            userStore.ui.setBottomEditComponent("");
            const count_renditions = parseInt(
              data.asset.static_renditions.files.length
            );
            let file_name = "low";
            if (count_renditions > 2) {
              file_name = "high";
            } else if (count_renditions > 1) {
              file_name = "medium";
            }
            this.count_renditions = file_name;
            this.mux_max_resolution = file_name;
            this.setInputValue("mux_playback_id", data.asset.playback_id);
            this.setVideoUploading(false);
            clearInterval(checkAssetInterval);
          }
        } else if (data.asset?.errors?.messages) {
          this.setVideoUploading(false);
          this.setErrorMessage(data.asset?.errors?.messages[0]);
          userStore.ui.setBottomEditComponent("");
          clearInterval(checkAssetInterval);
        }
      }
    };
    // run method immediately
    checkAssetStatus();
    // run on interval after
    const checkAssetInterval = setInterval(checkAssetStatus, 5000);
  };
}
