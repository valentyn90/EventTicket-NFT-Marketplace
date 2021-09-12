import { nftInput } from "@/mobx/NftInput";
import Nft from "@/types/Nft";
import NftFormInput from "@/types/NftFormInput";
import SignInOptions from "@/types/SignInOptions";
import { Provider } from "@supabase/supabase-js";
import { toJS } from "mobx";
import React, { useEffect, useState, createContext, useContext } from "react";
import { checkImageSize, resizeImageFile } from "./imageFileResizer";
import { supabase } from "./supabase-client";

interface UserProps {
  user: {
    name: string;
    email: string;
    user_metadata: {
      avatar_url: string;
    };
  } | null;
  session: object | null;
  photoFile: any;
  nft: Nft | null;
  nftPhoto: any;
  nftPhotoPath: any;
  videoFile: any;
  nftVideo: any;
  nftVideoName: string;
  signatureFile: any;
  nftSignature: any;
  videoFileName: string;
  getNftCardData: (nft_id: number) => any;
  signIn: (options: SignInOptions) => Promise<boolean | null>;
  setNftObject: (nft: Nft | null) => void;
  signOut: () => void;
  setVideoFileNameFn: (name: string) => void;
  setVideoFileObject: (file: any) => void;
  createNft: (props: NftFormInput) => any;
  updateNft: (props: NftFormInput) => any;
  deleteNft: (nft_id: number) => any;
  uploadPhotoToSupabase: (rotate: boolean, isString: boolean) => any;
  uploadVideoToSupabase: (file: File) => any;
  deletePhoto: () => void;
  deleteVideo: () => void;
  getPhotoFile: () => void;
  checkPhotoFile: () => void;
  checkVideoFile: () => void;
  checkVideoExists: () => boolean;
  deleteSignature: () => void;
  setPhotoFileName: (fileName: string) => void;
  setPhotoFileObject: (file: any) => void;
  stepThreeSubmit: (props: NftFormInput) => any;
  setSignatureFileObject: (file: any) => void;
  uploadSignatureToSupabase: (file: File) => any;
  checkSignatureFile: () => void;
  setNftApprovalTrue: () => any;
}

export const UserContext = createContext<UserProps>({} as UserProps);

