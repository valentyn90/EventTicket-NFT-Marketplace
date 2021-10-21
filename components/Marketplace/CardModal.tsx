import userStore from "@/mobx/UserStore";
import { handleRecruitClick } from "@/utils/shareCard";
import { FiRefreshCw } from "react-icons/fi";
import ShareIcon from "@/utils/svg/ShareIcon";
import { Button } from "@chakra-ui/button";
import { Flex, Text } from "@chakra-ui/layout";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/modal";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import styled from "styled-components";
import Card from "../NftCard/Card";

const CardBox = styled.div`
  max-height: 500px;
  overflow: hidden;
  position: relative;

  .cardbox-refreshicon-div {
    cursor: pointer;
    position: absolute;
    bottom: 15%;
    right: 13%;
  }

  @media screen and (min-width: 30em) {
    .cardbox-refreshicon-div {
      position: absolute;
      bottom: 7%;
      right: 17%;
    }
  }

  @media screen and (min-width: 48em) {
    max-height: unset;
    .cardbox-refreshicon-div {
      position: absolute;
      bottom: 10%;
      right: 15%;
    }
  }
`;

const CardModal = () => {
  // To make sure the card doesn't flip on first load
  const [initFlip, setInitFlip] = useState(false);
  const [flipCard, setFlipCard] = useState(false);

  return (
    <Modal
      size={"5xl"}
      isOpen={userStore.marketplace.openModal}
      autoFocus={false}
      onClose={() => {
        setInitFlip(false);
        userStore.marketplace.setModal(false);
      }}
    >
      <ModalOverlay />
      <ModalContent mt={["3.75rem", "3.75rem", "7.25rem"]}>
        <ModalCloseButton left={2} colorScheme="gray" />
        <ModalHeader></ModalHeader>
        <ModalBody>
          <Flex
            direction={["column", "column", "row"]}
            maxH={["100%", "100%", "700px"]}
            pb={["0px", "0px", "unset"]}
          >
            <CardBox>
              <Card
                nft_id={userStore.marketplace.selectedNft?.id}
                readOnly={true}
                flip={flipCard}
                initFlip={initFlip}
              />
              <div
                className="cardbox-refreshicon-div"
                onClick={() => {
                  if (!initFlip) {
                    setInitFlip(true);
                  }
                  setFlipCard(!flipCard);
                }}
              >
                <FiRefreshCw />
              </div>
            </CardBox>

            <Flex direction="column" justify="center" align="space-between">
              <Text colorScheme="gray" fontSize={["4xl", "4xl", "6xl"]}>
                {userStore.marketplace.selectedNft?.first_name}{" "}
                {userStore.marketplace.selectedNft?.last_name}
              </Text>
              <Text colorScheme="gray" fontSize={["l", "l", "2xl"]} mb={8}>
                10 Cards Minted on 10/19/21
              </Text>
              <Button colorScheme="gray" variant="outline" disabled mb={4}>
                Make an offer
              </Button>
              <Button
                colorScheme="blue"
                onClick={() =>
                  handleRecruitClick(userStore.marketplace.selectedNft?.id)
                }
                color="white"
              >
                <ShareIcon marginRight="6px" />
                Share
              </Button>
            </Flex>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default observer(CardModal);
