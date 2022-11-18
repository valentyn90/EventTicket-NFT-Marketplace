import UploadCircle from "@/svgs/UploadCircle";
import {
  Box,
  CloseButton,
  HStack,
  Image,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { SyntheticEvent, useEffect, useMemo, useState } from "react";
import { checkImageSize, resizeImageFile } from "@/utils/imageFileResizer";
import { useDropzone } from "react-dropzone";
import dataURLtoFile from "@/utils/dataUrlToFile";
import axios from "axios";
import userStore from "@/mobx/UserStore";
import { observer } from "mobx-react-lite";
import { AiOutlineRotateRight } from "react-icons/ai";
import { toJS } from "mobx";

interface Props {
  cardRef: React.RefObject<HTMLFormElement>;
}

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

const PhotoUploadComponent: React.FC<Props> = ({ cardRef }) => {
  useEffect(() => {
    return () => {
      userStore.nftInput.setPhotoUploading(false);
    };
  }, []);

  async function clipImage(
    file: any
  ): Promise<{ photo: File; photoName: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = async function (reader) {
        const res = await axios
          .post("/api/create-clipping", {
            // @ts-ignore
            file: reader.target.result,
          })
          .then(async function (resp: any) {
            const base64Image = dataURLtoFile(
              resp.data,
              file.name.replace(".JPEG", ".png")
            );
            // @ts-ignore
            resolve({
              photo: base64Image,
              photoName: file.name.replace(".JPEG", ".png"),
            });
          });
      };
    });
  }
  async function handleRotate(e: SyntheticEvent) {
    e.stopPropagation();
    const rotation =
      userStore.nftInput.preview_rotation + 90 > 360
        ? 0
        : userStore.nftInput.preview_rotation + 90;

    const { width, height }: any = await checkImageSize(
      userStore.nftInput.localPhoto
    );

    const photoFileToUpload = await resizeImageFile(
      userStore.nftInput.localPhoto,
      width,
      height,
      100,
      rotation
    );

    userStore.nftInput.setLocalPhoto(photoFileToUpload as File);
  }

  async function onDrop(files: any) {
    const file = files[0];
    userStore.nftInput.setInputValue("ogPhoto", file);

    userStore.nftInput.setPhotoUploading(true);

    const clippedImage = await clipImage(file);

    userStore.nftInput.setLocalPhoto(clippedImage.photo);

    // This isn't saving. It should just save here.
    cardRef.current?.dispatchEvent(
      new Event("submit", { cancelable: true, bubbles: true })
    );
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
      "image/*": [],
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
      <Text fontSize={"2xl"} display={["none", "none", "block"]}>
        Upload your profile picture below.
      </Text>
      <HStack
        w="100%"
        align="start"
        justify={"space-between"}
        display={["flex", "flex", "none"]}
      >
        <Text mb={2}>Profile Picture</Text>
        <CloseButton
          onClick={() => userStore.ui.setFieldValue("bottomEditComponent", "")}
        />
      </HStack>
      <div {...getRootProps({ style: style as any })}>
        <input {...getInputProps()} />
        {/* <Image
              opacity=".5"
              width="auto"
              maxW="125px"
              objectFit="cover"
              height="auto"
              maxH="100px"
              transform={`rotate(${userStore.nftInput.preview_rotation}deg)`}
              src={imgSrc}
              alt="High school football player"
              boxShadow="2xl"
            /> */}
        {userStore.nftInput.localPhoto && (
          <HStack my={2}>
            <Text>Rotate Image:</Text>
            <AiOutlineRotateRight
              onClick={handleRotate}
              style={{
                cursor: "pointer",
                width: "30px",
                height: "30px",
                margin: "10px",
              }}
            />
          </HStack>
        )}
        <Box
          bg="blueBlack"
          height="100%"
          mt={4}
          py={14}
          px={2}
          borderRadius="3px"
          display="flex"
          flexDir={"column"}
          alignItems="center"
          justifyContent={"center"}
        >
          {userStore.nftInput.photoUploading ? <Spinner /> : <UploadCircle />}

          <Text mt={4} fontSize={"1.2rem"}>
            Drop your image here or <span className="blue-text">browse</span>
          </Text>
        </Box>
      </div>
    </Box>
  );
};

export default observer(PhotoUploadComponent);
