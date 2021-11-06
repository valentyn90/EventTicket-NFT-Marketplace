import userStore from "@/mobx/UserStore";
import { getFileFromSupabase } from "@/supabase/supabase-client";
import { ModalContentType } from "@/types/ModalContentType";
import Nft from "@/types/Nft";
import { Button } from "@chakra-ui/button";
import { Image } from "@chakra-ui/image";
import { Box, Flex } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";

interface Props {
  nft: Nft;
  listType: ModalContentType;
}

const CardListItem: React.FC<Props> = ({ nft, listType }) => {
  const [loaded, setLoaded] = useState(false);
  const [screenshot, setScreenshot] = useState(
    "https://verifiedink.us/img/card-mask.png"
  );

  useEffect( () => {
    if (nft.screenshot_file_id) {
       getFileFromSupabase(nft.screenshot_file_id).then((res) => {
        if (res.file) {
          const uri = URL.createObjectURL(res.file);
          setScreenshot(uri);
          setLoaded(true);
        }
        if (res.error) {
          console.log(res.error);
          setLoaded(true);
        }
      });
    } else {
      setLoaded(true);
    }
  }, [nft.screenshot_file_id]);

  return (
    <Box
      py={4}
      px={2}
      mb={[6, 6, "unset"]}
      w={["150px", "175px", "200px"]}
      h={["300px", "400px", "400px"]}
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="xl"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      position="relative"
    >
      {loaded ? (
        <>
          <Box
            cursor="pointer"
            w="100%"
            h="100%"
            position="relative"
            display="block"
            onClick={() => userStore.ui.openModalWithNft(nft, listType)}
          >
            <Image
              position="absolute"
              top={0}
              left={0}
              width="100%"
              height="100%"
              objectFit="contain"
              src={screenshot}
              fallbackSrc="https://verifiedink.us/img/card-mask.png"
            />
          </Box>
          <Flex pt={4} justifyContent="space-around" w="100%">
            <Button
              size="sm"
              colorScheme="blue"
              variant="outline"
              onClick={() => {
                userStore.ui.openModalWithNft(nft, listType);
              }}
            >
              View
            </Button>
            {listType === "marketplace" && (
              <Button size="sm" variant="outline" disabled>
                Bid
              </Button>
            )}
            {listType === "collection" && (
              <Button size="sm" variant="outline" disabled>
                Sell
              </Button>
            )}
          </Flex>
        </>
      ) : (
        <Spinner />
      )}
    </Box>
  );
};

export default observer(CardListItem);
