import userStore from "@/mobx/UserStore";
import { useBreakpointValue } from "@chakra-ui/media-query";
import { updateUsername } from "@/supabase/userDetails";
import ShareIcon from "@/utils/svg/ShareIcon";
import { Avatar } from "@chakra-ui/avatar";
import { EditIcon } from "@chakra-ui/icons";
import { Input } from "@chakra-ui/input";
import { Box, Flex, HStack, Text, VStack, Stack } from "@chakra-ui/layout";
import { Button, Spinner } from "@chakra-ui/react";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";

const PersonalInfo = () => {
  const [editName, setEditName] = useState(false);
  const [nameInput, setNameInput] = useState(userStore.userDetails.user_name);
  const [submitting, setSubmitting] = useState(false);
  const avatarSize = useBreakpointValue({ base: "lg", lg: "2xl" });

  async function handleNameSubmit() {
    setSubmitting(true);
    const res = await userStore.userDetails.updateUsername(nameInput);
    setSubmitting(false);

    if (res) {
      setEditName(false);
    }
  }

  return (
    <Flex width="100%">
      <Avatar
        size={avatarSize}
        mr={[4, 4, 14]}
        name={userStore.userDetails.user_name}
        src={userStore.avatar_url}
        boxShadow="xl"
      />
      <VStack spacing={4} align="start">
        <HStack mt={4} justify="center" align="center">
          <Flex height="40px" align="center">
            {editName ? (
              <Stack
                direction={["column", "column", "row"]}
                height={["70px", "70px", "unset"]}
              >
                <Input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  width="175px"
                  placeholder={userStore.userDetails.user_name}
                  mr="6px"
                />
                <Button
                  colorScheme="blue"
                  color="white"
                  onClick={handleNameSubmit}
                >
                  {submitting ? <Spinner /> : "Change name"}
                </Button>
              </Stack>
            ) : (
              <Text mr={4} colorScheme="gray" fontWeight="bold" fontSize="2xl">
                {userStore.userDetails.user_name || "Your Name"}
              </Text>
            )}
          </Flex>
          <EditIcon
            color="gray"
            boxSize="5"
            cursor="pointer"
            onClick={() => setEditName(!editName)}
          />
        </HStack>
        <HStack>
          <Box width="25px" height="25px" color="gray">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </Box>
          <Text>{userStore.userDetails.email}</Text>
        </HStack>
        {userStore.userDetails.twitter && (
          <HStack align="center">
            <Box width="25px" height="25px" color="gray">
              <svg
                width="24"
                height="21"
                viewBox="0 0 24 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M14.5255 1.35018C15.5743 0.949871 16.7207 0.881327 17.8098 1.15382C18.6758 1.37051 19.4723 1.79454 20.1326 2.38509C20.9448 2.08657 21.7151 1.68256 22.4236 1.18282L23 1.99999L23.9716 2.2366C23.6291 3.64313 22.9424 4.93955 21.9769 6.01096C21.9917 6.17236 21.9995 6.33442 22 6.49668L22 6.49998C22 12.5999 19.0631 17.075 14.8448 19.3202C10.6509 21.5525 5.29087 21.5278 0.514353 18.8741C0.109542 18.6492 -0.0879035 18.1758 0.0371451 17.73C0.162194 17.2841 0.57702 16.9824 1.03974 17.0008C2.72656 17.0679 4.39637 16.7325 5.91473 16.033C4.41158 15.1054 3.32942 14.0042 2.57705 12.8163C1.57342 11.2316 1.19455 9.55289 1.12603 8.04539C1.0577 6.54227 1.29648 5.18888 1.54747 4.21835C1.67358 3.73076 1.80442 3.33349 1.90527 3.05452C1.95576 2.91487 1.99891 2.8044 2.03044 2.72657C2.04621 2.68764 2.05909 2.65683 2.06855 2.63458L2.08013 2.60765L2.08308 2.6009C2.09012 2.58472 2.09762 2.56867 2.10557 2.55277L3 2.99998L3.81835 2.42527C4.73389 3.72895 5.95764 4.78597 7.3806 5.5022C8.51245 6.0719 9.7424 6.4119 10.9997 6.5064C10.9923 5.39674 11.322 4.31064 11.9456 3.39204C12.5761 2.46324 13.4767 1.75048 14.5255 1.35018ZM3.40464 5.04359C3.22095 5.84496 3.07427 6.86122 3.12397 7.95458C3.18044 9.19708 3.48907 10.5184 4.26669 11.7462C5.04028 12.9676 6.31604 14.1572 8.40613 15.0862C8.73794 15.2336 8.96374 15.5494 8.99603 15.911C9.02833 16.2727 8.86205 16.6234 8.56163 16.8274C7.45069 17.5815 6.2342 18.1488 4.9601 18.5157C8.13026 19.3233 11.307 18.9376 13.9051 17.5547C17.4365 15.6751 19.9995 11.9008 20 6.50165C19.9992 6.28555 19.9784 6.06999 19.9378 5.85774C19.8751 5.52987 19.9802 5.19236 20.2178 4.95798C20.4406 4.73829 20.6469 4.50415 20.8357 4.25749C20.6092 4.34104 20.38 4.41777 20.1483 4.48752C19.7717 4.60093 19.3636 4.48302 19.1054 4.18622C18.6376 3.64831 18.0159 3.26705 17.3243 3.094C16.6327 2.92096 15.9047 2.96449 15.2387 3.2187C14.5726 3.47291 14.0008 3.92553 13.6003 4.51536C13.1999 5.10519 12.9903 5.80375 12.9999 6.51658L13.0001 6.52998H13V7.52998C13 8.07217 12.5679 8.51559 12.0259 8.52965C10.1037 8.57949 8.19898 8.15317 6.48141 7.28866C5.33584 6.71206 4.29724 5.95247 3.40464 5.04359Z"
                  fill="currentColor"
                />
              </svg>
            </Box>
            <Text>@{userStore.userDetails.twitter}</Text>
          </HStack>
        )}
      </VStack>
    </Flex>
  );
};

export default observer(PersonalInfo);
