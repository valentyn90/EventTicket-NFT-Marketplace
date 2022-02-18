import { supabase } from "@/supabase/supabase-admin";

import generateKeypair, { uploadImageToArweave } from "../mint";

export async function generateMetadata(nft_id: number, serial_no: number) {
  // Pull NFT details from supabase
  const { data: nft_details, error } = await supabase
    .from("nft")
    .select("*")
    .match({ id: nft_id })
    .maybeSingle();

  const { data: user_key, error: error2 } = await supabase
    .from("keys")
    .select("public_key")
    .match({ user_id: nft_details.user_id })
    .maybeSingle();

  let user_public_key = "";

  if (user_key) {
    user_public_key = user_key.public_key;
  } else {
    const { success, data, message } = await generateKeypair(
      nft_details.user_id
    );
    if (success && data) {
      user_public_key = data.public_key;
    } else {
      console.log(message);
      return null;
    }
  }

  console.log(user_public_key);

  const image = await uploadImageToArweave(nft_id, serial_no);

  const image_url = image.arweave_id;
  const verified_treasury_public_key =
    "DBfQBErRFtsuQZkae8tEFaoruRANyiVM6aPs2zuzsx3C";
  //TODO: Move to env variable

  if (nft_details) {
    let metadata = {
      collection: {
        name: "VerifiedInk '22",
        family: "VerifiedInk",
      },
      name: `VerifiedInk #${nft_details.id}`,
      symbol: "VFDINK",
      description: `${nft_details.first_name} ${nft_details.last_name}'s VerifiedInk.`,
      seller_fee_basis_points: 1000,
      image: image_url,
      external_url: `https://verifiedink.us/card/${nft_details.id}?serial_no=${serial_no.toString()}`,
      attributes: [
        {
          trait_type: "Name",
          value: `${nft_details.first_name} ${nft_details.last_name}`,
        },
        {
          trait_type: "Graduation Year",
          value: (nft_details.graduation_year + 2000).toString(),
        },
        {
          trait_type: "High School",
          value: nft_details.high_school,
        },
        {
          trait_type: "State",
          value: nft_details.usa_state,
        },
        {
          trait_type: "Sport",
          value: nft_details.sport,
        },
        {
          trait_type: "Position",
          value: nft_details.sport_position,
        },
        {
          trait_type: "Serial Number",
          value: serial_no.toString(),
        },
        {
          trait_type: "Edition",
          value: "1st Ink"
        },
        {
          trait_type: "Mint Size",
          value: "10"
        },
        {
          trait_type: "Verified Year",
          value: "2022"
        },
      ],
      properties: {
        category: "image",
        files: [
          {
            uri: image_url,
            type: "image/png",
          },
        ],
        creators: [
          {
            address: process.env.NEXT_PUBLIC_SOL_SERVICE_KEY_PUBLIC,
            share: 0,
          },
          {
            address: verified_treasury_public_key,
            share: 60,
          },
          {
            address: user_public_key,
            share: 40,
          },
        ],
      },
    };

    return { data: metadata };
  }

  return null;
}
