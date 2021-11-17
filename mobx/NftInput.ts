import Nft from "@/types/Nft";
import { makeAutoObservable } from "mobx";

export class NftInput {
  first_name: string = "";
  last_name: string = "";
  graduation_year: string = "";
  high_school: string = "";
  usa_state: string = "";
  sport: string = "";
  sport_position: string = "";
  preview_rotation: number = 0;
  photoUploading: boolean = false;
  videoUploading: boolean = false;
  muxUploadId: string = "";
  muxPlaybackId: string = "";
  localVideo: File | undefined = undefined;
  localSignature: any = null;
  localPhoto: File | undefined = undefined;

  color_top: string = "";
  color_bottom: string = "";
  color_transition: string = "";

  errorMessage = "";

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

  setValues = (input: Nft) => {
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
  };

  resetValues = () => {
    this.first_name = "";
    this.last_name = "";
    this.graduation_year = "";
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
}
