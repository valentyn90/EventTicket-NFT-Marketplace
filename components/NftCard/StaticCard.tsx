import { getNftById, getScreenshot } from "@/supabase/supabase-client";
import Head from "next/head";
import React, { CSSProperties, useEffect, useState } from "react";
import { RiFullscreenLine } from "react-icons/ri";
import VideoPlayer from "../Components/VideoPlayer";
import { goFullscreen, handleTouchEvent } from "./CardMethods";
import { CardWrapper } from "./CardStyles";
import { motion } from "framer-motion";

interface Props {
  nft_id: number;
  width?: number | undefined;
  reverse?: boolean | undefined;
  db_first_name?: string;
  public_url?: string;
  recruit_share?: boolean;
  sale_price?: number | undefined;
}

const StaticCard: React.FC<Props> = ({
  nft_id,
  width = 400,
  reverse = false,
  db_first_name,
  public_url,
  recruit_share = false,
  sale_price = undefined,
}) => {
  const [screenshot, setScreenshot] = useState("/img/card-placeholder.png");
  const [lastX, setLastX] = useState(-1);
  const [lastY, setLastY] = useState(reverse ? 180 : 0);
  const [cssTransform, setCssTransform] = useState<CSSProperties>({});
  const [viewportWidth, setVieportWidth] = useState(800);

  const [nftCardData, setNftCardData] = useState({
    first_name: "",
    last_name: "",
    mux_playback_id: "",
    mux_max_resolution: "",
    color_top: "",
    color_bottom: "",
    color_transition: "",
    crop_values: [],
    slow_video: false,
  });

  useEffect(() => {
    getNftById(nft_id).then(({ data, error }) => {
      if (data) {
        setNftCardData({
          first_name: data.first_name,
          last_name: data.last_name,
          mux_playback_id: data.mux_playback_id,
          mux_max_resolution: data.mux_max_resolution,
          color_top: data.color_top,
          color_bottom: data.color_bottom,
          color_transition: data.color_transition,
          crop_values: data.crop_values,
          slow_video: data.slow_video,
        });
      }
    });
  }, [nft_id]);

  useEffect(() => {
    getScreenshot(nft_id).then(({ error, publicUrl }) => {
      if (publicUrl) {
        setScreenshot(publicUrl);
      }
    });
  }, [nft_id]);

  const flipCard = () => {
    setLastY(lastY + 180);
  };

  const updateMedia = () => {
    setVieportWidth(window.innerWidth);
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
    if (reverse) {
      setLastY(180);
    } else {
      setLastY(0);
    }
  }, [reverse]);

  useEffect(() => {
    updateMedia();
    window.addEventListener("resize", updateMedia);
    return () => window.removeEventListener("resize", updateMedia);
  });

  return (
    <CardWrapper
      signatureFile={null}
      rotation={null}
      nftWidth={width}
      topColor={nftCardData.color_top || "#4f66e1"}
      bottomColor={nftCardData.color_bottom || "#cb0000"}
      transitionColor={nftCardData.color_transition || "#3d142d"}
      founders={false}
      smallCardSize={true}
    >
      <Head>
        <meta
          property="og:title"
          content={sale_price ?  
            "Buy " +
            (db_first_name ? `${db_first_name}\'s ` : "") +
            "VerifiedInk from $" + sale_price
            :
            "Check out " +
            (db_first_name ? `${db_first_name}\'s ` : "") +
            "VerifiedInk"
          }
          key="title"
        />
        <meta
          property="og:image"
          content={`${typeof public_url === "string" && public_url.length > 0
            ? public_url
            : "https://verifiedink.us/img/verified-ink-site.png"
            }`}
          key="preview"
        />
        <meta
          property="twitter:image"
          content={`${typeof public_url === "string" && public_url.length > 0
            ? `https://verifiedink.us/api/meta/showTwitterPreview/${nft_id}`
            : "https://verifiedink.us/img/twitter-site-image.png"
            }`}
          key="twitter-image"
        />
        <meta
          property="description"
          content={`${recruit_share
            ? "Check out this NFT I made with @VfdInk. Just for athletes. I get paid every single time it sells. Here's a referral link if you want to make your own."
            : "Create your own custom NFT with VerifiedInk - @VfdInk"
            }`}
        />
      </Head>
      <div className="viewer">
        <div
          className="card card-container"
          onTouchMove={(e: any) =>
            handleTouchEvent(e, lastY, lastX, setLastY, setLastX)
          }
          onTouchEnd={(e: any) =>
            handleTouchEvent(e, lastY, lastX, setLastY, setLastX)
          }
          onClick={flipCard}
          style={cssTransform}
        >
          {(screenshot === "/img/card-placeholder.png") ?
            <motion.div className="card front"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: .8,
                scale: .98
              }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 2,
              }}
            >
              <img src={screenshot} alt="" />
            </motion.div>
            :
            <div className="card front">
              <img src={screenshot} alt="" />
            </div>
          }

          <div className="card reverse">
            <div className="background">
              <div className="background-gradient">
                <div className="background-gradient reverse-background-mask">
                  <VideoPlayer
                    src={nftCardData.mux_playback_id}
                    max_resolution={nftCardData.mux_max_resolution || ""}
                    crop_values={nftCardData.crop_values || []}
                    slow_video={nftCardData.slow_video}
                  />

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

export default StaticCard;
