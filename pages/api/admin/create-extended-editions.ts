import Id from "@/pages/card/[id]";
import { supabase } from "@/supabase/supabase-admin";
import type { NextApiRequest, NextApiResponse } from "next";



function generateOwners(total_quantity: number, reserved: number, nft_id: number, user_id: string) {


  let owners = new Array(total_quantity).fill(0).map((_, i) => ({
    owner_id: i < (total_quantity - reserved) ? user_id : '348d305f-3156-44ec-98f6-5d052bea2aa8',
    nft_id: nft_id,
    serial_no: i + 1,
  }))

  return owners;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const original_nft = req.body.original_nft as string;

  const { data: nft, error } = await supabase.from("nft").select('*').eq('id', original_nft).single();

  if (nft) {

    let o_nft_id = parseInt(original_nft)
    // create 3 nfts with all of the same data
    let nfts = [{ ...nft }, { ...nft }, { ...nft }];

    delete nfts[0]['id'];
    delete nfts[1]['id'];
    delete nfts[2]['id'];
    nfts[0].edition_name = "Extended";
    nfts[0].edition_quantity = 42;
    nfts[0].edition_rarity = "Common";
    nfts[1].edition_name = "Extended";
    nfts[1].edition_quantity = 6;
    nfts[1].edition_rarity = "Rare";
    nfts[2].edition_name = "Extended";
    nfts[2].edition_quantity = 2;
    nfts[2].edition_rarity = "Legendary";

    console.log(nfts[2].edition_rarity, nfts[1].edition_rarity, nfts[0].edition_rarity)


    const { data: newNfts, error } = await supabase.from("nft").insert(nfts);

    const new_ids = newNfts?.map((nft) => nft.id);

    console.log(new_ids, o_nft_id)

    const drop = {
      player_name: nfts[0].first_name + " " + nfts[0].last_name,
      quantity_left: {
        "standard": 45,
        "premium": 9
      },
      nfts: new_ids,
      premium_nft: o_nft_id,
      price: {
        "standard": 20,
        "premium": 100
      },
      athlete_id: nft.user_id,
      utility_follow: false,
      utility_video: false,
      // today at 8:00pm EST
      drop_start: new Date().setHours(20, 0, 0, 0),
      drop_ended: true,
      extended_quantity: 50,
      percentage: 90,
    }

    const { data: newDrop, error: dropError } = await supabase.from("drop").insert(drop);

    // // delete original owners
    const { data: deletedOwners, error: ownerError } = await supabase.from("nft_owner").delete().eq('nft_id', original_nft);

    // create new owner records

    const original = generateOwners(10, 1, o_nft_id, nft.user_id)


    const common = generateOwners(42, 4, new_ids![0], nft.user_id)
    const rare = generateOwners(6, 1, new_ids![1], nft.user_id)
    const legendary = generateOwners(2, 0, new_ids![2], nft.user_id)

    //instert into nft_owner
    const { data: newOwners, error: newOwnerError } = await supabase.from("nft_owner").insert([...original, ...common, ...rare, ...legendary]);

    // update all nft_ids in nft with today's mint date
    const { data: updatedNfts, error: nftError } = await supabase.from("nft").update({ mint_datetime: new Date(), minted: true }).in('id', [o_nft_id, ...new_ids!]);

    // update launch nft to legendary
    const { data: updatedNft2, error: nftError2 } = await supabase.from("nft").update({ edition_rarity: "Legendary" }).eq('id', o_nft_id);


    return res.status(200).json({ success: true });


  }


  res.status(200).json({ success: false });

  return res;



}
