import Nft from "@/types/Nft";
import UserDetails from "@/types/UserDetails";
import {
  createNewNft,
  getFileFromSupabase,
  getUserNft,
  supabase,
} from "@/supabase/supabase-client";
import { makeAutoObservable } from "mobx";
import { NftInput } from "./NftInput";
import { NftStore } from "./NftStore";
import { UserDetailsStore } from "./UserDetailsStore";
import { getUserDetails, updateUsername } from "@/supabase/userDetails";
import { UiStore } from "./UiStore";

export class UserStore {
  loaded = false;
  id = "";
  email = "";
  name = "";
  avatar_url = "";

  nft: NftStore | null = null;
  nftInput: NftInput;
  userDetails: UserDetailsStore;
  ui: UiStore;

  resetThisState() {
    this.loaded = true;
    this.id = "";
    this.email = "";
    this.name = "";
    this.avatar_url = "";
    this.nft = null;
    this.nftInput.resetValues();
    this.userDetails.resetValues();
    this.ui.resetValues();
  }

  constructor() {
    makeAutoObservable(this);
    this.nftInput = new NftInput(null);
    this.userDetails = new UserDetailsStore(this);
    this.ui = new UiStore(this);

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

        // Check if user just signed up and needs to update the
        // user details and referring info
        const sign_up = localStorage.getItem("sign_up");
        if (sign_up === "true") {
          const referral_code = localStorage.getItem("referral_code");
          await this.userDetails.initSignUp(
            referral_code,
            user.id,
            user.email,
            user.user_metadata.user_name
          );
          localStorage.removeItem("sign_up");
          localStorage.removeItem("referral_code");
        }

        // Get user details data from db
        const { data: userData, error: userError } = await getUserDetails(
          user.id
        );

        if (!userData) {
          // User signed in with no user_details db object
          await this.userDetails.initSignUp(
            null,
            user.id,
            user.email,
            user.user_metadata.user_name
          );
        }

        // set user and fetch their NFT data.
        const { data, error } = await getUserNft(user.id);
        if (!error && data) {
          // check for files
          let nftPhoto = "";
          let nftSignature = "";
          if (data.photo_file) {
            const { file, error } = await getFileFromSupabase(data.photo_file);
            if (file) {
              nftPhoto = URL.createObjectURL(file);
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
            nftSignature,
            userData
          );
        } else {
          // no new user, create empty nftInput and keep nft as null
          this.setNewData(user, userData);
        }
      } else if (res.status === 400) {
        this.finishLoading();
        // no user
      }
    } catch (err) {
      this.finishLoading();
      console.log({ err });
    }
  };

  finishLoading = () => {
    this.loaded = true;
  };

  setInitialUserAndNft(
    nftData: Nft,
    user: any,
    nftPhoto: string,
    nftSignature: string,
    userDetails: UserDetails | null
  ) {
    this.nft = new NftStore(nftData, this, nftPhoto, nftSignature);
    this.nftInput.setValues(nftData);
    if (userDetails) {
      this.userDetails.setInitValues(userDetails);
    }
    this.loaded = true;
    this.id = user.id;
    this.email = user.email;
    this.name = user.name;
    this.avatar_url = user.user_metadata.avatar_url;
  }

  setNewData(user: any, userDetails: UserDetails | null) {
    if (userDetails) {
      this.userDetails.setInitValues(userDetails);
    }
    this.loaded = true;
    this.id = user.id || "";
    this.email = user.email || "";
    this.name = user.name || "";
    this.avatar_url = user.user_metadata?.avatar_url || "";
  }

  get nftMintingProgress() {
    if (this.nft?.minted) {
      return 3;
    } else if (this.nft?.approved) {
      return 2;
    } else if (this.stepOneSkip) {
      return 1;
    } else {
      return 0;
    }
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
        this.nft.sport_position === this.nftInput.sport_position
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
      user_details_id: this.userDetails.id,
    });

    const user_name = `${this.nftInput?.first_name} ${this.nftInput?.last_name}`;
    const { data: data2, error: error2 } = await updateUsername(
      user_name,
      this.userDetails.id
    );

    if (error) {
      alert(error.message);
      return false;
    } else {
      if (data) {
        this.nft = new NftStore(data[0], this);
        this.userDetails.setFieldValue("user_name", user_name);
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
