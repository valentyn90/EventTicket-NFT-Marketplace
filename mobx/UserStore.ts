import Nft from "@/types/Nft";
import {
  createNewNft,
  getFileFromSupabase,
  getUserNft,
  supabase,
} from "@/utils/supabase-client";
import { makeAutoObservable } from "mobx";
import { NftInput } from "./NftInput";
import { NftStore } from "./NftStore";

export class UserStore {
  loaded = false;
  id = "";
  email = "";
  name = "";
  avatar_url = "";
  nft: NftStore | null = null;
  nftInput: NftInput;

  constructor() {
    makeAutoObservable(this);
    this.nftInput = new NftInput(null);

    supabase.auth.onAuthStateChange(async (event, session) => {
      await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/auth`, {
        method: "POST",
        headers: new Headers({ "Content-Type": "application/json" }),
        credentials: "same-origin",
        body: JSON.stringify({ event, session }),
      }).then((res) => res.json());
      if (event === "SIGNED_OUT") {
        this.resetThisState();
      }
      if (event === "SIGNED_IN") {
        this.initUser();
      }
    });
  }

  initUser = async () => {
    // make api request to get cookie session
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/check-auth`,
        {
          method: "GET",
          headers: new Headers({ "Content-Type": "application/json" }),
          credentials: "same-origin",
        }
      );
      if (res.status === 200) {
        // there is a user
        const { user } = await res.json();
        // set user and fetch their NFT data.
        const { data, error } = await getUserNft(user.id);
        if (!error && data) {
          // check for files
          let nftPhoto = "";
          let nftVideo = "";
          let nftVideoName = "";
          let nftSignature = "";
          if (data.photo_file) {
            const { file, error } = await getFileFromSupabase(data.photo_file);
            if (file) {
              nftPhoto = URL.createObjectURL(file);
            }
          }
          if (data.clip_file) {
            const { file, fileName } = await getFileFromSupabase(
              data.clip_file
            );
            if (file) {
              nftVideoName = fileName;
              nftVideo = URL.createObjectURL(file);
            }
          }
          if (data.signature_file) {
            const { file } = await getFileFromSupabase(data.signature_file);
            if (file) {
              nftSignature = URL.createObjectURL(file);
            }
          }

          // set user and nft
          this.setInitialUserAndNft(
            data,
            user,
            nftPhoto,
            nftVideo,
            nftVideoName,
            nftSignature
          );
        } else {
          // no new user, create empty nftInput and keep nft as null
          this.setNewData(user);
        }
      } else if (res.status === 400) {
        // no user
      }
    } catch (err) {
      console.log({ err });
    }
  };

  setInitialUserAndNft(
    nftData: Nft,
    user: any,
    nftPhoto: string,
    nftVideo: string,
    nftVideoName: string,
    nftSignature: string
  ) {
    this.nft = new NftStore(
      nftData,
      this,
      nftPhoto,
      nftVideo,
      nftVideoName,
      nftSignature
    );
    this.nftInput.setValues(nftData);
    this.loaded = true;
    this.id = user.id;
    this.email = user.email;
    this.name = user.name;
    this.avatar_url = user.user_metadata.avatar_url;
  }

  setNewData(user: any) {
    this.loaded = true;
    this.id = user.id || "";
    this.email = user.email || "";
    this.name = user.name || "";
    this.avatar_url = user.user_metadata?.avatar_url || "";
  }

  resetThisState() {
    this.loaded = true;
    this.id = "";
    this.email = "";
    this.name = "";
    this.avatar_url = "";
    this.nft = null;
    this.nftInput.resetValues();
  }

  get loggedIn() {
    if (!this.id) return false;
    else return true;
  }

  get stepOneSkip() {
    if (
      this.nft?.first_name === this.nftInput?.first_name &&
      this.nft?.last_name === this.nftInput?.last_name &&
      this.nft?.graduation_year === this.nftInput?.graduation_year
    ) {
      return true;
    } else {
      return false;
    }
  }

  get stepTwoSkip() {
    // if there is no local photo (no new pic uploaded) and a photo exists on nft object,
    // no new photo skip step
    if (
      this.nftInput.localPhoto === undefined &&
      this.nft?.photo &&
      this.nftInput.preview_rotation === 0
    )
      return true;
    return false;
  }

  get stepThreeSkip() {
    if (this.nft) {
      if (
        this.nft.high_school === this.nftInput.high_school &&
        this.nft.usa_state === this.nftInput.usa_state &&
        this.nft.sport === this.nftInput.sport &&
        this.nft.sport_position === this.nftInput.sport_position &&
        this.nft.quotes === this.nftInput.quotes
      ) {
        return true;
      }
    }
    return false;
  }

  get stepFiveSkip() {
    if (this.nft) {
      if (this.nft.signature !== "" && !this.nftInput.localSignature) {
        return true;
      }
    }
    return false;
  }

  get signatureExists() {
    return this.nft?.signature !== "";
  }

  get videoExists() {
    return this.nft?.mux_playback_id !== "";
  }

  get loadedNft() {
    if (this.loaded) return this.nft;
    else return null;
  }

  deleteNft() {
    this.nft = null;
    this.nftInput.resetValues();
  }

  deletePhoto() {
    if (this.nft) {
      this.nft.photo = "";
      this.nftInput.localPhoto = undefined;
      this.nftInput.setRotation(0);
    }
  }

  createNft = async () => {
    const { data, error } = await createNewNft({
      firstName: this.nftInput?.first_name,
      lastName: this.nftInput?.last_name,
      gradYear: this.nftInput?.graduation_year,
      user_id: this.id,
    });

    if (error) {
      alert(error.message);
      return false;
    } else {
      if (data) {
        this.nft = new NftStore(data[0], this);
        return true;
      } else {
        return false;
      }
    }
  };
}

const userStore = new UserStore();
userStore.initUser();
export default userStore;
