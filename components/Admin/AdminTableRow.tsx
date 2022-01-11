import userStore from "@/mobx/UserStore";
import {
  mintNft,
  updateTwitter,
  verifyUserAndRecruits,
} from "@/supabase/admin";
import { getFileFromSupabase } from "@/supabase/supabase-client";
import { unlockNft } from "@/supabase/userDetails";
import Nft from "@/types/Nft";
import getFormattedDate from "@/utils/getFormattedDate";
import {
  Box,
  Button,
  HStack,
  Image,
  Spinner,
  Td,
  Text,
  Tr,
  useToast,
  Wrap,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

interface Props {
  nft: Nft;
}

const AdminTableRow: React.FC<Props> = ({ nft }) => {
  const router = useRouter();
  const toast = useToast();
  const [feedbackDate, setFeedbackDate] = useState("");
  const [nudgeDate, setNudgeDate] = useState("");
  const [verify, setVerify] = useState(
    nft.user_details?.verified_user || false
  );
  const [unlock, setUnlock] = useState(nft.approved);
  const [submitting, setSubmitting] = useState(false);
  const [minting, setMinting] = useState(false);
  const [screenshotBtn, setScreenshotBtn] = useState(false);
  const [screenshot, setScreenshot] = useState(
    "https://verifiedink.us/img/card-mask.png"
  );
  const [twitter, setTwitter] = useState(nft.user_details?.twitter || "");

  useEffect(() => {
    let feedbackFound = false;
    let nudgeFound = false;
    if (nft.admin_actions) {
      nft.admin_actions?.forEach((action) => {
        switch (action.type) {
          case "feedback": {
            if (!feedbackFound) {
              setFeedbackDate(getFormattedDate(action.created_at));
              feedbackFound = true;
            }
            break;
          }
          case "nudge": {
            if (!nudgeFound) {
              setNudgeDate(getFormattedDate(action.created_at));
              nudgeFound = true;
            }
            break;
          }
          default: {
            break;
          }
        }
      });
    }
  }, [nft.admin_actions]);

  useEffect(() => {
    if (nft.user_details?.verified_user) {
      setVerify(nft.user_details?.verified_user);
    }
  }, [nft.user_details?.verified_user]);

  useEffect(() => {
    if (nft.screenshot_file_id) {
      getFileFromSupabase(nft.screenshot_file_id).then((res) => {
        if (res.file) {
          const uri = URL.createObjectURL(res.file as Blob);
          setScreenshot(uri);
        }
        if (res.error) {
          console.log(res.error);
        }
      });
    }
  }, [nft.screenshot_file_id]);

  function getNftProgress(nft: Nft) {
    if (nft.minted) {
      return `3. Minted`;
    } else if (nft.approved) {
      return `2. User Approved`;
    } else if (nft.first_name && nft.graduation_year && nft.last_name) {
      return `1. Started`;
    } else {
      return `0. Not started`;
    }
  }

  async function callUpdateTwitter() {
    const res = await updateTwitter(nft.user_details_id, twitter);
    if (res) {
      toast({
        position: "top",
        description: `Updated twitter to: ${twitter}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  async function handleUnlock() {
    const { data, error } = await unlockNft(nft.id);
    if (error) {
      toast({
        position: "top",
        status: "error",
        description: error.message,
        duration: 3000,
        isClosable: true,
      });
    } else {
      setUnlock(false);
      toast({
        position: "top",
        description: `Unlocked NFT ${nft.id}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  async function handleVerify() {
    if (!verify) {
      setSubmitting(true);
      const res = await verifyUserAndRecruits(nft.user_id);
      setSubmitting(false);
      if (res) {
        userStore.ui.refetchAdminData();
        setVerify(true);
      }
    }
  }

  async function handleScreenshot() {
    setScreenshotBtn(true);
    const res = await userStore.nft?.setNftCardScreenshot(nft.id, nft.user_id);
    setScreenshotBtn(false);
    if (res) {
      userStore.ui.refetchAdminData();
      toast({
        position: "top",
        description: `Screenshot pulled for ${nft.id}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        position: "top",
        status: "error",
        description: `There was an error getting a screenshot.`,
        duration: 3000,
        isClosable: true,
      });
    }
  }

  async function handleAbandoned() {
    const res = await fetch(`/api/outreach/${nft.id}?message_type=abandoned`);
    if (res.status === 200) {
      toast({
        position: "top",
        description: `Abandoned message sent for ${nft.id}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
    userStore.ui.refetchAdminData();
  }

  async function remindRecruit() {
    const res = await fetch(
      `/api/outreach/${nft.id}?message_type=remind_recruit`
    );
    if (res.status === 200) {
      toast({
        position: "top",
        description: `Remind recruit message sent for ${nft.id}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  async function handleMint() {
    setMinting(true);
    const res = await mintNft(nft.id, nft.user_id);
    const res2 = await fetch(`/api/outreach/${nft.id}?message_type=minted`);
    if (res2.status === 200) {
      toast({
        position: "top",
        description: `Twitter message sent for ${nft.id}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        position: "top",
        status: "error",
        description: `Something bad happened`,
        duration: 3000,
        isClosable: true,
      });
    }
    userStore.ui.refetchAdminData();
    setMinting(false);
  }

  return (
    <Tr key={nft.id}>
      <Td>{`${nft.first_name} ${nft.last_name}`}</Td>
      <Td>{nft.id}</Td>
      <Td>
        <Image
          cursor="pointer"
          onClick={() => userStore.ui.openModalWithNft(nft, "admin")}
          boxSize="80px"
          objectFit="contain"
          src={screenshot}
          alt={`${nft.first_name} ${nft.last_name}`}
        />
      </Td>
      <Td justifySelf="center">
        {submitting ? (
          <Spinner />
        ) : (
          <input type="checkbox" onChange={handleVerify} checked={verify} />
        )}
      </Td>
      <Td justifySelf="center">
        <input
          type="text"
          value={twitter}
          onChange={(e) => setTwitter(e.target.value)}
          onBlur={callUpdateTwitter}
          style={{ backgroundColor: "transparent" }}
        />
      </Td>
      <Td>{getNftProgress(nft)}</Td>
      <Td align="center">
        <HStack justify="center" w="100%">
          <Button
            onClick={() => {
              userStore.ui.openAdminEditModal(true, "admin-update-photo", nft);
            }}
          >
            Update Photo
          </Button>
          <Button onClick={() => router.push(`/admin/clip/${nft.id}`)}>
            Clip/Crop
          </Button>
          <Button
            onClick={() =>
              userStore.ui.openAdminEditModal(true, "admin-edit", nft)
            }
          >
            Edit
          </Button>
          <Button disabled={!unlock} onClick={handleUnlock}>
            Unlock
          </Button>
          <Button onClick={handleScreenshot}>
            {screenshotBtn ? <Spinner /> : "Screenshot"}
          </Button>
          <Wrap justify="center" position="relative">
            <Button
              onClick={() =>
                userStore.ui.openAdminEditModal(true, "admin-feedback", nft)
              }
            >
              Feedback
            </Button>
            {feedbackDate && (
              <Text position="absolute" top="-22px" align="center" fontSize="12px" color="gray.400">
                {feedbackDate}
              </Text>
            )}
          </Wrap>
          <Wrap position="relative" justify="center">
            <Button onClick={handleAbandoned}>Nudge</Button>
            {nudgeDate && (
              <Text position="absolute" top="-22px" align="center" fontSize="12px" color="gray.400">
                {nudgeDate}
              </Text>
            )}
          </Wrap>
          <Button disabled={nft.minted} onClick={handleMint}>
            {minting ? <Spinner /> : "Mint"}
          </Button>
          <Button disabled={!nft.minted} onClick={remindRecruit}>
            Recruit
          </Button>
        </HStack>
      </Td>
    </Tr>
  );
};

export default observer(AdminTableRow);
