export async function handleRecruitClick(id: number | undefined) {
  const share_link = "https://verifiedink.us/card/" + id;

  const shareData = {
    title: "VerifiedInk",
    text: "Checkout this Verified Ink",
    url: share_link,
  };

  if (navigator.share === undefined) {
    const ta = document.createElement("textarea");
    ta.textContent = share_link;
    document.body.appendChild(ta);
    var selection = document.getSelection();
    var range = document.createRange();
    range.selectNode(ta)
    selection?.removeAllRanges();
    selection?.addRange(range)
    // ta.select();
    document.execCommand("copy");
    ta.remove();
    alert("link has been copied to your clipboard");
  } else {
    try {
      await navigator.share(shareData);
    } catch (err) { }
  }
}
