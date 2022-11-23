import { Template } from "@/components/Navbar/Navbar";
import { getFileLinkFromSupabase, getNftById, getScreenshot } from "@/supabase/supabase-client";
import { getUserDetailsByEmail } from "@/supabase/userDetails";
import { supabase } from "../../../supabase/supabase-admin";
import events from "@/components/Events/events.json";
import { eventTabs } from "@/components/Events/utils/tier"
import moment from "moment";


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
      return { "success": true }
    })

  return { "success": true }

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
      return { "success": true }
    })

}

export async function sendDropPurchaseMail(user_id: string, quantity: number, price: number, drop_id: number) {
  let template_id = 'd-f6de04a4190540e897b4b8fa27f682ad'

  const user_details = await supabase.from("user_details").select("*").eq("user_id", user_id).maybeSingle();

  const email = user_details.data.email;

  const total_price = price * quantity;

  const msg = {
    to: email,
    from: 'VerifiedInk@verifiedink.us',
    reply_to: 'Support@verifiedink.us',
    bcc: 'MarketplaceSales@verifiedink.us',
    template_id: template_id,
    dynamic_template_data: {
      price,
      quantity,
      total_price,
      email,
    }
  }

  await sgMail
    .send(msg)
    .then(() => {
      return { "success": true }
    })
    .catch((error: any) => {
      console.log(error)
      return { "success": true }
    })

}

export async function sendGenericDropPurchaseMail(user_id: string, quantity: number, price: number, drop_id: number, nft_type: string) {
  let template_id = 'd-40fff40051ce46298d1c45978b3fec1d'

  const user_details = await supabase.from("user_details").select("*").eq("user_id", user_id).maybeSingle();

  const { data: drop } = await supabase.from("drop").select("*").eq("id", drop_id).maybeSingle();

  const email = user_details.data.email;

  const total_price = price * quantity;

  const premiumScreenshot = await getScreenshot(drop.premium_nft);
  const standardScreenshot = await getScreenshot(drop.nfts[0]);

  let imageLink = ""
  nft_type === "standard" ? imageLink = standardScreenshot.publicUrl || 'https://verifiedink.us/img/header' : imageLink = premiumScreenshot.publicUrl || 'https://verifiedink.us/img/header';

  const msg = {
    to: email,
    from: 'VerifiedInk@verifiedink.us',
    reply_to: 'Support@verifiedink.us',
    bcc: 'Aaron@verifiedink.us',
    template_id: template_id,
    dynamic_template_data: {
      price,
      quantity,
      total_price,
      email,
      drop_id,
      athlete_name: drop.player_name.split(" ")[0],
      card_preview_image: imageLink
    }
  }

  await sgMail
    .send(msg)
    .then(() => {
      return { "success": true }
    })
    .catch((error: any) => {
      console.log(error)
      return { "success": true }
    })

}

export async function sendARGiftMail(email: string, purchaser_email: string) {
  let template_id = 'd-a898ab5aeb8541298ab738857d7e4daa'

  const msg = {
    to: email,
    from: 'VerifiedInk@verifiedink.us',
    reply_to: 'Support@verifiedink.us',
    bcc: 'aaron@verifiedink.us',
    template_id: template_id,
    dynamic_template_data: {
      purchaser_email,
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
      return { "success": true }
    })

}


export async function sendARPurchaseMail(user_id: string, quantity: number, price: number, nft_id: number, customer_email: string) {
  let template_id = 'd-bb5733c1ab614d7e97628fa96cfff374'

  let email = customer_email;
  if (user_id) {
    const user_details = await supabase.from("user_details").select("*").eq("user_id", user_id).maybeSingle();
    email = user_details.data.email;
  }

  const msg = {
    to: email,
    from: 'VerifiedInk@verifiedink.us',
    reply_to: 'Support@verifiedink.us',
    bcc: 'aaron@verifiedink.us',
    template_id: template_id,
    dynamic_template_data: {
      price,
      quantity,
      email,
      nft_id
    }
  }

  await sgMail
    .send(msg)
    .then(() => {
      return { "success": true }
    })
    .catch((error: any) => {
      console.log(error)
      return { "success": true }
    })

}


export async function sendTicketMail(order_id: number) {
  let template_id = 'd-a1647c1f7dd747b8949fc2b76e5804d4'

  //Lookup everything from the order_id

  const { data: order } = await supabase.from("event_credit_card_sale").select("*").eq("id", order_id).maybeSingle();

  console.log(order)
  // get tier data
  const tier = eventTabs.find((tab: { id: any; }) => tab.id === order.tier_id);

  //hard code event
  const event = events[0]


  const msg = {
    to: order.email,
    from: 'VerifiedInk@verifiedink.us',
    reply_to: 'Support@verifiedink.us',
    bcc: 'aaron+tickets@verifiedink.us',
    template_id: template_id,
    dynamic_template_data: {
      price: order.price,
      quantity: order.quantity,
      total_price: order.price * order.quantity,
      email: order.email,
      event: event.event_name,
      tier: tier!.name,
      event_venue: event.event_venue_name,
      event_street: event.event_street,
      event_city: event.event_city,
      event_state: event.event_state,
      event_start: moment(event.event_start).format("MMM DD, YYYY h:mm a")
    }
  }

  await sgMail
    .send(msg)
    .then(() => {
      return { "success": true }
    })
    .catch((error: any) => {
      console.log(error.response.body.errors)
      return { "success": true }
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
      return { "success": true }
    })

}

