import { supabase } from "@/supabase/supabase-client";

export async function handleRecruitClick(
  id: number | undefined,
  serial_no?: number,
  sale?: boolean
) {
  let share_link = "https://verifiedink.us/card/" + id;
  if (serial_no) {
    share_link += `?serial_no=${serial_no}`;
  }

  let share_text = "👀  Checkout this VerifiedInk"
  if(sale) {
    share_text = '👀 Checkout my VerifiedInk. I\'ve partnered with @VfdInk to design and release my own limited edition NFT. Pick one up before I\'m sold out!'
  }


  const shareData = {
    title: "VerifiedInk",
    text: share_text,
    url: share_link,
  };

  if (navigator.share === undefined) {
    const ta = document.createElement("textarea");
    ta.textContent = share_text + '\n' + share_link;
    document.body.appendChild(ta);
    var selection = document.getSelection();
    var range = document.createRange();
    range.selectNode(ta);
    selection?.removeAllRanges();
    selection?.addRange(range);
    // ta.select();
    document.execCommand("copy");
    ta.remove();
    return "Clipboard";
  } else {
    try {
      return new Promise((resolve) => {
        navigator
          .share(shareData)
          .then((res) => resolve("Link copied to clipboard."))
          .catch((err) => resolve(err));
      });
    } catch (err) {}
  }
}

export async function handleAuctionClick(
  auction_id: number | undefined,
  team_id?: number,
  nft_id?: boolean
) {
  let share_link = `https://verifiedink.us/auction/${auction_id}`;
  if (team_id) {
    share_link += `?team_id=${team_id}`;
  }

  let share_text = "👀 Checkout this Auction for the Ultimate Rookie NFT."

  const {data, error} = await supabase.from('school').select('school').match({id: team_id}).single()

  if(data && team_id) {
    console.log(data || error)
    share_text = `👀 Checkout this auction for one of our top recruit's Rookie NFT. Let's get ${data.school} to the top of his list!`
  }


  const shareData = {
    title: "VerifiedInk Auctions",
    text: share_text,
    url: share_link,
  };

  if (navigator.share === undefined) {
    const ta = document.createElement("textarea");
    ta.textContent = share_text + '\n' + share_link;
    document.body.appendChild(ta);
    var selection = document.getSelection();
    var range = document.createRange();
    range.selectNode(ta);
    selection?.removeAllRanges();
    selection?.addRange(range);
    // ta.select();
    document.execCommand("copy");
    ta.remove();
    return "Clipboard";
  } else {
    try {
      return new Promise((resolve) => {
        navigator
          .share(shareData)
          .then((res) => resolve("Link copied to clipboard."))
          .catch((err) => resolve(err));
      });
    } catch (err) {}
  }
}
