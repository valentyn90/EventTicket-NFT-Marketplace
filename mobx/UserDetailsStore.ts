import UserDetails from "@/types/UserDetails";
import { nanoid } from "nanoid";
import { makeAutoObservable } from "mobx";
import { UserStore } from "./UserStore";
import { createUserDetails, updateUsername } from "@/supabase/userDetails";
import {
  getReferringUser,
  updateReferringUser,
  updateUserReferredUser,
} from "@/supabase/recruit";

export class UserDetailsStore {
  store: UserStore;
  id = "";
  referral_code = "";
  verified_user = false;
  total_referred_users = 0;
  referring_user_id: string | null = "";
  user_name: string = "";
  email: string = "";
  twitter: string = "";
  role = "";

  resetValues() {
    this.id = "";
    this.referral_code = "";
    this.verified_user = false;
    this.total_referred_users = 0;
    this.referring_user_id = null;
    this.user_name = "";
    this.email = "";
    this.twitter = "";
    this.role = "";
  }

  constructor(store: UserStore) {
    makeAutoObservable(this);
    this.store = store;
  }

  setInitValues(input: UserDetails) {
    this.id = input.id;
    this.referral_code = input.referral_code || "";
    this.verified_user = input.verified_user as boolean;
    this.referring_user_id = input.referring_user_id || "";
    this.total_referred_users = input.total_referred_users || 0;
    this.user_name = input.user_name || "";
    this.email = input.email || "";
    this.twitter = input.twitter || "";
    this.role = input.role || "";
  }

  initSignUp = async (
    referral_code: string | null,
    user_id: string,
    email: string,
    twitter_username: string
  ) => {
    let referring_user = null;
    let verified_user = false;

    if (referral_code) {
      // Check to see which user supplied this code
      const { data, error } = await getReferringUser(referral_code);
      // and then update their db
      // +1 to referred users
      if (data) {
        if (data.referral_limit > data.total_referred_users) {
          let num_referred = data.total_referred_users;
          await updateReferringUser(data.id, num_referred + 1);
          referring_user = data.user_id;
          verified_user = true;
        }
      }
    }

    const generated_referral_code = nanoid(7);

    const { data, error } = await createUserDetails(
      user_id,
      generated_referral_code,
      referring_user,
      verified_user,
      email,
      twitter_username
    );
    if (data) {
      this.setInitValues(data);
    }
    if (error) {
      alert(error.message);
    }
  };

  setFieldValue = (field: string, value: any) => {
    // @ts-ignore
    this[field] = value;
  };

  updateReferringUserId = async (
    referral_code: string
  ): Promise<{ success: boolean; message: string }> => {
    // find user who owns referral code
    if (referral_code === this.referral_code) {
      return {
        success: false,
        message: "You cannot refer yourself.",
      };
    }
    try {
      const { data, error } = await getReferringUser(referral_code);
      if (data) {
        // check if their max user count is good
        if (data.referral_limit > data.total_referred_users) {
          // update current user's referring_user_id
          const { data: data2, error: error2 } = await updateUserReferredUser(
            this.id,
            data.user_id
          );

          this.setFieldValue("referring_user_id", data.user_id);

          // update referral code user's referral count
          const { data: data3, error: error3 } = await updateReferringUser(
            data.id,
            data.total_referred_users + 1
          );

          if (!error2 && !error3) {
            this.setFieldValue("verified_user", true);
            return {
              success: true,
              message: "Successfully entered referral code!",
            };
          } else {
            return {
              success: false,
              message: "There was an error with the server.",
            };
          }
        } else {
          return {
            success: false,
            message: "Referral code has reached its limit.",
          };
        }
      } else {
        return {
          success: false,
          message: "Referral code owner not found.",
        };
      }
    } catch (err) {
      console.log(err);
      return {
        success: false,
        message: "There was an error.",
      };
    }
  };

  updateUsername = async (user_name: string): Promise<boolean> => {
    const { data, error } = await updateUsername(user_name, this.id);

    if (!error) {
      this.setFieldValue("user_name", user_name);
      return true;
    } else {
      alert(error.message);
      return false;
    }
  };
}
