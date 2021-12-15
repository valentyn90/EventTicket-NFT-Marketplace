import { getCropVideoData, saveCropVideoData } from "@/supabase/admin";
import { supabase } from "@/supabase/supabase-client";
import { getUserDetails } from "@/supabase/userDetails";
import CropValue from "@/types/CropValue";
import { Button } from "@chakra-ui/button";
import {
  Box,
  Center,
  Container,
  Flex,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import { Switch } from "@chakra-ui/switch";
import { Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/table";
import { useToast } from "@chakra-ui/toast";
import { GetServerSideProps } from "next";
import React, { CSSProperties, useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";

const Wrapper = styled.div`
  .crop-container {
    position: relative;
    width: 500px;
    height: 500px;
    margin: 30px auto;
  }

  .crop-div {
    position: relative;
    width: 500px;
  }

  .overlay {
    position: absolute;
    width: 180px;
    height: 281px;
    border: 1px solid #fff;
  }

  .mask-div {
    position: relative;
    width: 500px;
    height: 281px;
    clip-path: inset(0 320px 0 0);
  }

  .overlay-mask {
    position: absolute;
    width: 180px;
    height: 281px;
    border: 1px solid #fff;
    left: 50%;
    transform: translateX(-50%);
  }

  video {
    position: absolute;
  }

  .controls {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 50%;
    transform: translateX(-50%);
    height: 80px;
    display: flex;
    align-items: center;
  }

  .slider {
    padding: 22px 0px;
  }
`;

interface Props {
  id: number;
}

interface StyleProps {
  crop_keyframes: string;
  video_length: number;
}

const dynamicKeyFrames = (frames: string) => keyframes`
  ${frames}
`;

const CenteredVideo = styled.div<StyleProps>`
  animation: ${(props) => dynamicKeyFrames(props.crop_keyframes)}
    ${(props) => props.video_length.toFixed(2)}s ease-in-out infinite;
  position: absolute;
  width: 500px;
  height: 281px;
`;

const CropId: React.FC<Props> = ({ id }) => {
  const toast = useToast();
  const [loaded, setLoaded] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [muxId, setMuxId] = useState("");
  const [videoLength, setVideoLength] = useState(50.827);
  const [slowVideo, setSlowVideo] = useState(false);
  const [savingCrop, setSavingCrop] = useState(false);
  const [cropKeyframes, setCropKeyframes] = useState("");
  const [cropValues, setCropValues] = useState<CropValue[]>([]);
  const [pause, setPause] = useState(false);
  //Holds the positions of the crops in the format expected by keyframes above
  // const [positions, setPositions] = useState<string[]>([]);

  const [cssProperties, setCssProp] = useState<CSSProperties>({});
  const [cssPropertiesPlay, setCssPropPlay] = useState<CSSProperties>({});

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoRefPlay = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    getCropVideoData(id).then(({ data, error }) => {
      setLoaded(true);
      if (data) {
        setMuxId(data.mux_playback_id || "");
        setSlowVideo(data.slow_video || false);
        setCropValues(data.crop_values || []);
      } else if (error) {
        console.log(error);
        toast({
          position: "top",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    });
  }, [id]);

  useEffect(() => {
    const theKeyframes = cropValues
      ?.map((val: CropValue) => {
        return `${val.percent_playback}% { left: -${
          val.percent_offset * 500
        }px; }\n`;
      })
      .join()
      .replace(/,/g, "");
    setCropKeyframes(theKeyframes);
  }, [cropValues]);

  useEffect(() => {
    if (slowVideo) {
      if (videoRef.current) {
        videoRef.current.playbackRate = 0.75;
      }
      if (videoRefPlay.current) {
        videoRefPlay.current.playbackRate = 0.75;
      }
    } else {
      if (videoRef.current) {
        videoRef.current.playbackRate = 1;
      }
      if (videoRefPlay.current) {
        videoRefPlay.current.playbackRate = 1;
      }
    }
  }, [slowVideo]);

  function videoControl() {
    if (videoRef.current) {
      if (pause) {
        setPause(false);
        videoRef.current.play();
      } else {
        setPause(true);
        videoRef.current.pause();
      }
    }
  }

  function handleSpacedown(e: KeyboardEvent): any {
    if (videoLoaded) {
      if (e.key === " ") {
        e.preventDefault();
        videoControl();
      }
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      handleSpacedown(e);
    });
    return () => {
      window.removeEventListener("keydown", (e) => {
        handleSpacedown(e);
      });
    };
  }, [videoLoaded, pause, videoRef, videoRefPlay]);

  function recordCrop(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const video: HTMLVideoElement | null = videoRef.current;
    let x = e.clientX - e.currentTarget.offsetLeft;
    let y = e.clientY - e.currentTarget.offsetTop;

    let center = Math.min(Math.max(x - 90, 0), 500 - 180);

    setCssProp({
      left: `${center}px`,
    });

    let right_offset = Math.min(Math.max(x - 250, -160), 160);
    setCssPropPlay({
      left: `-${center}px`,
    });

    let time = Number(
      ((video!.currentTime / video!.duration) * 100).toFixed(2)
    );

    let css_string = `${time}%, { left: -${center}px; }`;

    setCropValues([
      {
        percent_playback: time,
        percent_offset: center / 500,
      },
      ...cropValues,
    ]);

    // setPositions(positions.concat([css_string]));
  }

  function orderCropValues() {
    let ordered_values = cropValues.sort((a, b) => {
      return a.percent_playback - b.percent_playback;
    });
    // add a value at percent_playback = 0 if it doesn't exist
    ordered_values = [
      ...ordered_values,
      {
        percent_playback: 100,
        percent_offset:
          ordered_values[ordered_values.length - 1].percent_offset,
      },
    ];

    ordered_values = [
      ...ordered_values,
      {
        percent_playback: 0,
        percent_offset: ordered_values[0].percent_offset,
      },
    ];

    return ordered_values;
  }

  async function handleSaveCropClick() {
    setSavingCrop(true);

    const { data, error } = await saveCropVideoData(
      id,
      orderCropValues(),
      slowVideo
    );
    setSavingCrop(false);
    if (data) {
      toast({
        position: "top",
        description: "Saved crop to DB",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else if (error) {
      toast({
        position: "top",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  function handleResetFrames() {
    setCropValues([]);
  }

  function handleDeleteFrame(index: number) {
    if (index > -1) {
      setCropValues([
        ...cropValues.slice(0, index),
        ...cropValues.slice(index + 1),
      ]);
    }
  }

  function goToFrame(time: number) {
    const frameTime = videoLength * (time / 100);
    if (videoRef.current) {
      videoRef.current.currentTime = frameTime;
      // videoRef.current!.pause();
    }
  }

  function handleVideoMetadataLoaded() {
    setVideoLength(videoRef.current?.duration as number);
    setVideoLoaded(true);
    if (slowVideo) {
      if (videoRef.current) {
        videoRef.current.playbackRate = 0.75;
      }
      if (videoRefPlay.current) {
        videoRefPlay.current.playbackRate = 0.75;
      }
    } else {
      if (videoRef.current) {
        videoRef.current.playbackRate = 1;
      }
      if (videoRefPlay.current) {
        videoRefPlay.current.playbackRate = 1;
      }
    }
  }

  return (
    <Wrapper>
      <Container maxW="full" p={8}>
        {!loaded ? (
          <Center>
            <Spinner size="xl" mt={12} />
          </Center>
        ) : (
          <>
            <Text
              fontSize="xl"
              fontWeight="bold"
              textAlign="center"
              mb={4}
              marginInline={20}
            >
              The video on the right is showing the video as it would be seen on
              the card. Space bar will play/pause.
            </Text>

            <Flex justify="space-around" align="flex-start">
              <Box>
                <Text fontSize="2xl" textAlign="center">
                  Crop
                </Text>
                <div className="crop-div" onClick={recordCrop}>
                  <video
                    onLoadedMetadata={handleVideoMetadataLoaded}
                    id="video"
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    loop
                  >
                    <source
                      src={`https://stream.mux.com/${muxId}/low.mp4`}
                      type="video/mp4"
                    />
                  </video>
                  <div className="overlay" style={cssProperties}></div>
                </div>
              </Box>
              <Box>
                <Text fontSize="2xl" textAlign="center">
                  Preview
                </Text>
                <div className="mask-div">
                  <CenteredVideo
                    crop_keyframes={cropKeyframes}
                    video_length={videoLength}
                  >
                    <video
                      onLoadedMetadata={handleVideoMetadataLoaded}
                      id="video"
                      className="video-play"
                      style={cssPropertiesPlay}
                      ref={videoRefPlay}
                      autoPlay
                      playsInline
                      muted
                      loop
                    >
                      <source
                        src={`https://stream.mux.com/${muxId}/low.mp4`}
                        type="video/mp4"
                      />
                    </video>
                  </CenteredVideo>
                </div>
              </Box>
            </Flex>
            <VStack mt={8} spacing={8}>
              <Button onClick={videoControl}>
                {pause ? "Play video" : "Pause video"}
              </Button>
              <HStack>
                <Text>Slow video to 75%</Text>
                <Switch
                  isChecked={slowVideo}
                  onChange={() => setSlowVideo(!slowVideo)}
                />
              </HStack>
              <HStack spacing={12}>
                <Button colorScheme="teal" onClick={handleSaveCropClick}>
                  {savingCrop ? <Spinner /> : "Save crop"}
                </Button>
                <Button colorScheme="orange" onClick={handleResetFrames}>
                  Reset frames
                </Button>
              </HStack>
              <Text>Crop values:</Text>
              <pre
                style={{
                  marginTop: "1rem",
                  border: "1px solid gray",
                  padding: "1rem",
                  borderRadius: "10px",
                }}
              >
                <Table>
                  <Thead>
                    <Tr>
                      <Th>Percent_Playback</Th>
                      <Th>Percent_Offset</Th>
                      <Th>Go to frame</Th>
                      <Th>Delete frame</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {cropValues?.map((val, i) => (
                      <Tr key={i}>
                        <Td>{val.percent_playback}</Td>
                        <Td>-{val.percent_offset}</Td>
                        <Td>
                          <Button
                            onClick={() => goToFrame(val.percent_playback)}
                          >
                            Go to frame
                          </Button>
                        </Td>
                        <Td>
                          <Button
                            colorScheme="red"
                            onClick={() => handleDeleteFrame(i)}
                          >
                            <span
                              style={{
                                transform: "rotate(45deg)",
                                fontSize: "1.2rem",
                              }}
                            >
                              +
                            </span>
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </pre>
            </VStack>
          </>
        )}
      </Container>
    </Wrapper>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
}) => {
  const { user } = await supabase.auth.api.getUserByCookie(req);
  if (!user) {
    return {
      redirect: {
        destination: "/create",
        permanent: false,
      },
    };
  } else {
    const { data, error } = await getUserDetails(user.id);
    if (data?.role === process.env.NEXT_PUBLIC_ADMIN_ROLE) {
      // is admin
      const { id } = params as any;
      return {
        props: { id },
      };
    } else {
      return {
        redirect: {
          destination: "/create",
          permanent: false,
        },
      };
    }
  }
};

export default CropId;
