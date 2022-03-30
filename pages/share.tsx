import { handleRecruitClick } from "@/utils/recruitShareLink";
import ShareIcon from "@/utils/svg/ShareIcon";
import { VStack, Text, Button, useToast } from "@chakra-ui/react";
import { useRouter } from "next/router";

const SharePage: React.FC = () => {
  const toast = useToast();
  const router = useRouter();

  async function handleClick() {
    const referral_code = router.query.referralCode;
    const result = await handleRecruitClick(referral_code as string);
    if (result === "Clipboard") {
      toast({
        position: "top",
        description: "Your recruiting link has been copied to your clipboard",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  return (
    <VStack spacing={4} alignItems="center">
      <Text fontSize="3xl" fontWeight="bold" mt="3">
        Now, Grow <span style={{ color: "#4688F1" }}>Your</span> Team
      </Text>
      <Text fontSize="md">
        Click the button below to copy your personalized Recruit Link.
      </Text>

      <div>
        <Button
          zIndex={50}
          onClick={handleClick}
          colorScheme="blue"
          color="white"
          mb="4"
          flex="row"
          alignItems="center"
          width={["100%", "100%", "unset"]}
        >
          <ShareIcon marginRight={"10px"} />
          <p>Recruit</p>
        </Button>
      </div>
    </VStack>
  );
};

export default SharePage;
