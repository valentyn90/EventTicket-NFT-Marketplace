import userStore from "@/mobx/UserStore";
import UploadCircle from "@/svgs/UploadCircle";
import {
  Box,
  CloseButton,
  HStack,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useMemo, useState } from "react";
import * as UpChunk from "@mux/upchunk";
import { useDropzone } from "react-dropzone";

const baseStyle = {
  height: "100%",
};

const activeStyle = {
  borderColor: "#2196f3",
};

const acceptStyle = {
  borderColor: "#00e676",
};

const rejectStyle = {
  borderColor: "#ff1744",
};

const VideoUpload = () => {
  const toast = useToast();
  const [hudlUrl, setHudlUrl] = useState("");
  const [isPreparing, setIsPreparing] = useState(false);
  const [progress, setProgress] = useState<any>(null);
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    let myInterval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }
      if (seconds === 0) {
        clearInterval(myInterval);
      }
    }, 1000);
    return () => {
      clearInterval(myInterval);
    };
  });

  useEffect(() => {
    const nft_id = userStore.nft!.id;

    const user_id = userStore.id || 'tempnft/'+userStore.temp_user_id;
    console.log('user_id', user_id);
    console.log('nft_id', nft_id);

    userStore.nft?.setNftCardScreenshot(nft_id,user_id)
  }, [userStore.loaded]);

  useEffect(() => {
    if (userStore.nftInput.errorMessage) {
      toast({
        position: "top",
        status: "error",
        description: userStore.nftInput.errorMessage,
        duration: 3000,
        isClosable: true,
      });
    }
  }, [userStore.nftInput.errorMessage]);

  const createUpload = async (): Promise<{ muxId: any; muxUrl: any }> => {
    try {
      return fetch("/api/mux/upload", {
        method: "POST",
      })
        .then((res) => res.json())
        .then(({ id, url }) => {
          return { muxId: id, muxUrl: url };
        });
    } catch (e) {
      console.error("Error in createUpload", e);
      return { muxId: null, muxUrl: "" };
    }
  };

  const startUpload = (file: File, endpoint: string) => {
    const upload = UpChunk.createUpload({
      endpoint,
      file,
    });

    upload.on("error", (err) => {
      // setErrorMessage(err.detail)
      console.log(err);
    });

    upload.on("progress", (progress) => {
      setProgress(Math.floor(progress.detail));
    });

    upload.on("success", () => {
      // start the fetch in nftstore methods
      setIsPreparing(true);
      setSeconds(30);
      userStore.nftInput.getMuxUpload();
    });
  };

  async function onDrop(files: any) {
    /**
     * How the mux upload works:
     *
     * 1. Create an upload object that returns an id and upload url
     * 2. Upload file to that url
     * 3. Get upload object by id, check if upload is done (on interval)
     * 4. If an asset id is ready, get that asset (on interval)
     * 5. When uploading asset is ready, update mobx stores and supabase database with mux ids
     * 6. Display using the playback id + VideoPlayer
     */
    const file = files[0];

    userStore.nftInput.setVideoUploading(true);
    const { muxId, muxUrl } = await createUpload();
    userStore.nftInput.setInputValue("mux_upload_id", muxId);
    startUpload(file, muxUrl);
    // startUpload begins a series of async methods
    // Begins upload process to mux, then ends with updating supabase db with mux ids
  }

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop,
    accept: {
      "video/*": [],
    },
    multiple: false,
  });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isDragActive, isDragReject, isDragAccept]
  );

  let uploadComponent;
  if (userStore.nftInput.videoUploading) {
    uploadComponent = isPreparing ? (
      <Box
        mb={2}
        display="flex"
        flexDirection={"column"}
        alignItems="center"
        justifyContent={"center"}
      >
        Preparing...
        <Box>
          {seconds === 0
            ? "We're still working. This can take a few minutes for long videos."
            : `${seconds}s`}
        </Box>
      </Box>
    ) : (
      <Box mb={2}>Uploading...{progress ? `${progress}%` : ""}</Box>
    );
  } else {
    uploadComponent = null;
  }

  return (
    <Box
      borderTop={["1px solid", "1px solid", "none"]}
      borderColor="lightPurple"
      background={["blueBlack2", "blueBlack2", "unset"]}
      position={["fixed", "fixed", "unset"]}
      px="8"
      py="8"
      bottom="0"
      width={["100vw", "100vw", "90%"]}
      display="flex"
      flexDir={"column"}
    >
      <HStack
        w="100%"
        align="start"
        justify={"space-between"}
        display={["flex", "flex", "none"]}
      >
        <Text mb={2}>Action Video</Text>
        <CloseButton
          onClick={() => userStore.ui.setFieldValue("bottomEditComponent", "")}
        />
      </HStack>
      <div {...getRootProps({ style: style as any })}>
        <input
          {...getInputProps()}
          disabled={userStore.nftInput.videoUploading}
        />
        <Box
          bg="blueBlack"
          height="100%"
          px={2}
          py={14}
          mt={2}
          borderRadius="3px"
          display="flex"
          flexDir={"column"}
          alignItems="center"
          justifyContent={"center"}
        >
          <>{uploadComponent}</>
          {userStore.nftInput.videoUploading ? <Spinner /> : <UploadCircle />}
          <Text mt={4} fontSize={"1.2rem"}>
            Drop your video here or <span className="blue-text">browse</span>
          </Text>
        </Box>
      </div>
    </Box>
  );
};

export default VideoUpload;
