import { useEffect, useRef } from "react";
import Hls from "hls.js";

interface Props {
  src?: any;
  previewOnly?: boolean;
}

export default function VideoPlayer({ src, previewOnly = false }: Props) {
  const videoRef = useRef(null);

  const videoSrc = `https://stream.mux.com/${src}.m3u8`;

  useEffect(() => {
    const video: any = videoRef.current;
    if (!video) return;
    if (previewOnly) {
      video.controls = false;
    } else {
      video.controls = true;
    }
    let hls: any;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // This will run in safari, where HLS is supported natively
      video.src = videoSrc;
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
      if (hls) {
        hls.destroy();
      }
    };
  }, [videoSrc, videoRef]);

  let videoComponent = null;

  if (previewOnly) {
    videoComponent = <video ref={videoRef} preload="none" muted />;
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
