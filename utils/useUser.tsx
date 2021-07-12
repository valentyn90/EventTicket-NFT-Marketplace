import Nft from "@/types/Nft";
import NftFormInput from "@/types/NftFormInput";
import React, { useEffect, useState, createContext, useContext } from "react";
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
  setNftObject: (nft: Nft | null) => void;
  signOut: () => void;
  setVideoFileNameFn: (name: string) => void;
  setVideoFileObject: (file: any) => void;
  createNft: (props: NftFormInput) => any;
  updateNft: (props: NftFormInput) => any;
  deleteNft: (nft_id: number) => any;
  uploadFileToSupabase: () => any;
  uploadVideoToSupabase: () => any;
  deletePhoto: () => void;
  deleteVideo: () => void;
  getPhotoFile: () => void;
  checkVideoFile: () => void;
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

  const getUserNft = (user_id: string) =>
    supabase.from("nft").select("*").eq("user_id", user_id).single();
  const getFileObject = (file_id: number) =>
    supabase.from("files").select("*").eq("id", file_id).single();
  const getSupabaseFile = (file_name: string) =>
    supabase.storage.from("private").download(file_name);

  useEffect(() => {
    if (user) {
      Promise.allSettled([getUserNft(user.id)]).then((results: any) => {
        setNft(results[0].value.data);
      });
    }
  }, [user]);

  useEffect(() => {
    if (nft) {
      if (nft.photo_file) {
        Promise.allSettled([getFileObject(nft.photo_file)]).then(
          (results: any) => {
            setNftPhoto(results[0].value.data);
          }
        );
      }
    }
  }, [nft]);

  useEffect(() => {
    if (nftPhoto) {
      Promise.allSettled([getSupabaseFile(nftPhoto.file_name)]).then(
        async (results: any) => {
          const blob = new Blob([results[0].value.data]);

          const url = URL.createObjectURL(blob);
          setPhotoFile(url);
        }
      );
    }
  }, [nftPhoto]);

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
          alert(error);
        }
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
          console.log(data);
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
      const res = await supabase.from("nft").delete().match({ id: nft_id });
      return res;
    },
    deletePhoto: () => {
      setPhotoFile(null);
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
    setSignatureFileObject: (file: any) => {
      setSignatureFile(file);
    },
    uploadSignatureToSupabase: async (newSigFile: File) => {
      const filePathName = `${user.id}/signaturePic.png`;
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

        return null;
      }
    },
    uploadVideoToSupabase: async () => {
      const filePathName = `${user.id}/${videoFileName}`;
      const { data, error } = await supabase.storage
        .from("private")
        .upload(filePathName, videoFile);

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
    uploadFileToSupabase: async () => {
      const filePathName = `${user.id}/${photoFileName}`;
      const { data, error } = await supabase.storage
        .from("private")
        .upload(filePathName, photoFile);
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
