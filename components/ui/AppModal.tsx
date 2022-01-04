import userStore from "@/mobx/UserStore";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/modal";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import AdminEditNft from "../Admin/AdminEditNft";
import AdminFeedback from "../Admin/AdminFeedback";
import AdminModalContent from "../Admin/AdminModalContent";
import AdminUpdatePhoto from "../Admin/AdminUpdatePhoto";
import CollectionModalContent from "../Collection/CollectionModalContent";
import MarketplaceModalContent from "../Marketplace/MarketplaceModalContent";
import { BetaModal } from "./BetaModal";

const AppModal = () => {
  const [initFlip, setInitFlip] = useState(false);
  const [flipCard, setFlipCard] = useState(false);

  const router = useRouter();

  useEffect(() => {
    function closeModal() {
      if (userStore.ui.openModal) {
        userStore.ui.closeModal();
      }
    }
    router.events.on("routeChangeStart", () => {
      closeModal();
    });
    return () => {
      router.events.off("routeChangeComplete", () => {
        closeModal();
      });
    };
  }, [router.events]);

  let modalSize = "5xl";

  let component;
  switch (userStore.ui.modalContentType) {
    case "admin": {
      component = <AdminModalContent />;
      break;
    }
    case "admin-edit": {
      component = <AdminEditNft />;
      break;
    }
    case "admin-feedback": {
      component = <AdminFeedback />;
      break;
    }
    case "admin-update-photo": {
      component = <AdminUpdatePhoto />;
      break;
    }
    case "collection": {
      component = (
        <CollectionModalContent
          flipCard={flipCard}
          initFlip={initFlip}
          setInitFlip={setInitFlip}
          setFlipCard={setFlipCard}
        />
      );
      break;
    }
    case "marketplace": {
      component = (
        <MarketplaceModalContent
          flipCard={flipCard}
          initFlip={initFlip}
          setInitFlip={setInitFlip}
          setFlipCard={setFlipCard}
        />
      );
      break;
    }
    default: {
      component = null;
      break;
    }
  }

  return (
    <Modal
      size={modalSize}
      isOpen={userStore.ui.openModal}
      onClose={() => {
        setInitFlip(false);
        userStore.ui.closeModal();
      }}
    >
      <ModalOverlay />
      <ModalContent mt={["3.75rem", "3.75rem", "7.25rem"]}>
        <ModalCloseButton left={2} colorScheme="gray" />
        <ModalHeader></ModalHeader>
        <ModalBody>{component}</ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default observer(AppModal);
