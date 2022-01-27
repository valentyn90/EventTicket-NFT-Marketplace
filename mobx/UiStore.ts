import { ModalContentType } from "@/types/ModalContentType";
import Nft from "@/types/Nft";
import SellData from "@/types/SellData";
import { makeAutoObservable } from "mobx";
import { UserStore } from "./UserStore";

export class UiStore {
  store: UserStore;

  selectedNft: Nft | null = null;
  sellData: SellData[] = [];
  openModal = false;
  modalContentType: ModalContentType;
  refetchAdmin = false;
  collectionSellView = false;
  selectedSN = 1;
  refetchListings = false;
  refetchMarketplace = false;

  openAlert = false;

  resetValues() {
    this.selectedNft = null;
    this.openModal = false;
    this.collectionSellView = false;
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

  setMarketplaceBuyCard = (sellData: SellData[]) => {
    this.sellData = sellData.sort((a, b) => {
      if (a.order_book.price > b.order_book.price) return 1;
      if (a.order_book.price < b.order_book.price) return -1;
      return 0;
    });
  };

  setCollectionSellView = (sell: boolean) => {
    this.collectionSellView = sell;
  };

  refetchMarketplaceData = () => {
    this.refetchMarketplace = !this.refetchMarketplace;
  };

  refetchListingsData = () => {
    this.refetchListings = !this.refetchListings;
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

  closeAlert = () => {
    this.openAlert = false;
  };

  setModal = (open: boolean) => {
    if (!open) {
      this.openModal = open;
    } else {
      this.openModal = open;
    }
  };
}
