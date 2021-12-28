import CreateLayout from "@/components/Create/CreateLayout";
import PhotoPreviewSide from "@/components/Create/PhotoPreviewSide";
import { List } from "@/components/List/List";
import { ListItem } from "@/components/List/ListItem";
import Card from "@/components/NftCard/Card";
import userStore from "@/mobx/UserStore";
import { supabase } from "@/supabase/supabase-client";
import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Icon,
  Input,
  Spinner,
  Stack,
  useColorModeValue
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { NextApiRequest } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { AiOutlineEdit, AiOutlinePicture, AiOutlineVideoCamera } from "react-icons/ai";
import { FaSignature } from "react-icons/fa";

interface Props {
  feedback: any;
}


const Changes: React.FC<Props> = ({feedback}) => {
  const router = useRouter();

  console.log(feedback);

  return (
    <CreateLayout>

      <Flex direction="column">
        {/* Top Row */}
        <Flex direction={["column", "column", "row"]}>
          <PhotoPreviewSide
            title="A Few Changes"
            subtitle="Your VerifiedInk is coming along, but we need you to make a few adjustments. Click on any step below to make the requested changes."
            flex="1"
            nft_id={userStore.nft?.id}
            nft={userStore.loadedNft}
          />

          {/* Right side */}
          <Flex flex="1" direction="column" mt={["4", "4", 0]}>
            <Stack mt="4">
              <List spacing="12">
                <ListItem
                  title="Basic Info"
                  subTitle="All fields should be completed"
                  icon={<Icon as={AiOutlineEdit} boxSize="6" />}
                  onClick={(e) => router.push("/create/step-3")}
                  changes={feedback.admin_feedback.info === "" ? false : true}
                  text={feedback.admin_feedback.info}
                >
                  
                </ListItem>
                <ListItem
                  title="Photo"
                  subTitle="High resolution photo"
                  icon={<Icon as={AiOutlinePicture} boxSize="6" />}
                  onClick={(e) => router.push("/create/step-2")}
                  changes={feedback.admin_feedback.photo === "" ? false : true}
                  text={feedback.admin_feedback.photo}
                >
                </ListItem>
                <ListItem
                  title="Video"
                  subTitle="Short video of you playing your sport"
                  icon={<Icon as={AiOutlineVideoCamera} boxSize="6" />}
                  onClick={(e) => router.push("/create/step-5")}
                  changes={feedback.admin_feedback.video === "" ? false : true}
                  text={feedback.admin_feedback.video}
                />
                <ListItem
                  title="Signature"
                  subTitle="Legible Autograph"
                  icon={<Icon as={FaSignature} boxSize="6"
                  />}
                  onClick={(e) => router.push("/create/step-6")}
                  changes={feedback.admin_feedback.signature === "" ? false : true}
                  text={feedback.admin_feedback.signature}

                />


              </List>
              {userStore.nft?.photo && (
                <Box
                  mt={["2rem !important", "2rem !important", 0]}
                  mb={["2rem !important", "2rem !important", 0]}
                  display={["block", "block", "none"]}
                  h={["500px", "650px", "650px"]}
                >
                  <Card
                    nft_id={userStore.nft?.id}
                    nft_width={400}
                    reverse={false}
                  />
                </Box>
              )}
              <Button mt="3rem !important" colorScheme="blue" color="white" type="submit"
                onClick={(e) => router.push("/create/step-7")}>
                Changes Made
              </Button>
            </Stack>
          </Flex>
        </Flex>
        <Divider mt="6" mb="6" />
        {/* Bottom row */}
      </Flex>

    </CreateLayout>
  );
};

export async function getServerSideProps({ req }: { req: NextApiRequest }) {
  const { user } = await supabase.auth.api.getUserByCookie(req);
  if (!user) {
    return {
      redirect: {
        destination: "/signin",
        permanent: false,
      },
    };
  } else {

    const {data, error} = await supabase.from("nft").select("admin_feedback").eq("user_id", user.id).maybeSingle();

    return {
      props: {feedback: data}
    }

  }
}


export default observer(Changes);
