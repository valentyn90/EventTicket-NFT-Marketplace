import { ModalContentType } from "@/types/ModalContentType";
import Nft from "@/types/Nft";
import { makeAutoObservable } from "mobx";
import { UserStore } from "./UserStore";

export class UiStore {
  store: UserStore;

  selectedNft: Nft | null = null;
  openModal = false;
  modalContentType: ModalContentType;
  refetchAdmin = false;

  resetValues() {
    this.selectedNft = null;
    this.openModal = false;
  }

  constructor(store: UserStore) {
    makeAutoObservable(this);
    this.store = store;
    this.modalContentType = "marketplace";
  }

  setFieldValue = (field: string, value: any) => {
    // @ts-ignore
    this[field] = value;
  };

  refetchAdminData = () => {
    this.refetchAdmin = !this.refetchAdmin;
  };

  openAdminEditModal = (open: boolean, type: ModalContentType, nft: Nft) => {
    this.openModal = open;
    this.modalContentType = type;
    this.selectedNft = nft;
  };

  openModalWithType = (open: boolean, type: ModalContentType) => {
    this.openModal = open;
    this.modalContentType = type;
  };

  openModalWithNft = (nft: Nft, type: ModalContentType) => {
    this.selectedNft = nft;
    this.openModal = true;
    this.modalContentType = type;
  };

  closeModal = () => {
    this.openModal = false;
    this.modalContentType = "marketplace";
  };

  setModal = (open: boolean) => {
    if (!open) {
      this.openModal = open;
    } else {
      this.openModal = open;
    }
  };
}
