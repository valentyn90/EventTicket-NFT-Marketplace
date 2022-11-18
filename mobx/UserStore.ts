import Nft from "@/types/Nft";
import UserDetails from "@/types/UserDetails";
import {
  createNewNft,
  createNewTempNft,
  deleteTempUserId,
  getFileFromSupabase,
  getFilePath,
  getTempNft,
  getUserNft,
  moveFiles,
  supabase,
  updateTempUserNftToRealId,
} from "@/supabase/supabase-client";
import { makeAutoObservable } from "mobx";
import { NftInput } from "./NftInput";
import { NftStore } from "./NftStore";
import { UserDetailsStore } from "./UserDetailsStore";
import {
  getUserDetails,
  updateTempUserDetails,
  updateTwitter,
  updateUsername,
} from "@/supabase/userDetails";
import { v4 as uuidv4 } from "uuid";
import cookieCutter from "cookie-cutter";
import { UiStore } from "./UiStore";
import makeNewStorageFilename from "@/utils/makeNewStorageFilename";

export class UserStore {
  loaded = false;
  id = "";
  temp_user_id = "";
  email = "";
  name = "";
  avatar_url = "";
  publicKey: string | null = null;

  nft: NftStore | null = null;
  nftInput: NftInput;
  userDetails: UserDetailsStore;
  ui: UiStore;

  setFieldValue = (key: string, value: any) => {
    // @ts-ignore
    this[key] = value;
  };

