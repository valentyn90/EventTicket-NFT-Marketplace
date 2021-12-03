import { Box, Container, Flex, Text } from "@chakra-ui/layout";
import React, { CSSProperties, useRef, useState } from "react";
import styled, { css, keyframes } from "styled-components";

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
    clip-path: inset(0 160px 0 160px);
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

const dyanmicKeyFrames = (frames: string) => keyframes`
  ${frames}
`;

const Crop: React.FC = () => {
  //Holds the positions of the crops in the format expected by keyframes above
  const [positions, setPositions] = useState<string[]>([]);

  const [cssProperties, setCssProp] = useState<CSSProperties>({});
  const [cssPropertiesPlay, setCssPropPlay] = useState<CSSProperties>({});

  const videoRef = useRef(null);
  const videoRefPlay: any = useRef<HTMLVideoElement>(null);


  let cssFormattedPositions = positions
    .map((pos: string) => {
      return pos + "\n";
    })
    .join()
    .replace(/,/g, "");

  const CenteredVideo = styled.div`
    animation: ${() => dyanmicKeyFrames(cssFormattedPositions)} 50.827s ease-in-out infinite;
    position: absolute;
    width: 500px;
    height: 281px;
  `;

  function recordCrop(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const video: any = videoRef.current;
    let x = e.clientX - e.currentTarget.offsetLeft;
    let y = e.clientY - e.currentTarget.offsetTop;

    let center = Math.min(Math.max(x - 90, 0), 500 - 180);
    setCssProp({
      left: `${center}px`,
    });

    let right_offset = Math.min(Math.max(x - 250, -160), 160);
    setCssPropPlay({
      right: `${right_offset}px`,
    });

    let time = ((video.currentTime / video.duration) * 100).toFixed(2);

    let css_string = `${time}%, { right: ${right_offset}px; }`;

    setPositions(positions.concat([css_string]));

  }

  return (
    <Wrapper>
      <Container maxW="full" p={8}>
        <Text
          fontSize="xl"
          fontWeight="bold"
          textAlign="center"
          mb={4}
          marginInline={20}
        >
          If you don't click, the video on the right is showing a cropped
          version I prepared. Once you click, the video on the right will show
          your crop (but it is still animating).
        </Text>

        <Flex justify="space-around" align="flex-start">
          <Box>
            <Text fontSize="2xl" textAlign="center">
              Crop
            </Text>
            <div className="crop-div" onClick={recordCrop}>
              <video id="video" ref={videoRef} autoPlay playsInline muted loop>
                <source
                  src="https://stream.mux.com/4O202vVwD4xhyOwRS8GP6003bLyvWracxSk2pF9ZKIZuc/high.mp4"
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
              <CenteredVideo>
                <video
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
                    src="https://stream.mux.com/4O202vVwD4xhyOwRS8GP6003bLyvWracxSk2pF9ZKIZuc/high.mp4"
                    type="video/mp4"
                  />
                </video>
              </CenteredVideo>
            </div>
          </Box>
        </Flex>
      </Container>
    </Wrapper>
  );
};

export default Crop;


  // KEEP: If we need to react to somethign that happened in the video
  // function handleEvent(event: any) {
  //     // use a switch/case to check for each event
  //     // console.log(`${videoRefPlay.current.currentTime}\n`);
  // }
  // useEffect(() => {
  //     ['timeupdate',].forEach(event =>
  //         videoRefPlay.current.addEventListener(event, handleEvent)
  //     )
  //     return () => {/* remove all event listeners here */ }
  // }, [videoRefPlay]);