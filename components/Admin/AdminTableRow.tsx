import userStore from "@/mobx/UserStore";
import { mintNft, verifyUserAndRecruits } from "@/supabase/admin";
import { getFileFromSupabase } from "@/supabase/supabase-client";
import { unlockNft } from "@/supabase/userDetails";
import Nft from "@/types/Nft";
import {
  Button,
  HStack,
  Image,
  Spinner,
  Td,
  Tr,
  useToast,
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

  useEffect(() => {
    if (nft.user_details?.verified_user) {
      setVerify(nft.user_details?.verified_user);
    }
  }, [nft.user_details?.verified_user]);

  useEffect(() => {
    if (nft.screenshot_file_id) {
      getFileFromSupabase(nft.screenshot_file_id).then((res) => {
        if (res.file) {
          const uri = URL.createObjectURL(res.file);
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

  async function handleMint() {
    setMinting(true);
    const res = await mintNft(nft.id, nft.user_id);
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
      <Td>{getNftProgress(nft)}</Td>
      <Td align="center">
        <HStack justify="center" w="100%">
          <Button onClick={() => router.push(`/admin/crop/${nft.id}`)}>
            Crop Vid
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
          <Button
            onClick={() =>
              userStore.ui.openAdminEditModal(true, "admin-feedback", nft)
            }
          >
            Feedback
          </Button>
          <Button disabled={nft.minted} onClick={handleMint}>
            {minting ? <Spinner /> : "Mint"}
          </Button>
        </HStack>
      </Td>
    </Tr>
  );
};

export default observer(AdminTableRow);
