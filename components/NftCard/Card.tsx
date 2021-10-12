import { NftStore } from "@/mobx/NftStore";
import userStore from "@/mobx/UserStore";
import { getFileFromSupabase, getNftById } from "@/utils/supabase-client";
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
  nft?: NftStore | null;
  readOnly?: boolean;
}

const Card: React.FunctionComponent<Props> = ({
  nft_id = 96,
  nft_width = 400,
  reverse = false,
  nft,
  readOnly = false,
}) => {
  const [nftCardData, setNftCardData] = useState({
    photo: "",
    mux_playback_id: "",
    high_school: "",
    signature: "",
    first_name: "",
    last_name: "",
    sport: "",
    sport_position: "",
    usa_state: "",
    graduation_year: "",
  });

  async function getCardData() {
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
        ...nftCardData,
        ...data,
        signature,
        photo,
      });
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
    if (router.pathname.includes("step-4")) {
      setLastY(180);
    }
  }, [router.pathname]);

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
      return notLocal;
    }
  };

  let signature;
  let photo;
  let video;
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
  if (readOnly) {
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

    location = `${high_school}, ${usa_state}`;

    sport_position = localInputOrNot(
      userStore.nftInput.sport_position,
      nftCardData.sport_position
    );

    sport = localInputOrNot(userStore.nftInput.sport, nftCardData.sport);
  }

  return (
    <CardWrapper
      signatureFile={signature}
      rotation={preview_rotation}
      nftWidth={nft_width}
    >
      <Head>
        <meta
          property="og:title"
          content={
            "Check out " +
            (first_name ? first_name + "'s" : "") +
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
                <div className="background-name">
                  {first_name}
                  <br />
                  {last_name}
                </div>
              </div>
              <div className="crop-background-img">
                <img className="background-img" src={photo} />
              </div>
              <img className="verified-logo" src="/img/card-logo.svg" />
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
              <div className="serial-number">
                <div className="bold-info">1</div>/100
              </div>
            </div>
          </div>
          <div className="card reverse">
            <div className="background">
              <div className="background-gradient">
                <div className="background-gradient reverse-background-mask">
                  <VideoPlayer src={video} />

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
