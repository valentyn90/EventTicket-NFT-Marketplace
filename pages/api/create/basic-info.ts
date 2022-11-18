import { supabase } from "@/supabase/supabase-admin";
import type { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  //   const {data, error} = await supabase.from('contact').insert(
  //     req.body
  //   )
  const { user } = await supabase.auth.api.getUserByCookie(req);
  // console.log(req.body);
  let formData = req.body;

  let temp_user_id = uuidv4();

  if (formData.temp_user_id != "") {
    temp_user_id = formData.temp_user_id;
  }

  // Assuming User isn't signed in
  if (formData.nftId == "" && !user) {
    // Create new NFT
    const { data, error } = await supabase.from("nft").insert([
      {
        temp_user_id: temp_user_id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        graduation_year: formData.year.replace("'", ""),
        high_school: formData.school,
        usa_state: formData.state,
        sport: formData.sport,
        sport_position: formData.position,
        vfd_year: 2023,
      },
    ]);
    if (data) {
      return res.status(200).json({
        success: true,
        message: "Registered!",
        temp_user_id: temp_user_id,
        nft: data[0],
      });
    } else if (error) {
      return res.status(200).json({
        success: false,
        message: error.message,
        error: error.message,
      });
    }
    console.log(error);
  } else if (formData.nftId != "") {
    // update nft
    const { data, error } = await supabase
      .from("nft")
      .update([
        {
          first_name: formData.firstName,
          last_name: formData.lastName,
          graduation_year: formData.year.replace("'", ""),
          high_school: formData.school,
          usa_state: formData.state,
          sport: formData.sport,
          sport_position: formData.position,
          vfd_year: 2023,
        },
      ])
      .match({ id: formData.nftId });
    if (data) {
      return res.status(200).json({
        success: true,
        message: "Updated!",
        nft: data[0],
      });
    } else if (error) {
      return res.status(200).json({
        success: false,
        message: error.message,
        error: error.message,
      });
    }
    console.log(error);
  } else if (formData.nftId == "" && user) {
    // Create new NFT
    const { data, error } = await supabase.from("nft").insert([
      {
        first_name: formData.firstName,
        last_name: formData.lastName,
        graduation_year: formData.year.replace("'", ""),
        high_school: formData.school,
        usa_state: formData.state,
        sport: formData.sport,
        sport_position: formData.position,
        vfd_year: 2023,
        user_id: user.id,
      },
    ]);
    if (data) {
      return res.status(200).json({
        success: true,
        message: "Registered!",
        temp_user_id: temp_user_id,
        nft: data[0],
      });
    } else if (error) {
      return res.status(200).json({
        success: false,
        message: error.message,
        error: error.message,
      });
    }
    console.log(error);
  }

  //   if(data) {

  return res.status(200).json({ success: true, message: "Registered!" });
  // }
  //   else {
  //     return res.status(500).json({ message: "We already have your address" })
  //   }
}
