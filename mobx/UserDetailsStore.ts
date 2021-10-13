import UserDetails from "@/types/UserDetails";
import { nanoid } from "nanoid";
import { makeAutoObservable } from "mobx";
import { UserStore } from "./UserStore";
import {
  createUserDetails,
  getReferringUser,
  updateReferringUser,
  updateUserReferredUser,
} from "@/utils/supabase-client";

export class UserDetailsStore {
  store: UserStore;
  details_id = "";
  referral_code = "";
  verified = false;
  total_referred_users = 0;
  referring_user_id: string | null = "";

  constructor(store: UserStore) {
    makeAutoObservable(this);
    this.store = store;
  }

  setInitValues(input: UserDetails) {
    this.details_id = input.id;
    this.referral_code = input.referral_code || "";
    this.verified = input.verified as boolean;
    this.referring_user_id = input.referring_user_id || "";
    this.total_referred_users = input.total_referred_users || 0;
  }

  initSignUp = async (referral_code: string | null, user_id: string) => {
    let referring_user = null;

    if (referral_code) {
      // Check to see which user supplied this code
      const { data, error } = await getReferringUser(referral_code);
      // and then update their db
      // +1 to referred users
      if (data) {
        let num_referred = data.total_referred_users;
        await updateReferringUser(data.id, num_referred + 1);
      }

      referring_user = data.user_id;
    }

    const generated_referral_code = nanoid(7);

    const { data, error } = await createUserDetails(
      user_id,
      generated_referral_code,
      referring_user
    );
    if (data) {
      this.setInitValues(data[0]);
    }
  };

  setFieldValue = (field: string, value: any) => {
    // @ts-ignore
    this[field] = value;
  };

  updateReferringUserId = async (referral_code: string) => {
    // find user who owns referral code
    try {
      const { data, error } = await getReferringUser(referral_code);
      if (data && !error) {
        // update current user's referring_user_id
        const { data: data2, error: error2 } = await updateUserReferredUser(
          this.details_id,
          data.user_id
        );

        this.setFieldValue("referring_user_id", data.user_id);

        // update referral code user's referral count
        const { data: data3, error: error3 } = await updateReferringUser(
          data.id,
          data.total_referred_users + 1
        );

        if (!error2) {
          return true;
        } else {
          return false;
        }
      }
      return false;
    } catch (err) {
      alert(err);
      return false;
    }
  };

  resetValues() {
    this.details_id = "";
    this.referral_code = "";
    this.verified = false;
    this.total_referred_users = 0;
    this.referring_user_id = null;
  }
}
