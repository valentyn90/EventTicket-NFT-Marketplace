import CropValue from "@/types/CropValue";
import Hls from "hls.js";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";

interface Props {
  src?: any;
  previewOnly?: boolean;
  max_resolution?: string | null;
  crop_values?: CropValue[];
  slow_video?: boolean;
}

interface StyleProps {
  crop_keyframes: string;
  video_length: number;
}

const Wrapper = styled.div`
  height: 100%;
  .mask-div {
    position: relative;
    width: 500px;
    height: 500px;
  }
`;

const dynamicKeyframes = (frames: string) => keyframes`
  ${frames}
`;

const CenteredVideo = styled.div<StyleProps>`
  animation: ${(props) => dynamicKeyframes(props.crop_keyframes)}
    ${(props) => props.video_length.toFixed(2)}s ease-in-out infinite;
  position: absolute;
  width: 500px;
  height: 100%;
`;

function VideoPlayer({
  src,
  previewOnly = false,
  max_resolution = "low",
  crop_values = [],
  slow_video = false,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLength, setVideoLength] = useState(50.827);
  const [videoWidth, setVideoWidth] = useState(500);
  const [loaded, setLoaded] = useState(false);
  const [cropKeyframes, setCropKeyframes] = useState("");
  const router = useRouter();

  const videoSrc = `https://stream.mux.com/${src}.m3u8`;
  var safariSrc = `https://stream.mux.com/${src}/${max_resolution}.mp4`;
  const imagePreview = `https://image.mux.com/${src}/thumbnail.png?width=400&height=400&fit_mode=preserve&time=1`;

  function handleVideoMetadataLoaded() {
    if (videoRef.current) {
      setVideoLength(videoRef.current.duration);
      setVideoWidth(videoRef.current.offsetWidth);
      if (slow_video) {
        videoRef.current.playbackRate = 0.75;
      }
    }
  }

  function cropValuesToKeyframes(cropValues: CropValue[], videoWidth: number) {
    return cropValues
      .map((val: CropValue) => {
        return `${val.percent_playback}% { left: -${
          val.percent_offset * videoWidth
        }px; }\n`;
      })
      .join()
      .replace(/,/g, "");
  }

  useEffect(() => {
    if (crop_values.length > 0) {
      setCropKeyframes(cropValuesToKeyframes(crop_values, videoWidth));
    }
  }, [crop_values, videoWidth]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (router.pathname.includes("create/step")) {
      // mp4 only
      // safariSrc = videoSrc;
    }
    video.controls = false;
    let hls: any;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // This checks for safari browsers and plays the mp4 since m3u8 is a bandwidth hog for looping videos in safari

      if (safariSrc != "https://stream.mux.com//.mp4") {
        video.src = safariSrc;
      }
    } else if (
      Hls.isSupported() &&
      videoSrc != "https://stream.mux.com/.m3u8"
    ) {
      // mp4 only
      // This will run in all other modern browsers
      // hls = new Hls();
      // hls.loadSource(videoSrc);
      // hls.attachMedia(video);
      video.src = safariSrc
    } else if (videoSrc != "https://stream.mux.com/.m3u8") {
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
  }, [
    videoSrc,
    videoRef,
    imagePreview,
    cropKeyframes,
    crop_values,
    slow_video,
    videoWidth,
  ]);

  let videoComponent = null;

  if (previewOnly) {
    videoComponent = <img src={imagePreview} />;
  } else if (cropKeyframes !== "") {
    videoComponent = (
      <Wrapper>
        <div className="mask-div">
          <CenteredVideo
            crop_keyframes={cropKeyframes}
            video_length={videoLength}
          >
            <video
              onLoadedMetadata={handleVideoMetadataLoaded}
              className="background-video"
              id="player-video"
              ref={videoRef}
              playsInline
              autoPlay
              loop
              muted
            />
          </CenteredVideo>
        </div>
      </Wrapper>
    );
  } else {
    videoComponent = (
      <video
        className="background-video-centered"
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

export default VideoPlayer;
