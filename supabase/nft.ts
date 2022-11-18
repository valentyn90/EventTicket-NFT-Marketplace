import AsyncMethodReturn from "@/types/AsyncMethodReturn";
import Nft from "@/types/Nft";
import StepOneInput from "@/types/StepOneInput";
import { supabase } from "./supabase-client";

export const stepOneSubmit = async (
  input: StepOneInput,
  nft: Nft | null,
  user_id: string,
  user_details_id: string
): Promise<AsyncMethodReturn> => {
  /**
   * if null then create a new nft
   * if not then update existing nft
   */

  if (nft) {
    // check if values are the same, if not then update
    if (
      input.firstName === nft.first_name &&
      input.lastName === nft.last_name &&
      input.school === nft.high_school &&
      input.state === nft.usa_state &&
      input.year === nft.graduation_year &&
      input.position == nft.sport_position &&
      input.sport === nft.sport
    ) {
      return {
        success: true,
        message: "",
      };
    } else {
      const { data, error } = await supabase
        .from("nft")
        .update([
          {
            first_name: input.firstName,
            last_name: input.lastName,
            high_school: input.school,
            usa_state: input.state,
            graduation_year: input.year,
            sport_position: input.position,
            sport: input.sport,
          },
        ])
        .match({ id: nft.id });

      if (data) {
        return {
          success: true,
          message: "",
        };
      } else {
        return {
          success: false,
          message: error?.message || "There was an error.",
        };
      }
    }
  } else {
    const { data, error } = await supabase.from("nft").insert([
      {
        first_name: input.firstName,
        last_name: input.lastName,
        high_school: input.school,
        usa_state: input.state,
        graduation_year: input.year,
        sport_position: input.position,
        sport: input.sport,
        user_id,
        user_details_id,
      },
    ]);

    if (data) {
      return {
        success: true,
        message: "",
      };
    } else {
      return {
        success: false,
        message: error?.message || "There was an error.",
      };
    }
  }
};
