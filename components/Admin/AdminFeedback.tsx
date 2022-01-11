import userStore from "@/mobx/UserStore";
import { addAdminFeedback } from "@/supabase/admin";
import { Button } from "@chakra-ui/button";
import { Flex, Heading, VStack } from "@chakra-ui/layout";
import { FormLabel } from "@chakra-ui/react";
import { Textarea } from "@chakra-ui/textarea";
import { useToast } from "@chakra-ui/toast";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";

const AdminFeedback = () => {
  if (userStore.ui.selectedNft === null) return null;
  const toast = useToast();
  const [feedback, setFeedback] = useState(
    userStore.ui.selectedNft.admin_feedback || ""
  );
  const [info, setInfo] = useState(
    userStore.ui.selectedNft.admin_feedback?.info || ""
  );
  const [photo, setPhoto] = useState(
    userStore.ui.selectedNft.admin_feedback?.photo || ""
  );
  const [video, setVideo] = useState(
    userStore.ui.selectedNft.admin_feedback?.video || ""
  );
  const [signature, setSignature] = useState(
    userStore.ui.selectedNft.admin_feedback?.signature || ""
  );

  useEffect(() => {
    setFeedback({
      info: info,
      photo: photo,
      video: video,
      signature: signature,
    });
  }, [info, photo, video, signature]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { data, error } = await addAdminFeedback(
      userStore.ui.selectedNft?.id as number,
      feedback
    );

    const res2 = await fetch(
      `/api/outreach/${userStore.ui.selectedNft?.id}?message_type=changes_required`
    );
    if (error) {
      toast({
        position: "top",
        status: "error",
        description: error.message,
        duration: 3000,
        isClosable: true,
      });
    } else if (data && res2) {
      toast({
        position: "top",
        description: `Feedback added`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      userStore.ui.setModal(false);
      userStore.ui.refetchAdminData();
    }
  }

  return (
    <Flex
      direction="column"
      maxH={["100%", "100%", "700px"]}
      pb={["0px", "0px", "1rem"]}
    >
      <Heading>Feedback for Nft #{userStore.ui.selectedNft.id}</Heading>
      <form onSubmit={handleSubmit}>
        <VStack align="start" mt={6}>
          <FormLabel>Basic Info</FormLabel>
          <Textarea
            placeholder="Feedback"
            value={feedback.info}
            onChange={(e) => setInfo(e.target.value)}
          />
          <FormLabel>Photo</FormLabel>
          <Textarea
            placeholder="Feedback"
            value={feedback.photo}
            onChange={(e) => setPhoto(e.target.value)}
          />
          <FormLabel>Video</FormLabel>
          <Textarea
            placeholder="Feedback"
            value={feedback.video}
            onChange={(e) => setVideo(e.target.value)}
          />
          <FormLabel>Signature</FormLabel>
          <Textarea
            placeholder="Feedback"
            value={feedback.signature}
            onChange={(e) => setSignature(e.target.value)}
          />
          <Button type="submit">Submit</Button>
        </VStack>
      </form>
    </Flex>
  );
};

export default observer(AdminFeedback);
