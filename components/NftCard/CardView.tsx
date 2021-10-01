import userStore from "@/mobx/UserStore";
import { getFileFromSupabase, getNftById } from "@/utils/supabase-client";
import { observer } from "mobx-react-lite";
import Head from "next/head";
import React, { CSSProperties, TouchEvent, useEffect, useState } from "react";
import { RiFullscreenLine } from "react-icons/ri";
import { goFullscreen, handleTouchEvent } from "./CardMethods";
import { CardWrapper } from "./CardStyles";

interface Props {
  nft_id?: number | undefined;
  nft_width?: number | undefined;
  reverse?: boolean | undefined;
}

const CardView: React.FunctionComponent<Props> = ({
  nft_id = 36,
  nft_width = 400,
  reverse = false,
}) => {
  const [nftCardData, setNftCardData] = useState({
    photo: "",
    video: "https://linsky-planck.s3.amazonaws.com/hudson2.mp4",
    high_school: "",
    signature: "",
    first_name: "",
    last_name: "",
    sport: "",
    sport_position: "",
    state: "",
    graduation_year: "",
  });

  async function getCardData() {
    const { data, error } = await getNftById(nft_id);
    if (!error && data) {
      // check/get all the files
      let photo = "";
      let video = "";
      let signature = "";
      if (data.photo_file) {
        const { error, file } = await getFileFromSupabase(data.photo_file);
        if (!error) {
          var uri = URL.createObjectURL(file);
          photo = uri;
        }
      }

      if (data.clip_file) {
        const { error, file } = await getFileFromSupabase(data.clip_file);
        if (!error) {
          var uri = URL.createObjectURL(file);
          video = uri;
        }
      }
      if (data.signature_file) {
        const { error, file } = await getFileFromSupabase(data.signature_file);
        if (!error) {
          var uri = URL.createObjectURL(file);
          signature = uri;
        }
      }
      setNftCardData({
        ...nftCardData,
        ...data,
        signature,
        photo,
        video,
      });
    }
  }

  useEffect(() => {
    getCardData();
  }, [nft_id]);

  const [viewportWidth, setVieportWidth] = useState(800);

  const [lastX, setLastX] = useState(-1);
  const [lastY, setLastY] = useState(reverse ? 180 : 0);
  const [cssTransform, setCssTransform] = useState<CSSProperties>({});

  const updateMedia = () => {
    setVieportWidth(window.innerWidth);
  };

  const flipCard = () => {
    setLastY(lastY + 180);
  };

  useEffect(() => {
    if (lastY % 360 === 0) {
      setCssTransform({
        transitionDelay: `100ms`,
        transform: `perspective(1000px) rotateY(${lastY}deg)`,
        transition: `transform 500ms ease-in-out`,
      });
    } else if (lastY % 180 === 0) {
      setCssTransform({
        transform: `perspective(1000px) rotateY(${lastY}deg)`,
        transition: `transform 300ms ease-in-out`,
      });
    } else {
      setCssTransform({
        transform: `perspective(1000px) rotateY(${lastY}deg)`,
      });
    }
  }, [lastY, reverse]);

  useEffect(() => {
    updateMedia();
    window.addEventListener("resize", updateMedia);
    return () => window.removeEventListener("resize", updateMedia);
  });

  const full_name = `${nftCardData.first_name} ${nftCardData.last_name}`;

  let location = `${nftCardData.high_school}, ${nftCardData.state}`;

  return (
    <CardWrapper
      signatureFile={nftCardData.signature}
      rotation={userStore.nftInput.preview_rotation}
      nftWidth={nft_width}
    >
      <Head>
        <meta
          property="og:title"
          content={
            "Check out " +
            (nftCardData.first_name ? nftCardData.first_name + "'s" : "") +
            " Verified Ink"
          }
        />
        <meta
          property="og:image"
          content="https://verifiedink.us/img/verified-ink-site.png"
        />
        <meta
          property="description"
          content="Create your own custom NFT with Verified Ink"
        />
      </Head>
      <div className="viewer">
        <div
          className="card card-container"
          onTouchMove={(e: TouchEvent) =>
            handleTouchEvent(e, lastY, lastX, setLastY, setLastX)
          }
          onTouchEnd={(e: TouchEvent) =>
            handleTouchEvent(e, lastY, lastX, setLastY, setLastX)
          }
          onClick={flipCard}
          style={cssTransform}
        >
          <div className="card front">
            <div className="background">
              <div className="background-gradient">
                <div className="background-stripes"></div>
                <div className="background-name">
                  {nftCardData.first_name}
                  <br />
                  {nftCardData.last_name}
                </div>
              </div>
              <div className="crop-background-img">
                <img className="background-img" src={nftCardData.photo} />
              </div>
              <img className="verified-logo" src="/img/card-logo.svg" />
              <div className="background-gradient overlay-gradient"></div>

              <div className="athlete-name">{full_name}</div>
              <div className="basic-info">
                <div className="info-group">
                  <div className="info-heading">Year</div>
                  <div className="bold-info">{nftCardData.graduation_year}</div>
                </div>
                <div className="info-group">
                  <div className="info-heading">Position</div>
                  <div className="bold-info">{nftCardData.sport_position}</div>
                </div>
                <div className="info-group">
                  <div className="info-heading">Hometown</div>
                  <div className="bold-info">{location}</div>
                </div>
                <div className="info-group">
                  <div className="info-heading">Sport</div>
                  <div className="bold-info">{nftCardData.sport}</div>
                </div>
              </div>
              <div className="signature"></div>
              <div className="serial-number">
                <div className="bold-info">1</div>/100
              </div>
            </div>
          </div>
          <div className="card reverse">
            <div className="background">
              <div className="background-gradient">
                <div className="background-gradient reverse-background-mask">
                  <video
                    className="background-video"
                    id="player-video"
                    src={nftCardData.video}
                    playsInline
                    autoPlay
                    loop
                    muted
                  ></video>
                  <div className="reverse-logo-background"></div>
                  <img
                    className="reverse-verified-logo"
                    src="/img/card-logo.svg"
                    onClick={goFullscreen}
                  />
                  <div className="reverse-name-background"></div>
                  <div className="athlete-name reverse-athlete-name">
                    {nftCardData.first_name}
                    <br />
                    {nftCardData.last_name}
                  </div>
                  <RiFullscreenLine
                    className="fullscreen"
                    onClick={goFullscreen}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardWrapper>
  );
};

export default observer(CardView);
