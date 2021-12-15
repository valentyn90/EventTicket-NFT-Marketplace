import CropValue from "@/types/CropValue";
import Nft from "@/types/Nft";
import { supabase } from "./supabase-client";

export const getAllNfts = async (range: number) => {
  const { data, error } = await supabase
    .from("nft")
    .select(
      `*,
     user_details ( verified_user, id ),
     files:screenshot_file_id (file_name)`
    )
    .order("id", { ascending: false })
    .range(range, range + 50);
  if (data) return data;
  else {
    console.log(error);
    return [];
  }
};

export const adminUpdateNft = async (nft_id: number, input: Nft) =>
  supabase
    .from("nft")
    .update([
      {
        first_name: input.first_name,
        last_name: input.last_name,
        high_school: input.high_school,
        graduation_year: input.graduation_year,
        quotes: input.quotes,
        sport: input.sport,
        sport_position: input.sport_position,
        usa_state: input.usa_state,
      },
    ])
    .match({ id: nft_id });

export const addAdminFeedback = async (nft_id: number, feedback: string) =>
  supabase
    .from("nft")
    .update([
      {
        admin_feedback: feedback,
        approved: false,
      },
    ])
    .match({ id: nft_id });

export const verifyUserAndRecruits = async (user_id: string) => {
  // find all recruits
  const { data: recruits, error } = await supabase
    .from("user_details")
    .select("id")
    .eq("referring_user_id", user_id);

  if (error) {
    console.log(error);
  }

  if (recruits) {
    if (recruits.length > 0) {
      const verifyPromises: any = [];

      recruits.forEach((recruit) =>
        verifyPromises.push(
          new Promise((res, rej) => {
            supabase
              .from("user_details")
              .update([
                {
                  verified_user: true,
                },
              ])
              .match({ id: recruit.id })
              .then(({ data, error }) => {
                if (data) res(data);
                if (error) rej(error);
              });
          })
        )
      );

      verifyPromises.push(
        new Promise((res, rej) => {
          supabase
            .from("user_details")
            .update([
              {
                verified_user: true,
              },
            ])
            .match({ user_id })
            .then(({ data, error }) => {
              if (data) res(data);
              if (error) rej(error);
            });
        })
      );

      try {
        await Promise.all(verifyPromises);
        return true;
      } catch (err) {
        console.log(err);
        return false;
      }
    } else {
      const { data: data2, error: error2 } = await supabase
        .from("user_details")
        .update([
          {
            verified_user: true,
          },
        ])
        .match({ user_id });
      if (data2) {
        return true;
      } else if (error2) {
        console.log(error2);
        return false;
      }
    }
  }
};

export const mintNft = async (nft_id: number, user_id: string) => {
  const { data, error } = await supabase
    .from("nft")
    .update([
      {
        minted: true,
        mint_datetime: new Date(Date.now()).toISOString(),
      },
    ])
    .match({ id: nft_id });

  const { data: data2, error: error2 } = await supabase
    .from("nft_owner")
    .insert([
      {
        nft_id,
        owner_id: user_id,
      },
    ]);

  return true;
};

export const getCropVideoData = (nft_id: number) =>
  supabase
    .from("nft")
    .select("mux_playback_id, crop_values, slow_video")
    .eq("id", nft_id)
    .single();

export const saveCropVideoData = (
  nft_id: number,
  crop_values: CropValue[],
  slow_video: boolean
) =>
  supabase
    .from("nft")
    .update([
      {
        crop_values,
        slow_video,
      },
    ])
    .match({ id: nft_id });

export const getMuxPlaybackId = (id: number) =>
  supabase
    .from("nft")
    .select("mux_playback_id, mux_asset_id")
    .eq("id", id)
    .single();

export const updateMuxValues = (
  nft_id: number,
  asset_id: string | null,
  playback_id: string | null,
  mux_max_resolution: string | null
) =>
  supabase
    .from("nft")
    .update([
      {
        mux_asset_id: asset_id,
        mux_playback_id: playback_id,
        mux_max_resolution,
      },
    ])
    .match({ id: nft_id });