export const UserContextProvider: React.FC<UserProps> = (props) => {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [photoFile, setPhotoFile] = useState<any>(null);
  const [photoFileName, setPhotoFileName] = useState("");
  const [videoFile, setVideoFile] = useState<any>(null);
  const [videoFileName, setVideoFileName] = useState<any>(null);
  const [nftPhoto, setNftPhoto] = useState<any>(null);
  const [nftVideo, setNftVideo] = useState<any>(null);
  const [nftVideoName, setNftVideoName] = useState("");
  const [nft, setNft] = useState<Nft | null>(null);
  const [nftPhotoPath, setNftPhotoPath] = useState<any>(null);
  const [signatureFile, setSignatureFile] = useState<any>(null);
  const [nftSignature, setNftSignature] = useState<any>(null);

  useEffect(() => {
    const session = supabase.auth.session();
    setSession(session);
    setUser((session?.user as any) ?? null);
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // sets the cookie
        await fetch("/api/auth", {
          method: "POST",
          headers: new Headers({ "Content-Type": "application/json" }),
          credentials: "same-origin",
          body: JSON.stringify({ event, session }),
        }).then((res) => res.json());
        // sets the user data in state context
        setSession(session);
        setUser((session?.user as any) ?? null);
      }
    );

    return () => {
      if (authListener) {
        authListener.unsubscribe();
      }
    };
  }, []);

  const getNftById = (nft_id: number) =>
    supabase.from("nft").select("*").eq("id", nft_id).maybeSingle();
  const getUserNft = (user_id: string) =>
    supabase.from("nft").select("*").eq("user_id", user_id).maybeSingle();
  const getFileObject = (file_id: number) =>
    supabase.from("files").select("*").eq("id", file_id).maybeSingle();
  const getSupabaseFile = (file_name: string) =>
    supabase.storage.from("private").download(file_name);
  const deleteFileById = (file_id: number) =>
    supabase.from("files").delete().match({ id: file_id });
  const deleteStorageFile = (file_name: string) =>
    supabase.storage.from("private").remove([file_name]);

  const getFileFromSupabase = async (
    file_id: number
  ): Promise<{ error: string | null; file: object | null }> => {
    const { data, error } = await getFileObject(file_id);
    if (error) {
      return {
        error: error.message,
        file: null,
      };
    }

    const { data: dataFile, error: errorFile } = await getSupabaseFile(
      data.file_name
    );
    if (errorFile)
      return {
        error: errorFile.message,
        file: null,
      };
    return {
      error: null,
      file: dataFile,
    };
  };

  useEffect(() => {
    if (user) {
      Promise.allSettled([getUserNft(user.id)]).then((results: any) => {
        if (results[0].value.data) {
          nftInput.loadValues(results[0].value.data);
          setNft(results[0].value.data);
        }
      });
    }
  }, [user]);

  const value = {
    session,
    user,
    photoFile,
    nft,
    nftPhoto,
    nftPhotoPath,
    videoFile,
    nftVideo,
    nftVideoName,
    signatureFile,
    nftSignature,
    videoFileName,
    setVideoFileName,
    getNftCardData: async (nft_id: number) => {
      // get all the data...
      try {
        let photo;
        let video;
        let signature;
        const { data, error } = await getNftById(nft_id);
        if (error) {
          alert(error.message);
          return null;
        }
        // check/get all the files
        if (data.photo_file) {
          const { error, file } = await getFileFromSupabase(data.photo_file);
          if (!error) {
            var uri = URL.createObjectURL(file);
            photo = uri;
          }
        }
        if (data.clip_file) {
          const { error, file } = await getFileFromSupabase(data.clip_file);
          if (!error) {
            var uri = URL.createObjectURL(file);
            video = uri;
          }
        }
        if (data.signature_file) {
          const { error, file } = await getFileFromSupabase(
            data.signature_file
          );
          if (!error) {
            var uri = URL.createObjectURL(file);
            signature = uri;
          }
        }

        return {
          photo,
          video,
          signature,
          gradYear: data.graduation_year,
          firstName: data.first_name,
          lastName: data.last_name,
          highSchool: data.high_school,
          sport: data.sport,
          state: data.usa_state,
          sportPosition: data.sport_position,
        };
      } catch (err) {
        console.log(err);
        return null;
      }
    },
    signIn: async ({ email, provider, goToStepOne }: SignInOptions) => {
      if (goToStepOne) {
        localStorage.setItem("goToStepOne", "true");
      }
      if (email) {
        const { error } = await supabase.auth.signIn({ email });
        if (error) {
          console.log(error);
          return false;
        } else {
          return true;
        }
      } else if (provider) {
        const { error } = await supabase.auth.signIn({ provider });
        if (error) console.log(error);
        return null;
      }
      return null;
    },
    signOut: () => {
      return supabase.auth.signOut();
    },
    createNft: async ({ firstName, lastName, gradYear }: NftFormInput) => {
      const res = await supabase.from("nft").insert([
        {
          first_name: firstName,
          last_name: lastName,
          graduation_year: gradYear,
          user_id: user?.id,
        },
      ]);
      return res;
    },
    setNftObject: (nft: Nft | null) => {
      setNft(nft);
    },
    setPhotoFileName: (fileName: string) => {
      setPhotoFileName(fileName);
    },
    checkPhotoFile: async () => {
      if (nft?.photo_file) {
        const { data, error } = await getFileObject(nft.photo_file);
        if (!error) {
          setNftPhoto(data);
          const { data: data2, error: error2 } = await getSupabaseFile(
            data.file_name
          );

          if (error2) {
            alert(error2.message);
          } else {
            var uri = URL.createObjectURL(data2);
            setPhotoFile(uri);
          }
        } else {
          alert(error.message);
        }
      }
    },
    checkSignatureFile: async () => {
      // 1. Get file object from db
      if (nft?.signature_file) {
        const { data, error } = await getFileObject(nft.signature_file);
        if (!error) {
          setNftSignature(data);

          const { data: data2, error: error2 } = await getSupabaseFile(
            data.file_name
          );

          if (error2) {
            alert(error2.message);
          } else {
            var uri = URL.createObjectURL(data2);
            setSignatureFile(uri);
          }
        } else {
          alert(error.message);
        }
      }
    },
    checkVideoExists: () => {
      if (nft?.clip_file !== null) {
        return true;
      } else {
        return false;
      }
    },
    checkVideoFile: async () => {
      // 1. Get file object from db
      if (nft?.clip_file) {
        const { data, error } = await getFileObject(nft.clip_file);
        if (!error) {
          setNftVideo(data);
          const fileName = (/[^/]*$/.exec(data.file_name) as any)[0];
          setNftVideoName(fileName);

          const { data: data2, error: error2 } = await getSupabaseFile(
            data.file_name
          );

          if (error2) {
            alert(error2.message);
          } else {
            var uri = URL.createObjectURL(data2);
            setVideoFile(uri);
          }
        } else {
          alert(error);
        }
      }
    },
    getPhotoFile: async () => {
      if (user) {
        const { data, error } = await supabase.storage
          .from("private")
          .download(`${user.id}/${photoFileName}`);
        if (error) {
          console.log(error);
        } else {
          // console.log(data);
        }
      }
    },
    stepThreeSubmit: async ({
      highSchool,
      usaState,
      sport,
      sportPosition,
      choiceQuote,
      nft_id,
    }: NftFormInput) => {
      const res = await supabase
        .from("nft")
        .update([
          {
            high_school: highSchool,
            usa_state: usaState,
            sport,
            sport_position: sportPosition,
            quotes: choiceQuote,
          },
        ])
        .match({ id: nft_id });
      return res;
    },
    updateNft: async ({
      firstName,
      lastName,
      gradYear,
      nft_id,
    }: NftFormInput) => {
      const res = await supabase
        .from("nft")
        .update([
          {
            first_name: firstName,
            last_name: lastName,
            graduation_year: gradYear,
          },
        ])
        .match({ id: nft_id });
      return res;
    },
    deleteNft: async (nft_id: number) => {
      /**
       * Check if there are files associated with this NFT
       * And then delete those files before you delete the NFT
       */
      try {
        const res = await supabase.from("nft").delete().match({ id: nft_id });
        setNft(null);
        setPhotoFile(null);
        setPhotoFileName("");
        setVideoFile(null);
        setVideoFileName("");
        setNftPhoto(null);
        setNftVideo(null);
        setNftVideoName("");
        setSignatureFile(null);
        setNftSignature(null);
        nftInput.resetValues();
        return res;
      } catch (err) {
        console.log(err);
        return {
          error: "Error deleting NFT",
        };
      }
    },
    deletePhoto: () => {
      setPhotoFile(null);
      setNftPhoto(null);
      setPhotoFileName("");
      setNftPhotoPath("");
    },
    deleteVideo: () => {
      setVideoFile(null);
      setNftVideo(null);
      setNftVideoName("");
      setVideoFileName("");
    },
    setPhotoFileObject: (file: any) => {
      setPhotoFile(file);
    },
    setVideoFileObject: (file: any) => {
      setVideoFile(file);
    },
    deleteSignature: () => {
      setSignatureFile(null);
      setNftSignature(null);
    },
    setSignatureFileObject: (file: any) => {
      setSignatureFile(file);
    },
    uploadSignatureToSupabase: async (newSigFile: File) => {
      const filePathName = `${user.id}/${new Date().getTime()}signaturePic.png`;
      // upload signature image to storage
      const { data, error } = await supabase.storage
        .from("private")
        .upload(filePathName, newSigFile);

      if (error) {
        return error;
      } else {
        // create a file db object that connects filename and nft id
        const { data: data2, error: error2 } = await supabase
          .from("files")
          .insert([
            {
              file_name: filePathName,
              nft_id: nft?.id,
            },
          ]);

        if (error2) return error2;

        // update nft with file id on signature id
        await supabase
          .from("nft")
          .update([
            {
              signature_file: (data2 as any)[0].id,
              finished: true,
            },
          ])
          .match({ id: nft?.id });

        // @ts-ignore
        setNft({
          ...nft,
          signature_file: (data2 as any)[0].id,
        });

        return null;
      }
    },
    uploadVideoToSupabase: async (file: File) => {
      const filePathName = `${user.id}/${new Date().getTime()}${file.name}`;
      const { data, error } = await supabase.storage
        .from("private")
        .upload(filePathName, file);

      if (error) {
        return error;
      } else {
        const { data: data2, error: error2 } = await supabase
          .from("files")
          .insert([
            {
              file_name: filePathName,
              nft_id: nft?.id,
            },
          ]);

        if (error2) return error2;

        await supabase
          .from("nft")
          .update([
            {
              clip_file: (data2 as any)[0].id,
            },
          ])
          .match({ id: nft?.id });

        // @ts-ignore
        setNft({
          ...nft,
          clip_file: (data2 as any)[0].id,
        });

        return null;
      }
    },
    setNftApprovalTrue: async () => {
      const { data, error } = await supabase
        .from("nft")
        .update([
          {
            approved: true,
          },
        ])
        .match({ id: nft?.id });
      if (error) return error;
      return null;
    },
    setVideoFileNameFn: (name: string) => {
      setVideoFileName(name);
    },
    uploadPhotoToSupabase: async (
      rotate: boolean,
      isString: boolean = false
    ) => {
      const filePathName = `${user.id}/${new Date().getTime()}${
        photoFileName ? photoFileName : nftPhoto.file_name
      }`;
      let photoFileToUpload = null;
      // rotate via api before it gets uploaded.
      if (rotate) {
        let photoToUse;
        if (isString) {
          // if photo is object url convert to file
          photoToUse = await fetch(photoFile)
            .then((r) => r.blob())
            .then(
              (blobFile) =>
                new File([blobFile], "fileNameGoesHere", { type: "image/png" })
            );
        } else {
          photoToUse = photoFile;
        }
        const { width, height }: any = await checkImageSize(photoToUse);
        photoFileToUpload = await resizeImageFile(
          photoToUse,
          width,
          height,
          100,
          nftInput.rotation
        );
      } else {
        photoFileToUpload = photoFile;
      }
      const { data, error } = await supabase.storage
        .from("private")
        .upload(filePathName, photoFileToUpload);
      if (error) {
        return error;
      } else {
        // create a new file object
        // attach it to user db
        const { data: data2, error: error2 } = await supabase
          .from("files")
          .insert([
            {
              file_name: filePathName,
              nft_id: nft?.id,
            },
          ]);

        if (error2) return error2;

        await supabase
          .from("nft")
          .update([
            {
              photo_file: (data2 as any)[0].id,
            },
          ])
          .match({ id: nft?.id });

        // @ts-ignore
        setNft({
          ...nft,
          photo_file: (data2 as any)[0].id,
        });

        return null;
      }
    },
  };

  return <UserContext.Provider value={value} {...props} />;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error(`useUser must be used within a UserContextProvider.`);
  }
  return context;
};
