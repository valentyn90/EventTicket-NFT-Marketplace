import { CardListType } from "@/types/CardListType";
import Nft from "@/types/Nft";
import { makeAutoObservable } from "mobx";
import { UserStore } from "./UserStore";

export class MarketplaceStore {
  store: UserStore;

  selectedNft: Nft | null = null;
  openModal = false;
  listType: CardListType;

  resetValues() {
    this.selectedNft = null;
    this.openModal = false;
    this.listType = "marketplace";
  }

  constructor(store: UserStore) {
    makeAutoObservable(this);
    this.store = store;
    this.listType = "marketplace";
  }

  setFieldValue = (field: string, value: any) => {
    // @ts-ignore
    this[field] = value;
  };

  openModalWithNft = (nft: Nft, listType: CardListType) => {
    this.selectedNft = nft;
    this.openModal = true;
    this.listType = listType;
  };

  setModal = (open: boolean) => {
    if (!open) {
      this.openModal = open;
    } else {
      this.openModal = open;
    }
  };
}
