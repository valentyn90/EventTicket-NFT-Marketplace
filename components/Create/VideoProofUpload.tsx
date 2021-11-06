import userStore from "@/mobx/UserStore";
import * as UpChunk from "@mux/upchunk";
import { Box, Spinner, Text } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import React, { useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import Card from "../NftCard/Card";
import VideoPlayer from "../Components/VideoPlayer";

const baseStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px",
  borderWidth: 2,
  borderRadius: 2,
  borderColor: "#eeeeee",
  borderStyle: "dashed",
  backgroundColor: "#fafafa",
  color: "#bdbdbd",
  outline: "none",
  width: "100%",
  transition: "border .24s ease-in-out",
  position: "relative",
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

function VideoProofUpload() {
  const [isPreparing, setIsPreparing] = useState(false);
  const [progress, setProgress] = useState<any>(null);
  const [seconds, setSeconds] = useState(30);

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
      setSeconds(30)
      userStore.nft?.getMuxUpload();
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
    userStore.nft?.setFieldValue("mux_upload_id", muxId);
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
    accept: "video/*",
    maxFiles: 1,
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

  let component;

  if (userStore.nftInput.videoUploading) {
    component = (
      <>
        <Spinner size="xl" />
      </>
    );
  } else {
    if (!userStore.nft?.mux_playback_id) {
      component = (
        <>
          <svg
            width="39"
            height="38"
            viewBox="0 0 39 38"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21.5 5H5.5C4.43913 5 3.42172 5.42143 2.67157 6.17157C1.92143 6.92172 1.5 7.93913 1.5 9V29M1.5 29V33C1.5 34.0609 1.92143 35.0783 2.67157 35.8284C3.42172 36.5786 4.43913 37 5.5 37H29.5C30.5609 37 31.5783 36.5786 32.3284 35.8284C33.0786 35.0783 33.5 34.0609 33.5 33V25M1.5 29L10.672 19.828C11.4221 19.0781 12.4393 18.6569 13.5 18.6569C14.5607 18.6569 15.5779 19.0781 16.328 19.828L21.5 25M33.5 17V25M33.5 25L30.328 21.828C29.5779 21.0781 28.5607 20.6569 27.5 20.6569C26.4393 20.6569 25.4221 21.0781 24.672 21.828L21.5 25M21.5 25L25.5 29M29.5 5H37.5M33.5 1V9M21.5 13H21.52"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <br />
          <p>Upload a file or drag and drop</p>
          <p>Video up to 10MB</p>
        </>
      );
    } else {
      component = (
        <>
          <div
            style={{
              position: "absolute",
              top: "0",
              left: "1%",
              fontSize: "25px",
              transform: "rotate(45deg)",
              cursor: "pointer",
              zIndex: 12,
            }}
            onClick={(e) => {
              e.stopPropagation();
              userStore.nft?.deleteThisVideo();
            }}
          >
            +
          </div>
          <Box style={{ opacity: ".5" }}>
            <VideoPlayer
              max_resolution={userStore.nft?.mux_max_resolution}
              src={userStore.nft?.mux_playback_id}
              previewOnly={true}
            />
            {/* <Text>{userStore.nft?.video_name}</Text> */}
          </Box>
        </>
      );
    }
  }

  useEffect(() => {
    let myInterval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }
      if (seconds === 0) {
        clearInterval(myInterval)
      }
    }, 1000)
    return () => {
      clearInterval(myInterval);
    };
  });

  let uploadComponent;
  if (userStore.nftInput.videoUploading) {
    uploadComponent = isPreparing ? (

      <div>Preparing...
        <div>{seconds === 0
          ? "We're still working. This can take a few minutes for long videos."
          :  `${seconds}s`
        }
        </div>

      </div>
    ) : (
      <div>Uploading...{progress ? `${progress}%` : ""}</div>
    );
  } else {
    uploadComponent = null;
  }

  return (
    <Box w="100%">
      <>{uploadComponent}</>
      <div {...getRootProps({ style: style as any })}>
        <input {...getInputProps()} />
        {component}
      </div>
      <Box mt="4" w="100%" display={["block", "block", "none"]} h="500px">
        <Card
          nft_id={userStore.loadedNft?.id}
          nft_width={400}
          reverse={true}
          nft={userStore.loadedNft}
        />
      </Box>
    </Box>
  );
}

export default observer(VideoProofUpload);
