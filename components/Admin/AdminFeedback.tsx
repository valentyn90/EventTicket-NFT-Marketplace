import userStore from "@/mobx/UserStore";
import { addAdminFeedback } from "@/supabase/admin";
import { Button } from "@chakra-ui/button";
import { Flex, Heading, VStack } from "@chakra-ui/layout";
import { Textarea } from "@chakra-ui/textarea";
import { useToast } from "@chakra-ui/toast";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";

const AdminFeedback = () => {
  if (userStore.ui.selectedNft === null) return null;
  const toast = useToast();
  const [feedback, setFeedback] = useState(
    userStore.ui.selectedNft.admin_feedback || ""
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { data, error } = await addAdminFeedback(
      userStore.ui.selectedNft?.id as number,
      feedback
    );
    if (error) {
      toast({
        position: "top",
        status: "error",
        description: error.message,
        duration: 3000,
        isClosable: true,
      });
    } else if (data) {
      toast({
        position: "top",
        description: `Feedback added`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
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
        <VStack align="start" spacing={6} mt={6}>
          <Textarea
            placeholder="Feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <Button type="submit">Submit</Button>
        </VStack>
      </form>
    </Flex>
  );
};

export default observer(AdminFeedback);
