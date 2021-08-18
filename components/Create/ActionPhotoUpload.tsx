import axios from "axios";
import { useUser } from "@/utils/useUser";
import { Box, Image, Text, Spinner } from "@chakra-ui/react";
import React, { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import CardPreview from "./CardPreview";
import Card from "../NftCard/Card";

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

function ActionPhotoUpload() {
  const [loading, setLoading] = useState(false);
  const { setPhotoFileObject, photoFile, deletePhoto, setPhotoFileName, nft } =
    useUser();

  async function onDrop(files: any) {
    setLoading(true);
    const file = files[0];

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async function (reader) {
      const res = await axios
        .post("/api/create-clipping", {
          // @ts-ignore
          file: reader.target.result,
        })
        .then(async function (resp: any) {
          setLoading(false);
          const base64Image = dataURLtoFile(resp.data, file.name);
          // @ts-ignore
          setPhotoFileObject(base64Image);
          setPhotoFileName(file.name);
        });
    };
  }

  function dataURLtoFile(dataurl: any, filename: any) {
    var arr = dataurl.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop,
    accept: "image/jpeg, image/png, image/jpg, image/gif",
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

  return (
    <Box w="100%">
      {loading ? (
        <Spinner />
      ) : (
        <Text mb="4" mt={["4", "4", 0]}>
          Action Shot
        </Text>
      )}
      <div {...getRootProps({ style: style as any })}>
        <input {...getInputProps()} />
        {photoFile === null ? (
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
            <p>PNG, JPG, GIF up to 10MB</p>
          </>
        ) : (
          <>
            <div
              style={{
                position: "absolute",
                top: "2%",
                left: "2%",
                fontSize: "20px",
                transform: "rotate(45deg)",
                cursor: "pointer",
                zIndex: 12,
              }}
              onClick={deletePhoto}
            >
              +
            </div>
            <Image
              opacity=".5"
              maxWidth="80%"
              objectFit="cover"
              height="100px"
              src={
                typeof photoFile === "string"
                  ? photoFile
                  : URL.createObjectURL(photoFile)
              }
              alt="High school football player"
              boxShadow="2xl"
            />
          </>
        )}
      </div>
      <Box mt="4" w="100%" display={["block", "block", "none"]}>
        {photoFile ? (
          <Card />
        ) : (
          <Image
            height="500px"
            src="/img/bobby.png"
            alt="High school football player"
            boxShadow="2xl"
          />
        )}
      </Box>
    </Box>
  );
}

export default ActionPhotoUpload;
