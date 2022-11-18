import BottomEditComponent from "@/types/BottomEditComponent";
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
  listView = false;
  selectedSN = 1;
  refetchListings = false;
  refetchMarketplace = false;

  openAlert = false;

  marketplaceFilter: any[] = [];

  initLoad = false;

  formSubmitting = false;

  cardCreationSteps = [
    "Intro",
    "Basic Info",
    "Photo",
    "Background",
    "Video",
    "Signature",
    "Order Now",
    "Share",
    // "Create Account 2",
    // "Approval",
    // "Purchase",
  ];
  selectedStep = 0;
  openStepsModal = false;
  openCardFormModal = false;
  cardFormModalInput = "";
  disableContinue = true;

  callStepOne = false;

  bottomEditComponent: BottomEditComponent = "";

  flipVideo = false;

  resetValues() {
    this.selectedNft = null;
    this.openModal = false;
    this.listView = false;
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

  get stepsTaken() {
    return `${this.selectedStep}/${this.cardCreationSteps.length - 1}`;
  }

  get stepsRatio() {
    return this.selectedStep / (this.cardCreationSteps.length - 1);
  }

  nextStep = () => {
    // close any open editing options
    if (this.bottomEditComponent) {
      this.bottomEditComponent = "";
    }

    // disable continue
    this.disableContinue = true;

    if (this.selectedStep + 1 <= this.cardCreationSteps.length - 1) {
      this.selectedStep = this.selectedStep + 1;
    }
  };

  previousStep = () => {
    if (this.bottomEditComponent) {
      this.bottomEditComponent = "";
    }

    if (this.selectedStep > 0) {
      this.selectedStep = this.selectedStep - 1;
    }
  };

  setBottomEditComponent = (edit: BottomEditComponent) => {
    this.bottomEditComponent = edit;
  };

  setCardFormModal = (open: boolean, type: string) => {
    this.openCardFormModal = open;
    this.cardFormModalInput = type;
  };

  get stepChevronLeftFill() {
    if (this.selectedStep === 0) {
      return `#4F5567`;
    } else {
      return `white`;
    }
  }

  get stepChevronRightFill() {
    if (this.selectedStep === this.cardCreationSteps.length - 1) {
      return `#4F5567`;
    } else {
      return `white`;
    }
  }

  get step() {
    return this.cardCreationSteps[this.selectedStep];
  }

  setMarketplaceBuyCard = (sellData: SellData[]) => {
    this.sellData = sellData.sort((a, b) => {
      if (a.order_book.price > b.order_book.price) return 1;
      if (a.order_book.price < b.order_book.price) return -1;
      return 0;
    });
  };

  setListView = (list: boolean) => {
    this.listView = list;
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
