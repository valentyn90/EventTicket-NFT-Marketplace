export async function handleRecruitClick(referralCode: string) {
  let referralString = referralCode ? `?referralCode=${referralCode}` : "";
  const share_link = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/create${referralString}`;

  const shareData = {
    title: "VerifiedInk",
    text: "Check out this NFT I made with @VfdInk. Just for athletes. I get paid every single time it sells. Here's a referral link if you want to make your own.",
    url: share_link,
  };

  if (navigator.share === undefined) {
    const ta = document.createElement("textarea");
    ta.innerText = share_link;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    return "Clipboard";
  } else {
    try {
      await navigator.share(shareData);
    } catch (err) {}
  }
}
