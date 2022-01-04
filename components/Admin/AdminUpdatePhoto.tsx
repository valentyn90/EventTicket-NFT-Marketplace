import userStore from "@/mobx/UserStore";
import {
  attachFileToNft,
  getFileFromSupabase,
  insertFileToSupabase,
  uploadFileToStorage,
} from "@/supabase/supabase-client";
import {
  Box,
  Button,
  HStack,
  Spinner,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";

const AdminUpdatePhoto = () => {
  if (userStore.ui.selectedNft === null) return null;
  const toast = useToast();
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [photoFile, setPhotoFile] = useState(
    "https://verifiedink.us/img/card-mask.png"
  );
  const [newPhotoPreview, setNewPhotoPreview] = useState(
    "https://verifiedink.us/img/card-mask.png"
  );
  const [newPhotoFile, setNewPhotoFile] = useState<File>();

  useEffect(() => {
    getFileFromSupabase(userStore.ui.selectedNft!?.photo_file).then(
      ({ error, file }) => {
        if (file) {
          var uri = URL.createObjectURL(file as Blob);
          setPhotoFile(uri);
        }
        if (error) {
          toast({
            position: "top",
            status: "error",
            description: "Error getting photo",
            duration: 3000,
            isClosable: true,
          });
        }
      }
    );
  }, [userStore.ui.selectedNft.photo_file, userStore.ui.refetchAdmin]);

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) {
      return;
    }
    if (e.target.files.length > 0) {
      const uri = URL.createObjectURL(e.target.files[0]);
      setNewPhotoPreview(uri);
      setNewPhotoFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  }

  async function handleUpdatePhoto() {
    if (newPhotoFile === undefined) return;
    setUploading(true);
    const filePath = `${
      userStore.ui.selectedNft?.user_id
    }/${new Date().getTime()}${fileName}`;

    const { data: uploadData, error: uploadError } = await uploadFileToStorage(
      filePath,
      newPhotoFile
    );

    if (uploadError) {
      toast({
        position: "top",
        status: "error",
        description: uploadError.message,
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const { data: insertData, error: insertError } = await insertFileToSupabase(
      filePath,
      userStore.ui.selectedNft!?.id
    );

    if (insertError) {
      toast({
        position: "top",
        status: "error",
        description: insertError.message,
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const { data: attachData, error: attachError } = await attachFileToNft(
      "photo_file",
      (insertData as any)[0].id,
      userStore.ui.selectedNft!?.id
    );

    if (attachError) {
      toast({
        position: "top",
        status: "error",
        description: attachError.message,
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setUploading(false);

    toast({
      position: "top",
      status: "success",
      description: "Successfully updated user's photo",
      duration: 3000,
      isClosable: true,
    });

    userStore.ui.refetchAdminData();
  }

  return (
    <HStack>
      <VStack spacing={8} align={`start`} flex="1">
        <input onChange={handlePhotoUpload} type="file" name="" id="" />
        <Button
          onClick={handleUpdatePhoto}
          disabled={
            newPhotoPreview === "https://verifiedink.us/img/card-mask.png"
          }
        >
          {uploading ? <Spinner /> : "Update Photo"}
        </Button>
      </VStack>
      <HStack flex="4" align={`start`}>
        <Box flex="1">
          <Text mb={2}>Current image:</Text>
          <img
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
            src={photoFile}
          />
        </Box>
        <Box flex="1">
          <Text mb={2}>New image:</Text>
          <img
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
            src={newPhotoPreview}
          />
        </Box>
      </HStack>
    </HStack>
  );
};

export default observer(AdminUpdatePhoto);
