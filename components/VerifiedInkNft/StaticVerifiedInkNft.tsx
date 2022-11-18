import { getFileLinkFromSupabase, getScreenshot, supabase } from "@/supabase/supabase-client";
import useWindowDimensions from "@/utils/useWindowDimensions";
import {
  Box,
  HStack,
  Image,
  Spinner,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { runInAction, toJS } from "mobx";
import { observer } from "mobx-react-lite";
import Head from "next/head";
import React, {
  CSSProperties,
  forwardRef,
  MutableRefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import styled from "styled-components";
import VideoPlayer from "../Components/VideoPlayer";
import { handleTouchEvent } from "../NftCard/CardMethods";

interface Props {
  nftId: number | null;
  editingMode?: string;
  reverse?: boolean | undefined;
  flip?: boolean | undefined;
  initFlip?: boolean | undefined;
  preventFlip?: boolean;
  nftWidth?: number;
  readOnly?: boolean;
  staticCard?: boolean;
  db_first_name?: string;
  public_url?: string;
  recruit_share?: boolean;
}

interface StyleProps {
  photo: string;
  color_top: string;
  color_bottom: string;
  signatureFile: string;
  editionRarity?: string;
  editionName?: string;
  nftWidth: number;
}

export const CardWrapper = styled.div<StyleProps>`
  width: 544px;
  height: 975px;
  // scale: calc(350/ 544);
  transform-origin: top center;
  text-align: center;
  ${(props: StyleProps) =>
    `transform: scale(calc(${props.nftWidth} / 544));
    `}
    ${(props) =>
    props.editionRarity === "Legendary"
      ? `color: #fff3ca;
          text-shadow: 0 0 2px #fff;`
      : `color: white;`};

  .card-container {
    background: transparent;
    position: relative;
    transform-style: preserve-3d;
    // perspective: 200px;
    transform-origin: center;
  }

  .card {
    position: absolute;
    width: 544px;
    height: 975px;
    left: 0px;
    bottom: 0px;
    // background: white;
    display: flex;
    justify-content: center;
  }

  .front {
    z-index: 2;
    backface-visibility: hidden;
    transform: rotateY(0deg);
  }

  .reverse {
    backface-visibility: hidden;
    transform: rotateY(180deg);
  }

  .gradient-background {
    position: absolute;
    background: linear-gradient(
      ${(props) => props.color_top},
      ${(props) => props.color_bottom}
    );
    mask-image: url("/card-assets/front-background.png");
    mask-size: contain;
    mask-repeat: no-repeat;
    mask-position-y: bottom;
    width: 100%;
    height: 100%;
  }

  .gradient-background-extended {
    position: absolute;
    ${(props) =>
    props.editionRarity === "Legendary"
      ? `background: #fff3ca;`
      : `background: white;`};
    mask-image: url("/card-assets/front-background-extended.png");
    mask-size: contain;
    mask-repeat: no-repeat;
    mask-position-y: bottom;
    width: 100%;
    height: 100%;
  }

  .gradient-background-extended-lego {
    position: absolute;
    background-image: url("/card-assets/front-background-extended-lego.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position-y: bottom;
    width: 100%;
    height: 100%;
  }

  .uncommon-frame {
    position: absolute;
    ${(props) =>
    props.editionRarity === "Legendary"
      ? `background: url("/card-assets/legendary-frame.png");`
      : `background: url("/card-assets/rare-frame.png");`}
    ;
    background-size: contain;
    background-repeat: no-repeat;
    background-position-y: bottom;
    width: 100%;
    height: 100%;
  }
  

  .solid-background {
    position: absolute;
    background: #040d27;
    mask-image: url("/card-assets/solid-background.png");
    mask-size: contain;
    mask-repeat: no-repeat;
    mask-position-y: bottom;
    width: 100%;
    height: 100%;
  }


  .front-image-glow {
    filter: drop-shadow(0px 0px 40px #0d9de5);
  }

  .front-image {
    position: absolute;
    background: url(${(props) => props.photo});
    width: 100%;
    height: 100%;
    background-size: 100% auto;
    background-repeat: no-repeat;
    mask-image: linear-gradient(black 0 47%, #00000000 57%);
    mask-size: contain;
    mask-repeat: no-repeat;
    mask-position-y: bottom;
  }

  .background-img {
    // compatability with older cards
  }

  .front-overlay {
    position: absolute;
    background: linear-gradient(
      ${(props) => props.color_bottom},
      ${(props) => props.color_bottom}
    );
    mask-image: url("/card-assets/front-overlay.png");
    mask-size: contain;
    mask-repeat: no-repeat;
    mask-position-y: bottom;
    width: 100%;
    height: 100%;
  }

  .photo-button {
    position: absolute;
    top: 25%;
    left: 239px;
    transform-origin: center;

    display: flex;
    justify-content: center;
    align-items: center;
  }

  .background-button-one {
    position: absolute;
    top: 120px;
    left: 500px;
    transform: scale(2);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .background-button-two {
    position: absolute;
    top: 825px;
    left: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    > svg {
      transform: scale(2);
    }
  }

  .video-button {
    position: absolute;

    top: 40%;
    left: 239px;
    display: flex;
    justify-content: center;
    align-items: center;

    transform: scale(2) translateX(-35%) translateY(-50%);
  }

  .signature-button {
    position: absolute;
    top: 85%;
    left: 50%;
    transform: scale(2) translateX(-26%);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .name {
    font-size: 60px;
    font-weight: var(--chakra-fontWeights-semibold);
  }
  .first {
    top: 500px;
  }
  .last {
    top: 580px;
    line-height: 50px;
  }

  .school-state {
    font-size: 20px;
    width: max-content;
  }

  .details {
    margin-top: 0px !important;
    font-weight: 600;
    font-size: 20px;
  }

  .background {
    position: absolute;
    width: 544px;
    height: 897px;
    left: 0px;
    bottom: 0px;
  }

  .background-gradient {
    position: absolute;
    left: 0%;
    right: 0%;
    top: 0%;
    bottom: 0%;
    background: linear-gradient(
      ${(props) => props.color_top},
      ${(props) => props.color_bottom}
    );
    mix-blend-mode: normal;
    mask-image: url(/card-assets/background-mask.png);
    mask-repeat: no-repeat;
    mask-position: top center;
    width: 100%;
    height: 100%;
  }

  .reverse-background-mask {
    mask-image: url(/img/reverse-background.png);
    mask-repeat: no-repeat;
    mask-position: top center;
    overflow: hidden;
  }

  .background-video-centered {
    position: absolute;
    top: 0px;
    display: block;
    min-height: 898px;
    max-height: 950px;
    min-width: 544px;
    max-width: 3000px;
    vertical-align: center;
    left: 50%;
    transform: translate(-50%);
  }

  .reverse-logo-background {
    position: absolute;
    bottom: 0px;
    height: 300px;
    width: 100%;
    background: linear-gradient(
      0deg,
      ${(props) => props.color_bottom} -25.39%,
      rgba(107, 117, 170, 0.452044) 80.43%,
      rgba(196, 196, 196, 0) 100%
    );
  }

  .reverse-verified-logo {
    position: absolute;
    bottom: 60px;
    left: 50%;
    transform: translate(-50%) scale(1.5);
    z-index: 2;
    width: 50px;
    height: auto;
  }

  .loading-spinner {
    transform: scale(2);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .signature {
    position: absolute;
    bottom: 5%;
    left: 52%;
    mask-image: ${(props) => `url(${props.signatureFile})`};
    mask-size: contain;
    mask-repeat: no-repeat;
    ${(props) =>
    props.editionRarity === "Legendary"
      ? `background: #fff3ca;`
      : `background: white;`}
    pointer-events: none;
    transform: translate(-50%);
    width: 225px;
    height: 150px;
        
    
  }

  .signature-input-text {
    position: absolute;
    bottom: 8%;
    left: 50%;
    transform: translate(-50%);
    width: 250px;
    height: 150px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--chakra-colors-gray4);
    pointer-events: none;
  }

  input {
    text-align: center;
  }
`;

const VerifiedInkNft = forwardRef<HTMLFormElement, Props>(
  (
    {
      nftId,
      editingMode = "",
      reverse = false,
      flip = false,
      initFlip = false,
      preventFlip = false,
      nftWidth = 350,
      readOnly = true,
      staticCard = false,
      db_first_name,
      public_url,
      recruit_share = false,

    },
    ref
  ) => {
    const { width } = useWindowDimensions();
    const [photo, setPhoto] = useState("");
    const [signature, setSignature] = useState("");
    const [screenshot, setScreenshot] = useState("");

    const [lastX, setLastX] = useState(-1);
    const [lastY, setLastY] = useState(reverse ? 180 : 0);
    const [cssTransform, setCssTransform] = useState<CSSProperties>({});

    const flipCard = () => {
      setLastY(lastY + 180);
    };

    const showFront = () => {
      setLastY(180);
    };

    const showReverse = () => {
      setLastY(0);
    };

    useEffect(() => {
      // Check if this is the first time the card modal loaded
      // So the card doesn't flip automatically when modal is opened
      if (initFlip) {
        flipCard();
      }
    }, [flip]);


  useEffect(() => {
    if (reverse) {
      setLastY(180);
    } else {
      setLastY(0);
    }
  }, [reverse]);

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

    const {
      isLoading,
      error,
      data: nft,
    } = useQuery(["VerifiedInkNft"], async () => {
      if (nftId) {
        const { data, error } = await supabase
          .from("nft")
          .select("*")
          .eq("id", nftId)
          .single();
        if (data) {
          return data;
        } else {
          return null;
        }
      } else {
        return null;
      }
    });

    useEffect(() => {
      if (!nft) return;

      // load photo
      if (nft.photo_file) {
        getFileLinkFromSupabase(nft.photo_file).then((link) => {
          setPhoto(encodeURI(link.publicUrl!));
        });
      }

      // load signature
      if (nft.signature_file) {
        getFileLinkFromSupabase(nft.signature_file).then((link) => {
          setSignature(encodeURI(link.publicUrl!));
        });
      }

      getScreenshot(nft.id).then(({ error, publicUrl }) => {
        if (publicUrl) {
          setScreenshot(publicUrl);
        }
      });

    }, [nft]);

    const meta = <Head>
        <meta
          property="og:title"
          content={"Check out " +
                (db_first_name ? `${db_first_name}\'s ` : "") +
                "VerifiedInk"
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
              ? `https://verifiedink.us/api/meta/showTwitterPreview/${nftId}`
              : "https://verifiedink.us/img/twitter-site-image.png"
          }`}
          key="twitter-image"
        />
        <meta
          property="description"
          content={`${
            recruit_share
              ? "Check out this NFT I made with @VfdInk. Just for athletes. I get paid every single time it sells. Here's a referral link if you want to make your own."
              : "Create your own custom NFT with VerifiedInk - @VfdInk"
          }`}
        />
      </Head>


    return (nft ?
      <CardWrapper
        photo={photo || "/card-assets/front-image.png"}
        color_top={nft.color_top || "#e66465"}
        color_bottom={nft.color_bottom || "#9198e5"}
        signatureFile={signature}
        nftWidth={nftWidth}
        editionRarity={nft.edition_rarity}
        editionName={nft.edition_name}

      >
        {meta}
        <div
          className="card card-container"
          onClick={() => {
            if (!preventFlip) {
              flipCard();
            }
          }}
          onTouchMove={(e: any) =>
            handleTouchEvent(e, lastY, lastX, setLastY, setLastX)
          }
          onTouchEnd={(e: any) =>
            handleTouchEvent(e, lastY, lastX, setLastY, setLastX)
          }
          style={cssTransform}
        >
          <div className="card front">

            {staticCard ? (
              <div className="card front">
                <img src={screenshot} alt="" />
              </div>

            ) : (
              <>
                <div className="solid-background"></div>
                <div className="signature"></div>
                {nft.edition_rarity != "Common" //&& nft.edition_name == "Extended"
                  ?
                  <>
                    <div className={nft.edition_rarity == "Legendary" ? "gradient-background-extended-lego" : "gradient-background-extended"}></div>
                    <div className="uncommon-frame"></div>
                  </>
                  :
                  <div className="gradient-background"></div>
                }
                <Image
                  src={nft.edition_rarity == "Legendary" ?
                    "/card-assets/gold-logo.png"
                    :
                    "/card-assets/white-logo.png"}
                  pos="absolute"
                  top="140px"
                  left="18px"
                  w="90px"
                />

                {!isLoading ? (
                  <>

                    <div className="front-image background-img"></div>

                    {nft.edition_rarity == "Common" &&
                      <div className="front-overlay"></div>}

                    <Box display="inline" className="name first" fontWeight="600" pos="absolute" w="350px">
                      {nft.first_name}
                    </Box>

                    <Box display="inline" className="name last" fontWeight="600" pos="absolute" w="350px">
                      {nft.last_name}
                    </Box>

                    <HStack pos="absolute" top="645px" color={nft.edition_rarity != "Legendary" ? nft.color_top : "unset"}>
                      <div className="school-state">
                        {nft.high_school}{nft.usa_state ? `, ${nft.usa_state}` : ""}
                      </div>
                    </HStack>


                    <HStack
                      pos="absolute"
                      top="690px"
                      w="95%"
                      justifyContent="space-around"
                    >
                      {nft.graduation_year && <VStack w="33%" position="relative">
                        <Text fontSize="16px" color="gray.400">
                          Year
                        </Text>
                        <Box display="inline" className="details" fontWeight="600" >

                          '{nft.graduation_year.toString().padStart(2, '0')}
                        </Box>
                      </VStack>}
                      {nft.sport_position && <VStack w="33%" position="relative">
                        <Text fontSize="16px" color="gray.400">
                          Position
                        </Text>
                        <Box display="inline" className="details" fontWeight="600" >
                          {nft.sport_position}
                        </Box>
                      </VStack>}
                      {nft.sport && <VStack w="33%" position="relative">
                        <Text fontSize="16px" color="gray.400">
                          Sport
                        </Text>
                        <Box display="inline" className="details" fontWeight="600" >
                          {nft.sport}
                        </Box>
                      </VStack>}
                    </HStack>

                  </>
                ) : (
                  <Spinner size={"xl"} position="absolute" top="50%" />
                )}
              </>
            )}
          </div>

          <div className="card reverse">
            <div className="background">
              <div className="background-gradient">
                <div className="background-gradient reverse-background-mask">

                  {nft && <VideoPlayer
                    src={nft.mux_playback_id}
                    max_resolution={nft.mux_max_resolution}
                  />}
                  <div className="reverse-logo-background"></div>
                  <img
                    className="reverse-verified-logo"
                    src="/card-assets/white-logo.png"
                  />
                </div>
              </div>

            </div>

          </div>
        </div>
      </CardWrapper>
      : meta
    )
  }
);


export default observer(VerifiedInkNft);
