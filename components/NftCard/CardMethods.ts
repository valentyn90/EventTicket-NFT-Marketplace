import { SyntheticEvent, TouchEvent } from "react";

export const handleTouchEvent = (
  e: TouchEvent,
  lastY: number,
  lastX: number,
  setLastY: React.Dispatch<React.SetStateAction<number>>,
  setLastX: React.Dispatch<React.SetStateAction<number>>
) => {
  if (e.type === "touchend") {
    setLastX(-1);

    let res = 0;
    let y = Math.floor(lastY / 180);

    let min_val = lastY - y * 180;
    let max_val = (y + 1) * 180 - lastY;

    if (min_val < max_val) {
      res = y * 180;
    } else {
      res = (y + 1) * 180;
    }
    setLastY(res);
  } else if (lastX === -1) {
    setLastX(e.touches[0].clientX);
  } else {
    setLastY(lastY + e.touches[0].clientX - lastX);
    setLastX(e.touches[0].clientX);
  }
};

export const goFullscreen = (e: SyntheticEvent) => {
  e.stopPropagation();

  var el = document.getElementById("player-video");

  if (el?.requestFullscreen) {
    el.requestFullscreen();
    // @ts-ignore
  } else if (el?.webkitRequestFullScreen) {
    // @ts-ignore
    el.webkitRequestFullScreen();
  }
  //@ts-ignore
  else if (el?.webkitSupportsFullscreen) {
    //@ts-ignore
    el.webkitEnterFullscreen();
  }
};
