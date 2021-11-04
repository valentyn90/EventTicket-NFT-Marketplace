import userStore from "@/mobx/UserStore";
import { adminUpdateNft } from "@/supabase/admin";
import { Button } from "@chakra-ui/button";
import { FormLabel } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Flex, Heading, HStack, VStack } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import { useToast } from "@chakra-ui/toast";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";

const AdminEditNft = () => {
  if (userStore.ui.selectedNft === null) return null;
  const toast = useToast();
  const nft = userStore.ui.selectedNft;

  const [submitting, setSubmitting] = useState(false);
  const [thisNft, setThisNft] = useState<any>({
    first_name: nft.first_name || "",
    last_name: nft.last_name || "",
    high_school: nft.high_school || "",
    graduation_year: nft.graduation_year || "",
    quotes: nft.quotes || "",
    sport: nft.sport || "",
    sport_position: nft.sport_position || "",
    usa_state: nft.usa_state || "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const { data, error } = await adminUpdateNft(nft.id, thisNft);
    setSubmitting(false);
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
        description: `Updated NFT ${nft.id}`,
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
      direction={["column"]}
      maxH={["100%", "100%", "700px"]}
      pb={["0px", "0px", "unset"]}
    >
      <Heading>Edit Nft #{userStore.ui.selectedNft.id}</Heading>

      <form onSubmit={handleSubmit}>
        <VStack align="start" spacing={6} mt={8}>
          {Object.keys(thisNft).map((key, i) => {
            return (
              <HStack key={i} w="80%">
                <FormLabel flex="1">{key}</FormLabel>
                <Input
                  flex="2"
                  type="text"
                  placeholder={key}
                  value={thisNft[key]}
                  onChange={(e) =>
                    setThisNft({
                      ...thisNft,
                      [key]: e.target.value,
                    })
                  }
                />
              </HStack>
            );
          })}
        </VStack>
        <Button my={6} type="submit">
          {submitting ? <Spinner /> : "Update"}
        </Button>
      </form>
    </Flex>
  );
};

export default observer(AdminEditNft);
