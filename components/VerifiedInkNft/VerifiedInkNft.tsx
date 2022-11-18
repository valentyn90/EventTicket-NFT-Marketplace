import userStore from "@/mobx/UserStore";
import { getFileFromSupabase, supabase } from "@/supabase/supabase-client";
import BluePlus from "@/svgs/BluePlus";
import BlueX from "@/svgs/BlueX";
import useWindowDimensions from "@/utils/useWindowDimensions";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
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
import React, {
  CSSProperties,
  forwardRef,
  MutableRefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import styled from "styled-components";
import { CheckButton } from "../Components/EditingButtons";
import VideoPlayer from "../Components/VideoPlayer";
import updateBasicInfo from "./forms/updateBasicInfo";
import updateColors from "./forms/updateColors";
import updatePhoto from "./forms/updatePhoto";
import updateSignature from "./forms/updateSignature";
import updateVideo from "./forms/updateVideo";
import basicInfoSkip from "./skipCheck/basicInfoSkip";
import colorSkip from "./skipCheck/colorSkip";

interface Props {
  nftId: number | null;
  editingMode?: string;
  reverse?: boolean | undefined;
  flip?: boolean | undefined;
  initFlip?: boolean | undefined;
  preventFlip?: boolean;
  nftWidth?: number;
  readOnly?: boolean;
}

interface StyleProps {
  photo: string;
  color_top: string;
  color_bottom: string;
  signatureFile: string;
  signatureRotate: boolean;
  editionRarity?: string;
  editionName?: string;
  nftWidth: number;
  rotation: number | null;
}

export const CardWrapper = styled.div<StyleProps>`
  width: 544px;
  height: 975px;
  // scale: calc(350/ 544);
  transform-origin: top left;
  ${(props: StyleProps) =>
    `transform: scale(calc(${props.nftWidth} / 544));
    `}

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
    ${(props: StyleProps) => `transform: rotate(${props.rotation}deg);`}
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
    top: 565px;
    line-height: 50px;
  }

  .school-state {
    font-size: 20px;
    width: max-content;
    color: ${(props) => props.color_top};
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
    mask-image: url(/img/card-mask.png);
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
      #000d52 -25.39%,
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
      props.editionRarity === "Legendary" && props.editionName === "Extended"
        ? `background: url(/img/gold.jpg);`
        : `background: white;`}
    pointer-events: none;
    ${(props) =>
      props.signatureRotate
        ? `transform: translate(-50%) rotate(270deg);
        width: 150px;
    height: 280px;
        `
        : `transform: translate(-50%);
        width: 225px;
        height: 150px;
        `}
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
    },
    ref
  ) => {
    const { width } = useWindowDimensions();
    const toast = useToast();
    const yearRef = useRef(null);
    const positionRef = useRef(null);
    const sportRef = useRef(null);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [school, setSchool] = useState("");
    const [state, setState] = useState("");
    const [year, setYear] = useState("");
    const [position, setPosition] = useState("");
    const [sport, setSport] = useState("");
    const [photo, setPhoto] = useState("");
    const [colorTop, setColorTop] = useState("#e66465");
    const [colorBottom, setColorBottom] = useState("#9198e5");
    const [colorsSet, setColorsSet] = useState(false);
    const [videoSet, setVideoSet] = useState(false);
    const [muxAssetId, setMuxAssetId] = useState("");
    const [muxPlaybackId, setMuxPlaybackId] = useState("");
    const [muxMaxResolution, setMuxMaxResolution] = useState("");
    const [signature, setSignature] = useState("");
    const [signatureLoaded, setSignatureLoaded] = useState(false);
    const [showVideoAlert, setShowVideoAlert] = useState(false);
    const alertRef = useRef(null);

    const [editButtonState, setEditButtonState] =
      useState<"add" | "delete" | "accept">("add");

    let curInput = "";
    if (editingMode === "Basic Info") {
      curInput = "firstName";
    } else if (editingMode === "Photo") {
      curInput = "photo";
    }

    const [currentInput, setCurrentInput] = useState(curInput);

    const [lastX, setLastX] = useState(-1);
    const [lastY, setLastY] = useState(reverse ? 180 : 0);
    const [cssTransform, setCssTransform] = useState<CSSProperties>({});

    const isMobile = width !== null && width !== undefined && width < 992;

    const flipCard = () => {
      setLastY(lastY + 180);
    };

    const showFront = () => {
      setLastY(180);
    };

    const showReverse = () => {
      setLastY(0);
    };

    // useEffect(() => {
    //   // Check if this is the first time the card modal loaded
    //   // So the card doesn't flip automatically when modal is opened
    //   if (initFlip) {
    //     flipCard();
    //   }
    // }, [flip]);

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
      // load nft values into local state
      if (!nft) return;
      // load basic info
      if (nft.first_name) {
        setFirstName(nft.first_name);
      }
      if (nft.last_name) {
        setLastName(nft.last_name);
      }
      if (nft.high_school) {
        setSchool(nft.high_school);
      }
      if (nft.usa_state) {
        setState(nft.usa_state);
      }
      if (nft.graduation_year) {
        setYear(nft.graduation_year);
      }
      if (nft.sport) {
        setSport(nft.sport);
        userStore.nftInput.setInputValue("sport", nft.sport);
      }
      if (nft.sport_position) {
        setPosition(nft.sport_position);
      }
      // load photo
      if (nft.photo_file) {
        getFileFromSupabase(nft.photo_file).then(({ file, error }) => {
          if (file) {
            // @ts-ignore
            const photoUrl = URL.createObjectURL(file);
            setPhoto(photoUrl);
          }
        });
      }
      // load colors
      if (nft.color_top) {
        setColorTop(nft.color_top);
        if (!colorsSet) {
          setColorsSet(true);
        }
      }
      if (nft.color_bottom) {
        setColorBottom(nft.color_bottom);
        if (!colorsSet) {
          setColorsSet(true);
        }
      }
      // load mux video
      if (nft.mux_asset_id) {
        setMuxAssetId(nft.mux_asset_id);
      }
      if (nft.mux_playback_id) {
        setMuxPlaybackId(nft.mux_playback_id);
      }
      if (nft.mux_max_resolution) {
        setMuxMaxResolution(nft.mux_max_resolution);
      }
      if (nft.mux_asset_id && nft.mux_playback_id && nft.mux_max_resolution) {
        setVideoSet(true);
      }
      // load signature
      if (nft.signature_file) {
        getFileFromSupabase(nft.signature_file).then(({ file, error }) => {
          if (file) {
            // @ts-ignore
            const signatureUrl = URL.createObjectURL(file);
            setSignature(signatureUrl);
            setSignatureLoaded(true);
          }
        });
      }
    }, [nft]);

    useEffect(() => {
      if (readOnly) return;
      if (userStore.nftInput.localPhoto) {
        const photoUrl = URL.createObjectURL(
          userStore.nftInput.localPhoto as Blob
        );
        setPhoto(photoUrl);
        userStore.ui.setFieldValue("disableContinue", false);
      } else {
        userStore.ui.setFieldValue("disableContinue", true);
      }
    }, [userStore.nftInput.localPhoto]);

    useEffect(() => {
      if (readOnly) return;
      if (userStore.nftInput.color_top) {
        setColorTop(userStore.nftInput.color_top);
        if (colorsSet) {
          setColorsSet(false);
        }
      }
      if (userStore.nftInput.color_bottom) {
        setColorBottom(userStore.nftInput.color_bottom);
        if (colorsSet) {
          setColorsSet(false);
        }
      }
    }, [userStore.nftInput.color_bottom, userStore.nftInput.color_top]);

    // set nft input mux values to local state
    useEffect(() => {
      if (readOnly) return;
      if (userStore.nftInput.mux_asset_id) {
        setMuxAssetId(userStore.nftInput.mux_asset_id);
        if (videoSet) {
          setVideoSet(false);
        }
      }
      if (userStore.nftInput.mux_playback_id) {
        setMuxPlaybackId(userStore.nftInput.mux_playback_id);
        if (videoSet) {
          setVideoSet(false);
        }
      }
      if (userStore.nftInput.mux_max_resolution) {
        setMuxMaxResolution(userStore.nftInput.mux_max_resolution);
        if (videoSet) {
          setVideoSet(false);
        }
      }
    }, [
      userStore.nftInput.mux_playback_id,
      userStore.nftInput.mux_asset_id,
      userStore.nftInput.mux_max_resolution,
    ]);

    useEffect(() => {
      if (readOnly) return;
      if (userStore.nftInput.errorMessage) {
        // show error toast
        toast({
          position: "top",
          status: "error",
          description: userStore.nftInput.errorMessage,
          duration: 3000,
          isClosable: true,
        });
      }
    }, [userStore.nftInput.errorMessage]);

    // set nft input signature to local state
    useEffect(() => {
      if (readOnly) return;
      if (userStore.nftInput.localSignature !== null) {
        setSignature(userStore.nftInput.localSignature?.current?.toDataURL());
        setSignatureLoaded(false);
      }
    }, [userStore.nftInput.localSignature]);

    // set nft sport to local state
    useEffect(() => {
      if (readOnly) return;
      if (userStore.nftInput.sport) {
        setSport(userStore.nftInput.sport);
      }
    }, [userStore.nftInput.sport]);

    useEffect(() => {
      if (readOnly) return;
      if (userStore.ui.step === "Video") {
        showFront();
      } else {
        showReverse();
      }
    }, [userStore.ui.step]);

    // useEffect(() => {
    //   if (readOnly) return;
    //   if (userStore.ui.flipVideo ) {
    //     flipCard();
    //   }
    // }, [userStore.ui.flipVideo]);

    useEffect(() => {
      if (readOnly) return;
      if (userStore.ui.bottomEditComponent === "") {
        setEditButtonState("add");
      }
    }, [userStore.ui.bottomEditComponent]);

    useEffect(() => {
      if (readOnly) return;
      // update current input by step
      if (editingMode === "Basic Info") {
        setCurrentInput("firstName");
      } else {
        setCurrentInput("");
      }

      // check if disable continue should be false
      switch (userStore.ui.step) {
        case "Photo": {
          if (photo) {
            userStore.ui.setFieldValue("disableContinue", false);
          } else if (userStore.nftInput.localPhoto) {
            userStore.ui.setFieldValue("disableContinue", false);
          } else {
            userStore.ui.setFieldValue("disableContinue", true);
          }
          break;
        }
        case "Background": {
          if (colorsSet) {
            userStore.ui.setFieldValue("disableContinue", false);
          } else if (
            userStore.nftInput.color_top ||
            userStore.nftInput.color_bottom
          ) {
            userStore.ui.setFieldValue("disableContinue", false);
          } else {
            userStore.ui.setFieldValue("disableContinue", true);
          }
          break;
        }
        case "Video": {
          // if (videoSet) {
          //   userStore.ui.setFieldValue("disableContinue", false);
          // } else if (
          //   userStore.nftInput.mux_upload_id &&
          //   userStore.nftInput.mux_playback_id &&
          //   userStore.nftInput.mux_asset_id &&
          //   userStore.nftInput.count_renditions
          // ) {
          //   userStore.ui.setFieldValue("disableContinue", false);
          // } else {
          //   userStore.ui.setFieldValue("disableContinue", true);
          // }
          userStore.ui.setFieldValue("disableContinue", false);
          break;
        }
        case "Signature": {
          if (signatureLoaded) {
            userStore.ui.setFieldValue("disableContinue", false);
          } else if (userStore.nftInput.localSignature) {
            userStore.ui.setFieldValue("disableContinue", false);
          } else {
            userStore.ui.setFieldValue("disableContinue", true);
          }
        }
        default: {
          break;
        }
      }
    }, [
      userStore.ui.step,
      photo,
      colorsSet,
      editingMode,
      userStore.nftInput.color_top,
      userStore.nftInput.color_bottom,
      userStore.nftInput.localPhoto,
      userStore.nftInput.mux_upload_id,
      userStore.nftInput.mux_playback_id,
      userStore.nftInput.mux_asset_id,
      userStore.nftInput.count_renditions,
      userStore.nftInput.localSignature,
    ]);

    async function handleSubmit(e: React.FormEvent) {
      if (readOnly) return;
      userStore.ui.setFieldValue("formSubmitting", true);

      const data = new FormData(e.target as HTMLFormElement);

      switch (userStore.ui.step) {
        case "Basic Info": {
          // need to check if should skip
          if (nft) {
            const skip = basicInfoSkip(nft, data);
            if (skip) {
              userStore.ui.nextStep();
              break;
            }
          }
          const { success, message } = await updateBasicInfo(e);
          if (!success) {
            toast({
              position: "top",
              status: "error",
              description: message,
              duration: 3000,
              isClosable: true,
            });
          }
          break;
        }
        case "Photo": {
          // check to skip
          if (photo && !userStore.nftInput.localPhoto) {
            userStore.ui.nextStep();
            break;
          }
          const { success, message } = await updatePhoto(
            e,
            nftId || userStore.nft?.id
          );
          break;
        }
        case "Background": {
          // check to skip
          if (nft) {
            const skip = colorSkip(nft, colorTop, colorBottom);
            if (skip) {
              userStore.ui.nextStep();
              if (!userStore.ui.flipVideo) {
                userStore.ui.setFieldValue("flipVideo", true);
              }
              break;
            }
          }
          const { success, message } = await updateColors(
            nftId || userStore.nft?.id,
            userStore.nftInput.color_top,
            userStore.nftInput.color_bottom
          );
          if (success && !userStore.ui.flipVideo) {
            userStore.ui.setFieldValue("flipVideo", true);
          }
          break;
        }
        case "Video": {
          if (videoSet) {
            userStore.ui.nextStep();
            break;
          }
          if (
            userStore.nftInput.mux_upload_id &&
            userStore.nftInput.mux_playback_id &&
            userStore.nftInput.mux_asset_id &&
            userStore.nftInput.count_renditions
          ) {
            const { success, message } = await updateVideo(
              nftId || userStore.nft?.id,
              userStore.nftInput.mux_upload_id,
              userStore.nftInput.mux_asset_id,
              userStore.nftInput.mux_playback_id,
              userStore.nftInput.count_renditions
            );
          } else {
            setShowVideoAlert(true);
          }
          break;
        }
        case "Signature": {
          if (signatureLoaded) {
            userStore.ui.nextStep();
            break;
          }
          if (userStore.nftInput.localSignature) {
            const { success, message } = await updateSignature(
              nftId || userStore.nft?.id,
              userStore.nftInput.localSignature,
              isMobile
            );
          } else {
            toast({
              position: "top",
              status: "error",
              description: "Signature not uploaded",
              duration: 3000,
              isClosable: true,
            });
          }
          break;
        }
        default: {
          break;
        }
      }
      userStore.ui.setFieldValue("formSubmitting", false);
    }

    async function formChange(e: React.FormEvent) {
      if (readOnly) return;
      /**
       * This checks on form entry to disable the continue button
       * if form fields aren't filled out
       */
      e.preventDefault();

      const local_ref = ref as MutableRefObject<HTMLFormElement>;

      if (local_ref?.current) {
        const data = new FormData(local_ref.current as HTMLFormElement);

        const json_data = JSON.stringify(Object.fromEntries(data));

        let disableContinue = false;
        switch (userStore.ui.step) {
          case "Basic Info":
            {
              const basicInfoFields = [
                "first_name",
                "last_name",
                "school",
                "state",
                "year",
                "position",
                "sport",
              ];

              for (const [key, value] of data) {
                if (value == "" && basicInfoFields.includes(key)) {
                  disableContinue = true;
                }
              }

              runInAction(() => {
                userStore.ui.disableContinue = disableContinue;
              });
            }
            break;
          case "Photo": {
            break;
          }
          default: {
            break;
          }
        }
      }
    }

    useEffect(() => {
      if (readOnly) return;
      document.getElementById(currentInput)?.focus();
    }, [currentInput]);

    let editButton;

    if (readOnly) {
      editButton = null;
    } else if (editButtonState === "add") {
      editButton = <BluePlus />;
    } else if (editButtonState === "delete") {
      editButton = <BlueX />;
    } else if (editButtonState === "accept") {
      editButton = <CheckButton />;
    } else {
      editButton = null;
    }

    const component = (
      <form
        onSubmit={handleSubmit}
        onChange={formChange}
        ref={ref}
        onLoad={formChange}
      >
        <input hidden={true} name="nftId" value={nftId || userStore.nft?.id} />
        <CardWrapper
          photo={photo || "/card-assets/front-image.png"}
          color_top={colorTop}
          color_bottom={colorBottom}
          signatureFile={signature}
          signatureRotate={!signatureLoaded && isMobile}
          nftWidth={nftWidth}
          rotation={userStore.nftInput.preview_rotation}
        >
          <div
            className="card card-container"
            onClick={() => {
              if (!preventFlip) {
                flipCard();
              }
            }}
            style={cssTransform}
          >
            <div className="card front">
              <div className="solid-background"></div>
              <div className="gradient-background"></div>
              <Image
                src="/card-assets/white-logo.png"
                pos="absolute"
                top="140px"
                left="18px"
                w="90px"
              />
              {!isLoading ? (
                <>
                  {userStore.ui.step === "Basic Info" ? null : userStore.ui
                      .step === "Photo" ? (
                    <div className="front-image front-image-glow"></div>
                  ) : (
                    <div className="front-image"></div>
                  )}
                  <div className="front-overlay"></div>
                  {editingMode === "Photo" && !readOnly && (
                    <motion.div
                      variants={{
                        pulse: {
                          scale: [3, 4],
                          transition: {
                            duration: 1,
                            repeat: Infinity,
                            repeatType: "reverse",
                          },
                        },
                      }}
                      animate={"pulse"}
                      className="photo-button"
                      onClick={(e) => {
                        if (editButtonState === "add") {
                          userStore.ui.setBottomEditComponent("photo-upload");
                          setEditButtonState("delete");
                        } else if (editButtonState === "delete") {
                          if (userStore.nftInput.localPhoto) {
                            userStore.nftInput.resetLocalPhoto();
                            setPhoto("");
                            setEditButtonState("add");
                          }
                        } else if (editButtonState === "accept") {
                          // console.log("accept");
                        }
                        e.stopPropagation();
                      }}
                    >
                      {editButton}
                    </motion.div>
                  )}
                  {editingMode === "Background" && !readOnly && (
                    <>
                      <div
                        className="background-button-one"
                        onClick={(e) => {
                          userStore.ui.setBottomEditComponent("background-top");
                          e.stopPropagation();
                        }}
                      >
                        {editButton}
                      </div>
                      <div
                        className="background-button-two"
                        onClick={(e) => {
                          userStore.ui.setBottomEditComponent(
                            "background-bottom"
                          );
                          e.stopPropagation();
                        }}
                      >
                        {editButton}
                      </div>
                    </>
                  )}
                  {editingMode === "Signature" && !readOnly && isMobile && (
                    <div
                      className="signature-button"
                      onClick={(e) => {
                        if (editButtonState === "add") {
                          userStore.ui.setBottomEditComponent("signature");
                          setEditButtonState("delete");
                        } else if (editButtonState === "delete") {
                          userStore.nftInput.setLocalSignature(null);
                          setSignature("");
                          setEditButtonState("add");
                        }
                        e.stopPropagation();
                      }}
                    >
                      {editButton}
                    </div>
                  )}

                  <InlineEdit
                    value={firstName}
                    setValue={setFirstName}
                    placeholder="First Name"
                    nextInput="lastName"
                    currentInputVal={[currentInput, setCurrentInput]}
                    input="firstName"
                    fontWeight="600"
                    pos="absolute"
                    w="350px"
                    className="name first"
                    readOnly={readOnly}
                  />

                  <InlineEdit
                    value={lastName}
                    setValue={setLastName}
                    placeholder="Last Name"
                    nextInput="school"
                    currentInputVal={[currentInput, setCurrentInput]}
                    input="lastName"
                    pos="absolute"
                    w="350px"
                    className="name last"
                    readOnly={readOnly}
                  />

                  {editingMode === "Basic Info" && !readOnly ? (
                    <HStack pos="absolute" top="645px" color="#e66465">
                      <Box position="relative">
                        <InlineEdit
                          value={school}
                          setValue={setSchool}
                          placeholder="School"
                          nextInput="state"
                          currentInputVal={[currentInput, setCurrentInput]}
                          input="school"
                          className="school-state"
                          readOnly={readOnly}
                        />
                      </Box>
                      <Box position="relative">
                        <InlineEdit
                          value={state}
                          setValue={setState}
                          placeholder="State"
                          nextInput="year"
                          currentInputVal={[currentInput, setCurrentInput]}
                          input="state"
                          className="school-state"
                          readOnly={readOnly}
                        />
                      </Box>
                    </HStack>
                  ) : (
                    <HStack pos="absolute" top="645px" color="#e66465">
                      <div className="school-state">
                        {school}, {state}
                      </div>
                    </HStack>
                  )}

                  <HStack
                    pos="absolute"
                    top="690px"
                    w="95%"
                    justifyContent="space-around"
                  >
                    <VStack w="33%" position="relative">
                      <Text fontSize="16px" color="gray.400">
                        Year
                      </Text>
                      <InlineEdit
                        value={year}
                        setValue={setYear}
                        placeholder="Grad Year"
                        nextInput="position"
                        currentInputVal={[currentInput, setCurrentInput]}
                        input="year"
                        className="details"
                        readOnly={readOnly}
                      />
                    </VStack>
                    <VStack w="33%" position="relative">
                      <Text fontSize="16px" color="gray.400">
                        Position
                      </Text>
                      <InlineEdit
                        value={position}
                        setValue={setPosition}
                        placeholder="Position"
                        nextInput="sport"
                        currentInputVal={[currentInput, setCurrentInput]}
                        input="position"
                        className="details"
                        ref={ref}
                        readOnly={readOnly}
                      />
                    </VStack>
                    <VStack w="33%" position="relative">
                      <Text fontSize="16px" color="gray.400">
                        Sport
                      </Text>
                      <InlineEdit
                        value={userStore.nftInput.sport}
                        setValue={setSport}
                        placeholder="Sport"
                        nextInput=""
                        currentInputVal={[currentInput, setCurrentInput]}
                        input="sport"
                        className="details"
                        onClick={() => {
                          if (readOnly) return;
                          userStore.ui.setCardFormModal(true, "sport");
                        }}
                        ref={ref}
                        readOnly={readOnly}
                      />
                    </VStack>
                  </HStack>
                  {signature === "" && !readOnly && (
                    <div className="signature-input-text">
                      <p>Your Signature</p>
                    </div>
                  )}
                  <div className="signature"></div>
                </>
              ) : (
                <Spinner size={"xl"} position="absolute" top="50%" />
              )}
            </div>
            <div className="card reverse">
              <div className="background">
                <div className="background-gradient">
                  <div className="background-gradient reverse-background-mask">
                    <VideoPlayer
                      src={muxPlaybackId}
                      max_resolution={muxMaxResolution}
                      // crop_values={crop_values}
                      // slow_video={slow_video}
                    />
                    <div className="reverse-logo-background"></div>
                    <img
                      className="reverse-verified-logo"
                      src="/img/Logo.png"
                    />
                  </div>
                </div>
              </div>
              {editingMode === "Video" && !readOnly && (
                <motion.div
                  variants={{
                    pulse: {
                      scale: [3, 4],
                      transition: {
                        duration: 1,
                        repeat: Infinity,
                        repeatType: "reverse",
                      },
                    },
                  }}
                  animate={"pulse"}
                  className="video-button"
                  onClick={(e) => {
                    if (editButtonState === "add") {
                      userStore.ui.setBottomEditComponent("video-upload");
                      setEditButtonState("delete");
                    } else if (editButtonState === "delete") {
                      userStore.nftInput.deleteThisVideo();
                      setMuxPlaybackId("");
                      setEditButtonState("add");
                    }
                    e.stopPropagation();
                  }}
                >
                  {editButton}
                </motion.div>
              )}
            </div>
          </div>
        </CardWrapper>
        <AlertDialog
          isOpen={showVideoAlert}
          leastDestructiveRef={alertRef}
          onClose={() => setShowVideoAlert(false)}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogBody pt={6}>
                Are you sure you don't want add a video?
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={alertRef} onClick={() => setShowVideoAlert(false)}>
                  No, I'll add one
                </Button>
                <Button
                  background="viBlue"
                  color="white"
                  onClick={() => {
                    userStore.ui.nextStep();
                    setShowVideoAlert(false);
                  }}
                  ml={3}
                >
                  Yes, Continue
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </form>
    );

    return readOnly ? (
      component
    ) : (
      <VStack alignItems="center" overflow={"hidden"}>
        <Box w="350px" h="637.3">
          {component}
        </Box>
      </VStack>
    );
  }
);

const InlineEdit = observer(
  forwardRef<HTMLFormElement, any>(
    (
      {
        value,
        setValue,
        nextInput,
        placeholder = "",
        currentInputVal = useState(""),
        input = "",
        className = null,
        readOnly = false,
        ...other
      },
      ref
    ) => {
      const inputRef = useRef<HTMLInputElement | null>(null);
      const [editingValue, setEditingValue] = useState(value);
      const [currentInput, setCurrentInput] = currentInputVal;

      useEffect(() => {
        setEditingValue(value);
      }, [value]);

      const onChange = (event: any) => {
        if (readOnly) return;
        setEditingValue(event.target.value);
        if (input === "year") {
          const year = event.target.value.replace(/[^0-9]/g, "");
          setEditingValue(year);
        }
      };

      const clearInput = () => {
        if (readOnly) return;
        setValue("");
        setEditingValue("");
      };

      const onFocus = (event: any) => {
        if (readOnly) return;
        setCurrentInput(input);

        if (input === "sport") {
          inputRef?.current?.blur();
          if (!userStore.ui.openCardFormModal) {
            // blur input
            userStore.ui.setCardFormModal(true, "sport");
          }
        }
      };

      const onKeyDown = (event: any) => {
        if (readOnly) return;
        if (event.key === "Enter" || event.key === "Escape") {
          if (editingValue) {
            setValue(editingValue);
          } else {
            setValue(value);
          }
          setCurrentInput(nextInput);
        }
        if (event.key === "Enter") {
          if (currentInput === "sport" && userStore.ui.step === "Basic Info") {
            if (ref) {
              inputRef?.current?.blur();
              // @ts-ignore
              ref.current?.dispatchEvent(
                new Event("submit", { cancelable: true, bubbles: true })
              );
            }
          }
        }
      };

      const onBlur = (e: any) => {
        if (readOnly) return;
        setValue(editingValue);
        if (input === "year") {
          if (editingValue.length < 2) {
            setEditingValue("");
            setValue("");
          } else if (typeof editingValue === "string") {
            const year = editingValue.replace(/[^0-9]/g, "");
            setEditingValue("'" + year.slice(-2));
            setValue("'" + year.slice(-2));
          }
        }
      };

      return (
        <Box display="inline" className={className ? className : ""} {...other}>
          <input
            ref={inputRef}
            name={input}
            id={input}
            placeholder={placeholder}
            className={"inline-edit" + (className ? " " + className : "")}
            type={input == "year" ? "text" : "text"}
            // inputMode={input=="year" ? "tel" : "text"}
            aria-label={input}
            value={editingValue}
            onChange={onChange}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            enterKeyHint="next"
            disabled={readOnly}
            onClick={(e) => {
              if (readOnly) return;
              if (input === "sport") {
                userStore.ui.setCardFormModal(true, "sport");
              }
              e.stopPropagation();
            }}
          />
          {currentInput === input ? (
            editingValue != "" ? (
              <Box
                position="absolute"
                top="0%"
                right="0%"
                display="flex"
                alignItems={"center"}
                disabled={readOnly}
                onClick={(e) => {
                  if (readOnly) return;
                  clearInput();
                  setEditingValue("");
                  setValue("");
                  runInAction(() => {
                    userStore.ui.disableContinue = true;
                  });
                  inputRef?.current?.focus();
                  e.stopPropagation();
                }}
                zIndex={1}
                sx={{
                  ["> svg"]: {
                    transform: "scale(1.5)",
                  },
                }}
              >
                <BlueX />
              </Box>
            ) : (
              editingValue === "" && (
                <Box
                  position="absolute"
                  top="0%"
                  right="0%"
                  display="flex"
                  alignItems={"center"}
                  disabled={readOnly}
                  onClick={(e) => {
                    if (readOnly) return;
                    if (input === "sport") {
                      userStore.ui.setCardFormModal(true, "sport");
                    } else {
                      inputRef?.current?.focus();
                    }
                    e.stopPropagation();
                  }}
                  zIndex={1}
                  sx={{
                    ["> svg"]: {
                      transform: "scale(1.5)",
                    },
                  }}
                >
                  <BluePlus />
                </Box>
              )
            )
          ) : null}
        </Box>
      );
    }
  )
);

export default observer(VerifiedInkNft);
