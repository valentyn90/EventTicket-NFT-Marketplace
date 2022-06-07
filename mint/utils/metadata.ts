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
  //TODO: Update mint size to be variable

  if (nft_details) {
    let metadata = {
      collection: {
        name: "VerifiedInk '22",
        family: "VerifiedInk",
      },
      name: `${nft_details.first_name} ${nft_details.last_name} #${serial_no}/10`,
      symbol: "VFDINK",
      description: `VerifiedInk is a self-issued NFT platform for athletes to easily
       capitalize on their Name, Image, and Likeness.
       This NFT was created personally by ${nft_details.first_name} ${nft_details.last_name}.
       Proceeds from the initial purchase of their mint go directly to them, and they earn a
       royalty on all subsequent sales.
       [https://verifiedink.us/card/${nft_details.id}?serial_no=${serial_no.toString()}](https://verifiedink.us/card/${nft_details.id}?serial_no=${serial_no.toString()})
       `,
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
          trait_type: "School",
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
          trait_type: "Id",
          value: nft_details.id,
        },
        {
          trait_type: "Edition",
          value: "Launch"
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
