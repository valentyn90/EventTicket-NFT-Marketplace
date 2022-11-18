import userStore from "@/mobx/UserStore";
import useWindowDimensions from "@/utils/useWindowDimensions";
import { Box, Button, CloseButton, HStack, Text } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import SignaturePad from "react-signature-pad-wrapper";

const SignatureUpload = () => {
  const { height, width } = useWindowDimensions();
  const signatureRef: any = useRef(null);
  const signatureBoxRef: any = useRef(null);
  const [signatureHeight, setSignatureHeight] = useState(0);
  const [heightLoaded, setHeightLoaded] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (width && width <= 992) {
      if (height && !heightLoaded) {
        setSignatureHeight(height);
        setHeightLoaded(true);
      }
    } else {
      if (signatureBoxRef.current) {
        setSignatureHeight(signatureBoxRef.current.offsetHeight);
        setHeightLoaded(true);
      }
    }
  }, [height, width, signatureBoxRef]);

  function handleClear() {
    if (signatureRef) {
      signatureRef.current.instance.clear();
    }
    if (userStore.nftInput.localSignature) {
      userStore.nftInput.setLocalSignature("");
    }
  }

  function handleFinishAndClose() {
    userStore.nftInput.setLocalSignature(signatureRef);
    userStore.ui.setBottomEditComponent("");
  }

  function handleSignatureUpdate() {
    if (width && width > 992 && signatureRef.current !== null) {
      userStore.nftInput.setLocalSignature(signatureRef);
    }
  }

  return (
    <>
      <Box
        background={["blueBlack2", "blueBlack2", "none"]}
        position={["fixed", "fixed", "unset"]}
        px={["8", "8", "0"]}
        py="8"
        top="0"
        zIndex={["10000", "10000", "unset"]}
        bottom="0"
        width={["100vw", "100vw", "90%"]}
        height={[
          "calc(100vh - calc(100vh - 100%))",
          "calc(100vh - calc(100vh - 100%))",
          "70%",
        ]}
        display="flex"
        flexDir={"column"}
      >
        <Box
          display="flex"
          flexDir={"column"}
          transformOrigin="top left"
          width={[`calc(100vh - 4rem)`, `calc(100vh - 4rem)`, "100%"]}
          height={["calc(100vw - 4rem)", "calc(100vw - 4rem)", "auto"]}
          left={0}
          top={0}
          transform={[
            "rotate(90deg) translateY(-100%)",
            "rotate(90deg) translateY(-100%)",
            "unset",
          ]}
        >
          <Box
            display="flex"
            justifyContent={["space-between", "space-between", "flex-end"]}
            alignItems="flex-end"
            w="100%"
          >
            <HStack align="center" flex={1} display={["flex", "flex", "none"]}>
              <CloseButton
                onClick={() => userStore.ui.setBottomEditComponent("")}
              />
              <Text>Signature</Text>
            </HStack>
            <HStack spacing={4} flex={3} justify={"flex-end"} mb={[0, 0, 4]}>
              <Button disabled={signatureRef === null} onClick={handleClear}>
                Clear
              </Button>
              <Button
                colorScheme={"blue"}
                color="white"
                onClick={handleFinishAndClose}
                display={["inline-flex", "inline-flex", "none"]}
              >
                Finish & Close
              </Button>
            </HStack>
            <Box flex={1} display={["block", "block", "none"]}></Box>
          </Box>
        </Box>
        <Box
          zIndex="10001"
          position={["fixed", "fixed", "unset"]}
          top="0"
          left="0"
          width={["80vw", "80vw", "100%"]}
          height={[
            "calc(100vh - calc(100vh - 100%))",
            "calc(100vh - calc(100vh - 100%))",
            "100%",
          ]}
          background="transparent"
          padding={["2rem 1rem", "2rem 1rem", "0"]}
        >
          <Box
            height="100%"
            width="100%"
            background="blueBlack"
            ref={signatureBoxRef}
            onTouchEnd={handleSignatureUpdate}
            onMouseDown={() => setTouched(true)}
            onClick={() => {
              handleSignatureUpdate();
            }}
            onMouseLeave={() => {
              if (touched) {
                handleSignatureUpdate();
              }
            }}
          >
            {signatureHeight > 0 && (
              <SignaturePad
                ref={signatureRef}
                options={{
                  minWidth: 1.5,
                  maxWidth: 3.5,
                  penColor: "white",
                  dotSize: 3,
                }}
                height={signatureHeight}
              />
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default SignatureUpload;