export async function sendAuctionLoserMail(loser_id: string, auction_id: string) {
  let template_id = 'd-e4a1305bcdc54dfc92d1aeb550468164'

  const user_details = await supabase.from("user_details").select("*").eq("user_id", loser_id).maybeSingle();
  const email = user_details.data.email;

  const auction_data = await supabase.from("auction").select("*").eq("id", auction_id).maybeSingle();

  const nft_owner_id = auction_data.data.items[0];

  const nft_id = await supabase.from("nft_owner").select("*").eq("id", nft_owner_id).maybeSingle();

  const preview_url = await getScreenshot(nft_id.data.nft_id);

  const msg = {
    to: email,
    from: 'VerifiedInk@verifiedink.us',
    reply_to: 'Support@verifiedink.us',
    bcc: 'Auctions@verifiedink.us',
    template_id: template_id,
    dynamic_template_data: {
      auction_id,
      headline: auction_data.data.headline,
      preview_url: preview_url.publicUrl,
      email,
    }
  }

  await sgMail
    .send(msg)
    .then(() => {
      return { "success": true }
    })
    .catch((error: any) => {
      console.log(error)
      return { "success": true }
    })




}

export async function sendAddressMail(email: string) {

  const msg = {
    to: email,
    from: 'VerifiedInk@verifiedink.us',
    reply_to: 'Support@verifiedink.us',
    template_id: "d-ffa32fea50c44bd0b26ce31186b9804a",
    dynamic_template_data: {
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
      return { "success": true }
    })
}



export async function sendFanChallengeEmail(email: string, order_id: string) {

  const { data: userData, error: userError } = await getUserDetailsByEmail(email);

  if (userData) {
    const user_id = userData.user_id;

    const { data: order } = await supabase.from('fan_challenge_orders')
      .select(`*, fan_challenge(*), school(*)`).eq('id', order_id).maybeSingle();

    if (order) {
      const msg = {
        to: email,
        from: 'VerifiedInk@verifiedink.us',
        reply_to: 'Support@verifiedink.us',
        bcc: 'aaron@verifiedink.us',
        template_id: "d-d922c27e53774d6cbe2186059b29bdf4",
        dynamic_template_data: {
          email,
          price: order.fan_challenge.price,
          quantity: order.quantity,
          nft_id: order.fan_challenge.nfts[0].nft_id,
          fc_id: order.fc_id,
          athlete_name: order.fan_challenge.name,
          order_id,
          team: order.school.school,
          sport: order.fan_challenge.sport,
          team_id: order.team_id,
        }
      }

      await sgMail
        .send(msg)
        .then(() => {
          return { "success": true }
        })
        .catch((error: any) => {
          console.log(error)
          return { "success": true }
        })
    }
  }
}

export async function sendDropAuctionMail(user_id: string, auction_id: string, bid_amount: string, bid_team_id: string) {
  await sendAuctionMail(user_id, auction_id, bid_amount, bid_team_id, "d-ff378896d08b4232bb675c028368c121");
}

export async function sendAuctionMail(user_id: string, auction_id: string, bid_amount: string, bid_team_id: string, template_id: string = 'd-e4a1305bcdc54dfc92d1aeb550468164') {

  const user_details = await supabase.from("user_details").select("*").eq("user_id", user_id).maybeSingle();
  const email = user_details.data.email;

  const auction_data = await supabase.from("auction").select("*").eq("id", auction_id).maybeSingle();

  const nft_owner_id = auction_data.data.items[0];

  const nft_id = await supabase.from("nft_owner").select("*").eq("id", nft_owner_id).maybeSingle();

  const preview_url = await getScreenshot(nft_id.data.nft_id);

  const school = await supabase.from("school").select("*").eq("id", bid_team_id).maybeSingle();


  const msg = {
    to: email,
    from: 'VerifiedInk@verifiedink.us',
    reply_to: 'Support@verifiedink.us',
    bcc: 'Auctions@verifiedink.us',
    template_id: template_id,
    dynamic_template_data: {
      auction_id,
      headline: auction_data.data.headline,
      team_id: bid_team_id,
      preview_url: preview_url.publicUrl,
      email,
      school: school.data.school,
      bid_amount
    }
  }

  await sgMail
    .send(msg)
    .then(() => {
      return { "success": true }
    })
    .catch((error: any) => {
      console.log(error)
      return { "success": true }
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
