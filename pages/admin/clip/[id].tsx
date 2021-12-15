import { getMuxPlaybackId, updateMuxValues } from "@/supabase/admin";
import { supabase } from "@/supabase/supabase-client";
import { getUserDetails } from "@/supabase/userDetails";
import { Box, Center, Container, HStack, VStack } from "@chakra-ui/layout";
import { Spinner, Button, Text, Flex } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import { GetServerSideProps } from "next";
import React, { useState, useEffect, useRef, useMemo } from "react";
import Plyr, { APITypes } from "plyr-react";
import "plyr-react/dist/plyr.css";
import { useRouter } from "next/router";

interface Props {
  id: number;
}

const ClipId: React.FC<Props> = ({ id }) => {
  const router = useRouter();
  const toast = useToast();
  const [loaded, setLoaded] = useState(false);
  const [assetLoading, setAssetLoading] = useState(false);
  const [assetStatusText, setAssetStatusText] = useState(" ");
  const [playbackId, setPlaybackId] = useState("");
  const [assetId, setAssetId] = useState("");
  const [fileQuality, setFileQuality] = useState("");
  const [doneClipping, setDoneClipping] = useState(false);
  const [updatingDb, setUpdatingDb] = useState(false);
  const videoRef = useRef<APITypes>(null);
  const [clipStart, setClipStart] = useState(0);
  const [clipEnd, setClipEnd] = useState(0);

  useEffect(() => {
    getMuxPlaybackId(id).then(({ data, error }) => {
      setLoaded(true);
      if (data) {
        setPlaybackId(data.mux_playback_id || "");
        setAssetId(data.mux_asset_id || "");
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

  const source = useMemo(
    () => ({
      type: "video",
      sources: [
        {
          src: `https://stream.mux.com/${playbackId}/low.mp4`,
          provider: "html5",
        },
      ],
    }),
    [playbackId]
  );

  async function handleGenerateClip() {
    if (assetId !== "") {
      setAssetLoading(true);
      const res = await fetch(`/api/mux/asset/clip`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          asset_id: assetId,
          start_time: clipStart,
          end_time: clipEnd,
        }),
      }).then((res) => res.json());

      if (res.error) {
        console.log("error");
      } else {
        checkAssetStatus(res.id, res.playback_ids[0].id);
      }
    } else {
      toast({
        position: "top",
        description: "No asset id.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  async function checkAssetStatus(asset_id: string, playback_id: string) {
    setAssetStatusText("Checking asset status...");
    const checkAssetStatus = async () => {
      const res = await fetch(`/api/mux/asset/${asset_id}`);
      const data = await res.json();

      // First check if status is ready
      if (data.asset?.status === "ready") {
        setAssetStatusText("Waiting for static renditions...");

        if (data.asset?.static_renditions.status === "ready") {
          setAssetStatusText("");

          const count_renditions = parseInt(
            data.asset.static_renditions.files.length
          );
          let file_name = "low";
          if (count_renditions > 2) {
            file_name = "high";
          } else if (count_renditions > 1) {
            file_name = "medium";
          }
          setAssetLoading(false);
          setPlaybackId(playback_id);
          setFileQuality(file_name);
          setDoneClipping(true);
          clearInterval(checkAssetInterval);
        }
      } else if (data.asset?.errors?.messages) {
        setAssetStatusText("Error.");
        clearInterval(checkAssetInterval);
      }
    };
    // run method immediately
    checkAssetStatus();
    // run on interval after
    const checkAssetInterval = setInterval(checkAssetStatus, 5000);
  }

  async function handleUpdateDb() {
    setUpdatingDb(true);
    const { data: updateData, error: updateError } = await updateMuxValues(
      id,
      assetId,
      playbackId,
      fileQuality
    );
    setUpdatingDb(false);

    if (updateError) {
      toast({
        position: "top",
        description: updateError.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        position: "top",
        description: "Successfully updated database.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  function handleClipStart() {
    if (videoRef.current) {
      // @ts-ignore
      setClipStart(videoRef.current.plyr.currentTime);
    }
  }

  function handleClipEnd() {
    if (videoRef.current) {
      // @ts-ignore
      setClipEnd(videoRef.current.plyr.currentTime);
    }
  }

  return (
    <Container maxW="container.lg">
      {!loaded ? (
        <Center>
          <Spinner size="xl" mt={12} />
        </Center>
      ) : (
        <VStack pt={12} spacing={8} align="start">
          {assetLoading ? (
            <Flex
              h="558px"
              w="100%"
              justify={"center"}
              align={"center"}
              direction="column"
            >
              <Spinner size="xl" />
              <Text mt={4}>{assetStatusText}</Text>
            </Flex>
          ) : (
            <Box w="100%">
              <Plyr
                ref={videoRef}
                // @ts-ignore
                source={source}
              />
            </Box>
          )}
          <HStack spacing={8}>
            <Button colorScheme="green" onClick={handleClipStart}>
              Clip Start
            </Button>
            <Button colorScheme="green" onClick={handleClipEnd}>
              Clip End
            </Button>
            <HStack>
              <Text>Clip Start: {clipStart}</Text>
              <Text>Clip End: {clipEnd}</Text>
            </HStack>
          </HStack>
          <HStack justify="space-between" w="100%">
            <HStack spacing={8}>
              <Button
                disabled={assetLoading}
                colorScheme="green"
                onClick={handleGenerateClip}
              >
                Generate New Clip
              </Button>
              <Button disabled={!doneClipping} onClick={handleUpdateDb}>
                {updatingDb ? <Spinner /> : "Update database"}
              </Button>
            </HStack>
            <Button
              colorScheme="blue"
              onClick={() => router.push(`/admin/crop/${id}`)}
            >
              Crop Vid
            </Button>
          </HStack>
        </VStack>
      )}
    </Container>
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

export default ClipId;
