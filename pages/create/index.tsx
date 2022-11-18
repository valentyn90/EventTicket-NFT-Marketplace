import CardFormModal from "@/components/Create2/CardFormModal";
import ColorSelector from "@/components/Create2/ColorSelector";
import Create2Layout from "@/components/Create2/Create2Layout";
import CreateAccount2 from "@/components/Create2/CreateAccount2";
import CreateAccountComponent from "@/components/Create2/CreateAccountComponent";
import IntroScreen from "@/components/Create2/IntroScreen";
import PhotoUploadComponent from "@/components/Create2/PhotoUploadComponent";
import SignatureUpload from "@/components/Create2/SignatureUpload";
import VideoUpload from "@/components/Create2/VideoUpload";
import OrderNow from "@/components/Marketing/OrderNow";
import VerifiedInkNft from "@/components/VerifiedInkNft/VerifiedInkNft";

import { supabase } from "@/supabase/supabase-client";
import useWindowDimensions from "@/utils/useWindowDimensions";
import {
  Box,
  Button,
  Heading,
  Spinner,
  Stack,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { NextApiRequest, NextApiResponse } from "next";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import userStore from "@/mobx/UserStore";
import { runInAction, toJS } from "mobx";
import Nft from "@/types/Nft";

interface Props {
  nft: Nft | null;
}

const Create2: React.FC<Props> = ({ nft }) => {
  const { width } = useWindowDimensions();
  const toast = useToast();
  const [nftId, setNftId] = useState(nft?.id || 0);
  const cardRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (nft !== null) {
      userStore.setNft(nft);
    }
  }, []);

  useEffect(() => {
    // load last step from local storage
    const savedStep = localStorage.getItem("card-creation-last-step");
    if (savedStep) {
      userStore.ui.setFieldValue("selectedStep", parseInt(savedStep));
    }
  }, []);

  useEffect(() => {
    // save last step in local storage
    function handleUnload() {
      if (userStore.ui.selectedStep) {
        localStorage.setItem(
          "card-creation-last-step",
          String(userStore.ui.selectedStep)
        );
      }
    }

    window.addEventListener("beforeunload", handleUnload);

    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [userStore.ui.selectedStep]);

  useEffect(() => {
    if (userStore.nft?.id && userStore.nft?.id !== nftId) {
      setNftId(userStore.nft?.id);
    }
  }, [userStore.nft?.id]);

  async function handleContinue() {
    cardRef.current?.dispatchEvent(
      new Event("submit", { cancelable: true, bubbles: true })
    );
  }

  let bottomEditComponent;
  switch (userStore.ui.bottomEditComponent) {
    case "photo-upload": {
      bottomEditComponent = <PhotoUploadComponent cardRef={cardRef} />;
      break;
    }
    case "background-top": {
      bottomEditComponent = (
        <ColorSelector cardRef={cardRef} top={true} width={width} />
      );
      break;
    }
    case "background-bottom": {
      bottomEditComponent = (
        <ColorSelector cardRef={cardRef} top={false} width={width} />
      );
      break;
    }
    case "video-upload": {
      bottomEditComponent = <VideoUpload />;
      break;
    }
    case "signature": {
      bottomEditComponent = <SignatureUpload />;
      break;
    }
    default: {
      bottomEditComponent = null;
      break;
    }
  }

  let editText = "Tap";
  if (width && width > 992) {
    editText = "Click";
  }

  let editComponent;
  switch (userStore.ui.step) {
    case "Intro": {
      runInAction(() => {
        userStore.ui.nextStep();
      });
    }
    case "Basic Info": {
      editComponent = userStore.ui.disableContinue ? (
        <Text
          w="75%"
          margin="0 auto"
          mb={8}
          textAlign={["center", "center", "start"]}
          fontSize={["md", "md", "2xl"]}
        >
          {editText} the <span className="blue-text">highlighted</span> area of
          the card to get started.
        </Text>
      ) : (
        <Text
          w="75%"
          margin="0 auto"
          mb={8}
          textAlign={["center", "center", "start"]}
          fontSize={["md", "md", "2xl"]}
        >
          Great job! {editText} <span className="blue-text">Continue</span>{" "}
          below to move to the next stage.
        </Text>
      );
      break;
    }
    case "Photo": {
      editComponent = <PhotoUploadComponent cardRef={cardRef} />;
      break;
    }
    case "Background": {
      editComponent = (
        <>
          <Text fontSize={"2xl"} textAlign="start">
            Next, choose your colors.
          </Text>
          <ColorSelector cardRef={cardRef} top={true} width={width} />
          <ColorSelector cardRef={cardRef} top={false} width={width} />
        </>
      );
      break;
    }
    case "Video": {
      editComponent = (
        <>
          <Text fontSize={"2xl"}>Upload your profile video below.</Text>
          <VideoUpload />
        </>
      );
      break;
    }
    case "Signature": {
      editComponent = (
        <>
          <Text fontSize={"2xl"}>Now add your signature.</Text>
          <SignatureUpload />
        </>
      );
      break;
    }
    default: {
      editComponent = null;
      break;
    }
  }

  useEffect(() => {
    // scroll to top when step changes
    if (userStore.ui.step === "Signature") {
      if (width && width < 992) {
        window.scrollTo({
          top: 300,
          behavior: "smooth",
        });
      }
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [userStore.ui.step, width]);

  if (userStore.ui.step === "Intro") return <IntroScreen />;
  return (
    <Box px={[0, 0, 4]}>
      <Create2Layout>
        <>
          {(userStore.ui.step === "Basic Info" ||
            userStore.ui.step === "Photo" ||
            userStore.ui.step === "Background" ||
            userStore.ui.step === "Video" ||
            userStore.ui.step === "Signature") && (
            <Stack
              direction={["column", "column", "row"]}
              padding={[0, 0, 8]}
              background={[
                "",
                "",
                "linear-gradient(180deg, #040D27 0%, #1D253C 100%);",
              ]}
            >
              {userStore.ui.step === "Background" && (
                <Box flex={1}>
                  <Heading size="md" textAlign="center" p={3} display={["block","block","none"]}> Choose Your Background Colors </Heading>
                  <VerifiedInkNft
                    ref={cardRef}
                    nftId={nftId}
                    editingMode={userStore.ui.step}
                    preventFlip={true}
                    readOnly={false}
                    nftWidth={350}
                  />
                </Box>
              )}

              {userStore.ui.step != "Background" && (
                <Box flex={1}>
                  <VerifiedInkNft
                    ref={cardRef}
                    nftId={nftId}
                    editingMode={userStore.ui.step}
                    preventFlip={true}
                    readOnly={false}
                    nftWidth={350}
                  />
                </Box>
              )}

              <VStack flex={1} justify="center">
                <Button
                  w="75%"
                  margin="0 auto"
                  display="block"
                  disabled={
                    userStore.ui.disableContinue || userStore.ui.formSubmitting
                  }
                  onClick={handleContinue}
                >
                  {userStore.ui.formSubmitting ? <Spinner /> : "Continue"}
                </Button>
                {width && width >= 992 ? (
                  editComponent
                ) : userStore.ui.disableContinue ? (
                  <Text
                    w="75%"
                    margin="0 auto"
                    mb={8}
                    textAlign={["center", "center", "start"]}
                    fontSize={["md", "md", "2xl"]}
                  >
                    {editText} the{" "}
                    <span className="blue-text">highlighted</span> area of the
                    card above to get started.
                  </Text>
                ) : null}
              </VStack>
            </Stack>
          )}
          {userStore.ui.step === "Order Now" && <OrderNow />}
          {userStore.ui.step === "Create Account" && <CreateAccountComponent />}
          {userStore.ui.step === "Share" && <CreateAccount2 nftId={nftId} />}
          {width && width < 992 && bottomEditComponent}
        </>

        <CardFormModal cardRef={cardRef} />
      </Create2Layout>
    </Box>
  );
};

export async function getServerSideProps({
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}) {
  const { user } = await supabase.auth.api.getUserByCookie(req);
  if (user) {
    const nft = await supabase
      .from("nft")
      .select("*")
      .eq("user_id", user.id)
      .limit(1);
    // console.log(nft);
    if (nft.data) {
      return {
        props: {
          nft: nft.data[0],
          // nft: null,
        },
      };
    }
  } else {
    // Check for temp user id
    const tempUserId = req.cookies["temp_user_id"];
    if (tempUserId) {
      const nft = await supabase
        .from("nft")
        .select("*")
        .eq("temp_user_id", tempUserId);

      if (nft.data && nft.data.length > 0) {
        return {
          props: {
            nft: nft.data[0],
          },
        };
      }
    }

    return {
      props: {
        nft: null,
      },
    };
  }

  return {
    props: {
      nft: null,
    },
  };
}

export default observer(Create2);
