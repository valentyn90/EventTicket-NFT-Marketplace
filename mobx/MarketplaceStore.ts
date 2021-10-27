import Nft from "@/types/Nft";
import { makeAutoObservable } from "mobx";
import { UserStore } from "./UserStore";

export class MarketplaceStore {
  store: UserStore;

  selectedNft: Nft | null = null;
  openModal = false;

  resetValues() {
    this.selectedNft = null;
    this.openModal = false;
  }

  constructor(store: UserStore) {
    makeAutoObservable(this);
    this.store = store;
  }

  setFieldValue = (field: string, value: any) => {
    // @ts-ignore
    this[field] = value;
  };

  openModalWithNft = (nft: Nft) => {
    this.selectedNft = nft;
    this.openModal = true;
  };

  setModal = (open: boolean) => {
    if (!open) {
      this.openModal = open;
    } else {
      this.openModal = open;
    }
  };
}
