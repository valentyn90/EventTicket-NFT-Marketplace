import { NftStore } from "@/mobx/NftStore";
import userStore from "@/mobx/UserStore";
import { Spinner } from "@chakra-ui/spinner";
import { getFileFromSupabase, getNftById } from "@/supabase/supabase-client";
import { observer } from "mobx-react-lite";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { CSSProperties, useEffect, useState } from "react";
import { RiFullscreenLine } from "react-icons/ri";
import VideoPlayer from "../Components/VideoPlayer";
import { goFullscreen, handleTouchEvent } from "./CardMethods";
import { CardWrapper } from "./CardStyles";

interface Props {
  nft_id?: number | undefined;
  nft_width?: number | undefined;
  reverse?: boolean | undefined;
  flip?: boolean | undefined;
  initFlip?: boolean | undefined;
  nft?: NftStore | null;
  readOnly?: boolean;
  db_first_name?: string;
  public_url?: string;
  founders?: boolean;
}

const Card: React.FunctionComponent<Props> = ({
  nft_id = 93,
  nft_width = 400,
  reverse = false,
  flip = false,
  initFlip = false,
  nft,
  readOnly = false,
  db_first_name,
  public_url,
  founders = false,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [nftCardData, setNftCardData] = useState({
    photo: "",
    mux_playback_id: "",
    mux_max_resolution: "",
    high_school: "",
    signature: "",
    first_name: "",
    last_name: "",
    sport: "",
    sport_position: "",
    usa_state: "",
    graduation_year: "",
    color_top: "",
    color_bottom: "",
    color_transition: "",
    crop_values: [],
    slow_video: false,
  });

  async function getCardData() {
    setNftCardData({
      photo: "",
      mux_playback_id: "",
      mux_max_resolution: "",
      high_school: "",
      signature: "",
      first_name: "",
      last_name: "",
      sport: "",
      sport_position: "",
      usa_state: "",
      graduation_year: "",
      color_top: "",
      color_bottom: "",
      color_transition: "",
      crop_values: [],
      slow_video: false,
    });
    setLoaded(false);
    const { data, error } = await getNftById(nft_id);
    if (!error && data) {
      // check/get all the files
      let photo = "";
      let signature = "";
      if (data.photo_file) {
        const { error, file } = await getFileFromSupabase(data.photo_file);
        if (!error) {
          var uri = URL.createObjectURL(file);
          photo = uri;
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
        ...data,
        signature,
        photo,
      });
      setLoaded(true);
    }
  }

  useEffect(() => {
    getCardData();
  }, [
    nft_id,
    nft?.photo_file,
    nft?.signature_file,
    userStore.nft?.mux_playback_id,
  ]);

  const router = useRouter();

  useEffect(() => {
    if (router.pathname.includes("step-5")) {
      setLastY(180);
    }
    if (router.pathname.includes("step-8")) {
      setStep8CardSize(true);
    } else {
      setStep8CardSize(false);
    }
  }, [router.pathname]);

  const [viewportWidth, setVieportWidth] = useState(800);

  const [step8CardSize, setStep8CardSize] = useState(false);
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
    // Check if this is the first time the card modal loaded
    // So the card doesn't flip automatically when modal is opened
    if (initFlip) {
      flipCard();
    }
  }, [flip]);

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

  const localInputOrNot = (local: string, notLocal: string) => {
    // Check if empty string or not.
    if (local !== "") {
      // check if local is different
      if (local !== notLocal) {
        return local;
      } else {
        return notLocal;
      }
    } else {
      if (notLocal) {
        return notLocal;
      } else {
        return "";
      }
    }
  };

  let signature;
  let photo;
  let video;
  let video_resolution = nftCardData.mux_max_resolution || "";
  let graduation_year;
  let first_name;
  let last_name;
  let fullName;
  let high_school;
  let usa_state;
  let location;
  let sport_position;
  let sport;
  let preview_rotation;

  let topColor;
  let bottomColor;
  let transitionColor;

  let crop_values = nftCardData.crop_values || [];
  let slow_video = nftCardData.slow_video || false;

  if (readOnly) {
    topColor = nftCardData.color_top || "#4f66e1";
    bottomColor = nftCardData.color_bottom || "#cb0000";
    transitionColor = nftCardData.color_transition || "#3d142d";
    preview_rotation = 0;
    video = nftCardData.mux_playback_id;
    signature = nftCardData.signature;
    photo = nftCardData.photo;
    graduation_year =
      nftCardData.graduation_year.toString().length > 2
        ? nftCardData.graduation_year
        : `'${nftCardData.graduation_year.toString().padStart(2, "0")}`;
    first_name = nftCardData.first_name;
    last_name = nftCardData.last_name;
    fullName = `${first_name} ${last_name}`;

    high_school = nftCardData.high_school;
    usa_state = nftCardData.usa_state;
    location = `${high_school}, ${usa_state}`;
    sport_position = nftCardData.sport_position;
    sport = nftCardData.sport;
  } else {
    preview_rotation = userStore.nftInput.preview_rotation;

    if (userStore.nft?.mux_playback_id) {
      video = userStore.nft?.mux_playback_id;
    } else {
      video = nftCardData.mux_playback_id;
    }

    if (userStore.nft?.mux_max_resolution) {
      video_resolution = userStore.nft?.mux_max_resolution;
    } else {
      video_resolution = nftCardData.mux_max_resolution;
    }

    if (userStore.nftInput.localSignature !== null) {
      signature = userStore.nftInput.localSignature?.current?.toDataURL();
    } else {
      signature = nftCardData.signature;
    }
    if (userStore.nftInput.localPhoto === undefined) {
      if (userStore.nft?.photo) {
        photo = userStore.nft?.photo;
      }
    } else {
      photo = URL.createObjectURL(userStore.nftInput.localPhoto);
    }

    if (userStore.nftInput.graduation_year) {
      graduation_year =
        localInputOrNot(
          userStore.nftInput.graduation_year.toString(),
          nftCardData.graduation_year
        ).toString().length > 2
          ? nftCardData.graduation_year
          : `'${nftCardData.graduation_year.toString().padStart(2, "0")}`;
    } else {
      graduation_year =
        nftCardData.graduation_year.toString().length > 2
          ? nftCardData.graduation_year
          : `'${nftCardData.graduation_year.toString().padStart(2, "0")}`;
    }

    first_name = localInputOrNot(
      userStore.nftInput.first_name,
      nftCardData.first_name
    );
    last_name = localInputOrNot(
      userStore.nftInput.last_name,
      nftCardData.last_name
    );
    fullName = `${first_name} ${last_name}`;
    high_school = localInputOrNot(
      userStore.nftInput.high_school,
      nftCardData.high_school
    );

    usa_state = localInputOrNot(
      userStore.nftInput.usa_state,
      nftCardData.usa_state
    );

    if (high_school && usa_state) {
      location = `${high_school}, ${usa_state}`;
    } else if (high_school && !usa_state) {
      location = high_school;
    } else if (!high_school && usa_state) {
      location = usa_state;
    } else {
      location = "";
    }

    sport_position = localInputOrNot(
      userStore.nftInput.sport_position,
      nftCardData.sport_position
    );

    sport = localInputOrNot(userStore.nftInput.sport, nftCardData.sport);

    topColor = localInputOrNot(
      userStore.nftInput.color_top,
      nftCardData.color_top
    );
    bottomColor = localInputOrNot(
      userStore.nftInput.color_bottom,
      nftCardData.color_bottom
    );
    transitionColor = localInputOrNot(
      userStore.nftInput.color_transition,
      nftCardData.color_transition
    );

    if (!topColor || !bottomColor || !transitionColor) {
      topColor = nftCardData.color_top || "#4f66e1";
      bottomColor = nftCardData.color_bottom || "#cb0000";
      transitionColor = nftCardData.color_transition || "#3d142d";
    }
  }

  return (
    <CardWrapper
      signatureFile={signature}
      rotation={preview_rotation}
      nftWidth={nft_width}
      topColor={topColor}
      bottomColor={bottomColor}
      transitionColor={transitionColor}
      founders={founders}
      step8={step8CardSize}
    >
      <Head>
        <meta
          property="og:title"
          content={
            "Check out " +
            (db_first_name
              ? `${db_first_name}\'s `
              : "") +
            "Verified Ink"
          }
          key="title"
        />
        <meta
          property="og:image"
          content={`${
            typeof public_url === "string" && public_url.length > 0
              ? public_url
              : "https://verifiedink.us/img/verified-ink-site.png"
          }`}
          key="preview"
        />
        <meta
          property="twitter:image"
          content={`${
            typeof public_url === "string" && public_url.length > 0
              ? public_url
              : "https://verifiedink.us/img/twitter-site-image.png"
          }`}
          key="twitter-image"
        />
        <meta
          property="description"
          content="Create your own custom NFT with Verified Ink"
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
          <div className="card front">
            <div className="background">
              <div className="background-gradient">
                <div className="background-stripes"></div>
                {loaded && (
                  <div className="background-name">
                    {first_name}
                    <br />
                    {last_name}
                  </div>
                )}
              </div>
              <img className="verified-logo" src="/img/card-logo.svg" />
              {loaded ? (
                <>
                  <div className="crop-background-img">
                    <img className="background-img" src={photo} />
                  </div>
                  <div className="background-gradient overlay-gradient"></div>

                  <div className="athlete-name">{fullName}</div>
                  <div className="athlete-school">{location}</div>
                  <div className="basic-info">
                    <div className="info-group">
                      <div className="info-heading">Year</div>
                      <div className="bold-info">{graduation_year}</div>
                    </div>
                    <div className="info-group">
                      <div className="info-heading">Position</div>
                      <div className="bold-info">{sport_position}</div>
                    </div>
                    <div className="info-group">
                      <div className="info-heading">Sport</div>
                      <div className="bold-info">{sport}</div>
                    </div>
                  </div>
                  <div className="signature"></div>
                </>
              ) : (
                <div className="loading-spinner">
                  <Spinner color="white" w="150px" h="150px" />
                </div>
              )}
              <div className="serial-number">
                <div className="bold-info">1</div>/10
              </div>
            </div>
          </div>
          <div className="card reverse">
            <div className="background">
              <div className="background-gradient">
                <div className="background-gradient reverse-background-mask">
                  <VideoPlayer
                    src={video}
                    max_resolution={video_resolution}
                    crop_values={crop_values}
                    slow_video={slow_video}
                  />

                  <div className="reverse-logo-background"></div>
                  <img
                    className="reverse-verified-logo"
                    src="/img/card-logo.svg"
                    onClick={goFullscreen}
                  />
                  <div className="reverse-name-background"></div>
                  <div className="athlete-name reverse-athlete-name">
                    {first_name}
                    <br />
                    {last_name}
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

export default observer(Card);
