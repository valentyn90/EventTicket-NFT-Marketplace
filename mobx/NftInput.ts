import { makeAutoObservable } from "mobx";

interface LoadValues {
  first_name?: string;
  last_name?: string;
  graduation_year?: number;
  high_school?: string;
  usa_state?: string;
  sport?: string;
  sport_position?: string;
  choice_quote?: string;
}

class NftInput {
  firstName: string = "";
  lastName: string = "";
  gradYear: number | undefined;
  highSchool: string = "";
  usaState: string = "";
  sport: string = "";
  sportPosition: string = "";
  choiceQuote: string = "";
  rotation: number = 0;

  constructor() {
    makeAutoObservable(this);
  }

  setRotation = (rotate: number) => {
    this.rotation = rotate;
  };

  setInputValue = (field: string, value: any) => {
    // @ts-ignore
    this[field] = value;
  };

  loadValues = (load: LoadValues) => {
    this.firstName = load.first_name || this.firstName || "";
    this.lastName = load.last_name || this.lastName || "";
    this.gradYear = load.graduation_year || this.gradYear || undefined;
    this.highSchool = load.high_school || this.highSchool || "";
    this.usaState = load.usa_state || this.usaState || "";
    this.sport = load.sport || this.sport || "";
    this.sportPosition = load.sport_position || this.sportPosition || "";
    this.choiceQuote = load.choice_quote || this.choiceQuote || "";
  };

  resetValues = () => {
    this.firstName = "";
    this.lastName = "";
    this.gradYear = undefined;
    this.highSchool = "";
    this.usaState = "";
    this.sport = "";
    this.sportPosition = "";
    this.choiceQuote = "";
  };
}

export const nftInput = new NftInput();
