import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

interface Props {
  src?: any;
  previewOnly?: boolean;
}

export default function VideoPlayer({ src, previewOnly = false }: Props) {
  const videoRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  const videoSrc = `https://stream.mux.com/${src}.m3u8`;
  const safariSrc = `https://stream.mux.com/${src}/medium.mp4`;
  const imagePreview = `https://image.mux.com/${src}/thumbnail.png?width=400&height=400&fit_mode=preserve&time=1`;

  useEffect(() => {
    const video: any = videoRef.current;
    if (!video) return;

    video.controls = false;
    let hls: any;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // This checks for safari browsers and plays the mp4 since m3u8 is a bandwidth hog for looping videos in safar
      video.src = safariSrc;
    } else if (Hls.isSupported()) {
      // This will run in all other modern browsers
      hls = new Hls();
      hls.loadSource(videoSrc);
      hls.attachMedia(video);
    } else {
      // video.src = videoSrc;
      console.error(
        "This is an old browser that does not support MSE https://developer.mozilla.org/en-US/docs/Web/API/Media_Source_Extensions_API"
      );
    }

    return () => {
      setLoaded(true);
      if (hls) {
        hls.destroy();
      }
    };
  }, [videoSrc, videoRef, imagePreview]);

  let videoComponent = null;

  if (previewOnly) {
    videoComponent = <img src={imagePreview} />;
  } else {
    videoComponent = (
      <video
        className="background-video"
        id="player-video"
        ref={videoRef}
        playsInline
        autoPlay
        loop
        muted
      />
    );
  }

  return videoComponent;
}
