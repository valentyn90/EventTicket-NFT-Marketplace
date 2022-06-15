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
