import { supabase } from "@/supabase/supabase-admin";
import makeNewStorageFilename from "@/utils/makeNewStorageFilename";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { temp_user_id, user_id, user_details_id } = req.body;


  // ensure the nft isn't already owned by someone else
  const { data: nft, error: nftError } = await supabase.
    from("nft")
    .select("*")
    .is('user_id', null)
    .eq('temp_user_id', temp_user_id)
    .maybeSingle();
  
    if(!nft){
      return res.status(200).json({success:true, message:"NFT already owned"})
    }

  // update nft user ids
  const { data, error } = await supabase
    .from("nft")
    .update([
      {
        user_id,
        user_details_id,
      },
    ])
    .match({ temp_user_id });
    
  if (error) {

    return res.status(200).json({
      success: false,
      message: error.message,
    });
  }

  // get nft
  const { data: tempNft, error: tempNftError } = await supabase
    .from("nft")
    .select("*")
    .eq("temp_user_id", temp_user_id)
    .maybeSingle();

  if (tempNftError) {
    return res.status(200).json({
      success: false,
      message: "There was an error finding your NFT.",
    });
  }

  // update file data
  let fileUpdatePromises: Promise<any>[] = [];

  if (tempNft.photo_file) {
    // get file path name
    const { oldName, newName } = await makeNewStorageFilename(
      tempNft.photo_file,
      temp_user_id,
      user_id
    );
    if (oldName && newName) {
      fileUpdatePromises.push(moveFiles(oldName, newName, tempNft.photo_file));
    }
  }
  if (tempNft.og_photo_id) {
    // get file path name
    const { oldName, newName } = await makeNewStorageFilename(
      tempNft.og_photo_id,
      temp_user_id,
      user_id
    );
    if (oldName && newName) {
      fileUpdatePromises.push(moveFiles(oldName, newName, tempNft.og_photo_id));
    }
  }
  if (tempNft.signature_file) {
    // get file path name
    const { oldName, newName } = await makeNewStorageFilename(
      tempNft.signature_file,
      temp_user_id,
      user_id
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
  const { data: userDetails, error: userDetailsError } = await supabase
    .from("user_details")
    .update([
      {
        user_name: `${tempNft.first_name} ${tempNft.last_name}`,
      },
    ])
    .match({ user_id });

  return res.status(200).json({
    success: true,
    message: "Succesfully created an account with your email.",
    nft: data
  });
}

const moveFiles = async (from: string, to: string, file_id: number) => {
  return new Promise(async (res, rej) => {
    const { data: move, error: moveError } = await supabase.storage
      .from("private")
      .move(from, to);

    // update file object filename
    const { data, error } = await supabase
      .from("files")
      .update([
        {
          file_name: to,
        },
      ])
      .match({ id: file_id });

    if (move && data) {
      res(true);
    } else {
      rej(false);
    }
  });
};
