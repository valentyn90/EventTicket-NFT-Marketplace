import { Template } from "@/components/Navbar/Navbar";
import { getFileLinkFromSupabase, getNftById } from "@/supabase/supabase-client";
import { supabase } from "../../../supabase/supabase-admin";

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export async function sendLoginMail(email: string, magic_link: string) {
  let template_id = 'd-da5928d99bf84a23b78a16c4b5b18480'

  const msg = {
    to: email,
    from: 'VerifiedInk@verifiedink.us',
    reply_to: 'Support@verifiedink.us',
    template_id: template_id,
    dynamic_template_data: {
      magic_link
    }
  }

  await sgMail
    .send(msg)
    .then(() => {
      return { "success": true }
    })
    .catch((error: any) => {
      console.log(error)
      return{ "success": true }
    })

    return {"success": true}

}

export async function sendPurchaseMail(email: string, nft_id: string, sn: string, card_preview_image: string) {
  let template_id = 'd-e93510ea4bed4c8da540c318bcf320b2'

  const msg = {
    to: email,
    from: 'VerifiedInk@verifiedink.us',
    reply_to: 'Support@verifiedink.us',
    template_id: template_id,
    dynamic_template_data: {
      nft_id,
      sn,
      card_preview_image,
      email
    }
  }

  await sgMail
    .send(msg)
    .then(() => {
      return { "success": true }
    })
    .catch((error: any) => {
      console.log(error)
      return{ "success": true }
    })

}

export async function sendSaleMail(user_id: string, nft_id: string, sn: string, card_preview_image: string, price: string) {
  let template_id = 'd-97a66a1035544e4faefa2e0b4a0c6505'

  console.log(`user_id: ${user_id}`)
  const user_details = await supabase.from("user_details").select("*").eq("user_id", user_id).maybeSingle();

  const email = user_details.data.email;
  console.log(`Seller: ${email}`)

  const msg = {
    to: email,
    from: 'VerifiedInk@verifiedink.us',
    reply_to: 'Support@verifiedink.us',
    bcc: 'MarketplaceSales@verifiedink.us',
    template_id: template_id,
    dynamic_template_data: {
      nft_id,
      sn,
      card_preview_image,
      email,
      price
    }
  }

  await sgMail
    .send(msg)
    .then(() => {
      return { "success": true }
    })
    .catch((error: any) => {
      console.log(error)
      return{ "success": true }
    })

}

async function sendMail(nft_id: number = 96, template: string = 'minted') {
  let template_id = 'd-85742d2075cd45c09ba724458879bfde'

  switch (template) {
    case 'created':
      template_id = 'd-85742d2075cd45c09ba724458879bfde'
      break;

    case 'abandoned':
      template_id = 'd-4e87b768aa944f4d99283201add97798'
      break;

    case 'minted':
      template_id = 'd-bc100d0f0a32499889ac886b438177a4'
      break;

    case 'changes_required':
      template_id = 'd-9f811b49af654940b986d40ee41e6cbe'
  }

  const { data, error } = await getNftById(nft_id);

  const user_details = await supabase.from("user_details").select("*").eq("user_id", data.user_id).maybeSingle();

  const { publicUrl, error: error2 } = await getFileLinkFromSupabase(data.screenshot_file_id);

 
  const msg = {
    to: user_details.data.email,
    from: 'Nate@verifiedink.us',
    reply_to: 'Support@verifiedink.us',
    template_id: template_id,
    dynamic_template_data: {
      user_name: data.first_name,
      nft_id: nft_id.toString(),
      card_preview_image: publicUrl,
      recruit_link: `https://verifiedink.us/create?referralCode=${user_details.data.referral_code}`,
      share_link: `https://verifiedink.us/share?referralCode=${user_details.data.referral_code}`
    }
  }

  sgMail
    .send(msg)
    .then(() => {
      return JSON.stringify({ "success": true })
    })
    .catch((error: any) => {
      console.error(error)
      return JSON.stringify({ "error": error })
    })

}

export default sendMail;