  resetThisState() {
    this.loaded = true;
    this.id = "";
    this.email = "";
    this.name = "";
    this.avatar_url = "";
    this.publicKey = null;
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

  setNft = (nft: Nft) => {
    this.nft = new NftStore(nft, this);
  };

  initUser = async () => {
    // Unsure why this is running server side, but this is a workaround to ensure it
    // only executes on the client
    if (typeof window !== "undefined") {
      try {
        // make api request to get cookie session
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
          let userData;

          // Get user details data from db
          const { data: userDataCheck, error: userError } =
            await getUserDetails(user.id);

          // Check if user just signed up and needs to update the
          // user details and referring info

          if (!userDataCheck) {
            const sign_up = localStorage.getItem("sign_up");
            if (sign_up === "true") {
              const referral_code = localStorage.getItem("referral_code");
              await this.userDetails.initSignUp(
                referral_code,
                user.id,
                user.email,
                user.user_metadata.user_name
              );
              localStorage.setItem("sign_up", "completed");
              localStorage.removeItem("referral_code");
              // Get user details data from db
            } else {
              await this.userDetails.initSignUp(
                null,
                user.id,
                user.email,
                user.user_metadata.user_name
              );
              localStorage.setItem("sign_up", "completed");
              // User signed in with no user_details db object
            }

            const { data: userData2, error: userError } = await getUserDetails(
              user.id
            );
            userData = userData2;

            // If new user, check if they have temp user id
            // And update their nft value
            // attach user details id to nft
            const temp_user_id = cookieCutter.get("temp_user_id");
            if (temp_user_id) {
              const { data: updateTempUser, error: updateTempUserError } =
                await updateTempUserNftToRealId(
                  temp_user_id,
                  user.id,
                  userData.id
                );

              // delete temp user id in nft
              // const { data: deleteTempId, error: deleteTempIdError } =
              //   await deleteTempUserId(user.id);

              // Need to update storage bucket locations
              // And user details information
              const { data: tempNft, error: tempNftError } = await getTempNft(
                temp_user_id
              );

              /**
               * Need the file ids for the files that were uploaded
               * then get the file path from the file objects
               * then update the file path name to the new user id
               * then move them
               */
              let fileUpdatePromises: Promise<any>[] = [];

              if (tempNft.photo_file) {
                // get file path name
                const { oldName, newName } = await makeNewStorageFilename(
                  tempNft.photo_file,
                  temp_user_id,
                  user.id
                );
                if (oldName && newName) {
                  fileUpdatePromises.push(
                    moveFiles(oldName, newName, tempNft.photo_file)
                  );
                }
              }
              if (tempNft.og_photo_id) {
                // get file path name
                const { oldName, newName } = await makeNewStorageFilename(
                  tempNft.og_photo_id,
                  temp_user_id,
                  user.id
                );
                if (oldName && newName) {
                  fileUpdatePromises.push(
                    moveFiles(oldName, newName, tempNft.og_photo_id)
                  );
                }
              }
              if (tempNft.signature_file) {
                // get file path name
                const { oldName, newName } = await makeNewStorageFilename(
                  tempNft.signature_file,
                  temp_user_id,
                  user.id
                );
                if (oldName && newName) {
                  fileUpdatePromises.push(
                    moveFiles(oldName, newName, tempNft.signature_file)
                  );
                }
              }

              try {
                await Promise.all(fileUpdatePromises);
              } catch (err) {
                console.log(err);
              }

              // Delete the temp user id folder
              const { data: deleteFolder, error: deleteFolderError } =
                await supabase.storage.from("private").remove([temp_user_id]);

              // Update user details object for new user
              const { data: userDetails, error: userDetailsError } =
                await updateTempUserDetails(
                  user.id,
                  `${tempNft.first_name} ${tempNft.last_name}`
                );

              // unset cookie
              cookieCutter.set("temp_user_id", null, {
                expires: new Date(0),
              });
            }
          } else {
            localStorage.setItem("sign_up", "completed");
            userData = userDataCheck;
          }

          // Get user's public key
          if (user.id) {
            const keyRes = await fetch(`/api/admin/get-user-key`, {
              method: "POST",
              headers: new Headers({ "Content-Type": "application/json" }),
              credentials: "same-origin",
              body: JSON.stringify({
                user_id: user.id,
              }),
            })
              .then((response) => response.json())
              .catch((err) => console.log(err));

            if (keyRes.key) {
              this.publicKey = keyRes.key;
            }
          }

          // set user and fetch their NFT data.
          const { data, error } = await getUserNft(user.id);
          if (!error && data) {
            // check for files
            let nftPhoto = "";
            let nftSignature = "";
            if (data.photo_file) {
              const { file, error } = await getFileFromSupabase(
                data.photo_file
              );
              if (file) {
                //@ts-ignore
                nftPhoto = URL.createObjectURL(file);
              }
            }

            if (data.signature_file) {
              const { file } = await getFileFromSupabase(data.signature_file);
              if (file) {
                //@ts-ignore
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

            // After nft is set, check if user created an NFT without logging in
            // Then redirect
            // Check if user created an NFT without logging in here
            const temp_user_id = cookieCutter.get("temp_user_id");
            if (temp_user_id) {
              cookieCutter.set("alreadyCreatedRedirect", true, {
                path: "/",
                expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
              });
              // unset cookie
              cookieCutter.set("temp_user_id", null, {
                expires: new Date(0),
              });
            }
          } else {
            // no new user, create empty nftInput and keep nft as null
            this.setNewData(user, userData);
          }
        } else if (res.status === 401) {
          // check if there's a temp user id cookie
          // and load nft data from that cookie temp user id
          const temp_user_id = cookieCutter.get("temp_user_id");

          if (temp_user_id) {
            // temp user id exists, set field value
            this.setFieldValue("temp_user_id", temp_user_id);
          } else {
            // create temp user id
            const temp_user_id = uuidv4();
            cookieCutter.set("temp_user_id", temp_user_id, {
              path: "/",
              expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
            });
            this.setFieldValue("temp_user_id", temp_user_id);

            this.finishLoading();
            // no user
          }
        }
      } catch (err) {
        const temp_user_id = cookieCutter.get("temp_user_id");

        if (temp_user_id) {
          // temp user id exists, set field value
          this.setFieldValue("temp_user_id", temp_user_id);
        } else {
          // create temp user id
          const temp_user_id = uuidv4();
          cookieCutter.set("temp_user_id", temp_user_id, {
            path: "/",
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
          });
          this.setFieldValue("temp_user_id", temp_user_id);

          this.finishLoading();
        }
        // console.log({ err });
      }
    }
  };

  finishLoading = () => {
    this.loaded = true;
  };

  setTempNft(nftData: Nft, nftPhoto: string, nftSignature: string) {
    this.nft = new NftStore(nftData, this, nftPhoto, nftSignature);
    this.nftInput.setValues(nftData, "");
    this.loaded = true;
  }

  setInitialUserAndNft(
    nftData: Nft,
    user: any,
    nftPhoto: string,
    nftSignature: string,
    userDetails: UserDetails | null
  ) {
    const twitter = userDetails
      ? userDetails.twitter
        ? userDetails.twitter
        : ""
      : "";
    this.nft = new NftStore(nftData, this, nftPhoto, nftSignature);
    this.nftInput.setValues(nftData, twitter);
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
      this.nft?.graduation_year === this.nftInput?.graduation_year &&
      this.userDetails.twitter === this.nftInput?.twitter
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

  get stepSixSkip() {
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
    return this.nft?.mux_playback_id !== "" && this.nft?.mux_playback_id;
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
    // Check if creating an NFT for non logged in user
    if (!this.loggedIn) {
      const uuid = uuidv4();

      const { data, error } = await createNewTempNft({
        firstName: this.nftInput?.first_name,
        lastName: this.nftInput?.last_name,
        gradYear:
          this.nftInput?.graduation_year.length > 2
            ? this.nftInput?.graduation_year.slice(-2)
            : this.nftInput?.graduation_year,
        temp_user_id: uuid,
      });

      if (error) {
        alert(error.message);
        return false;
      } else {
        if (data) {
          this.nft = new NftStore(data[0], this);

          // save uuid data in cookie
          cookieCutter.set("temp_user_id", uuid, {
            path: "/",
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
          });
          return true;
        }
      }
    } else {
      const { data, error } = await createNewNft({
        firstName: this.nftInput?.first_name,
        lastName: this.nftInput?.last_name,
        gradYear:
          this.nftInput?.graduation_year.length > 2
            ? this.nftInput?.graduation_year.slice(-2)
            : this.nftInput?.graduation_year,
        user_id: this.id,
        user_details_id: this.userDetails.id,
      });

      const user_name = `${this.nftInput?.first_name} ${this.nftInput?.last_name}`;
      const { data: data2, error: error2 } = await updateUsername(
        user_name,
        this.userDetails.id
      );

      const { data: updateTwitterData, error: updateTwitterError } =
        await updateTwitter(
          this.nftInput.twitter.replace("@", ""),
          this.userDetails.id
        );

      if (error) {
        alert(error.message);
        return false;
      } else {
        if (data) {
          this.nft = new NftStore(data[0], this);
          this.userDetails.setFieldValue("user_name", user_name);
          this.userDetails.setFieldValue("twitter", this.nftInput.twitter);
          return true;
        } else {
          return false;
        }
      }
    }
  };
}

const userStore = new UserStore();
userStore.initUser();
export default userStore;
