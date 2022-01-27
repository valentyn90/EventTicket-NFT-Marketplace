import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  .blue-link {
    color: var(--chakra-colors-blue-500);
    :hover {
      text-decoration: underline;
      text-decoration-color: var(--chakra-colors-blue-500);
    }
  }

  .no-background {
    background: transparent !important;
  }

  .wallet-adapter-modal {
    z-index: 1500;
  }

  .solana-wallet-multi-btn {
    border-radius: 0.375rem;
    height: 40px;
    background-color: #2e3472;
    color: white;
    border: 1px solid #2e3472;
    line-height: 1;
  }

  .sol-sell-price-input {
    text-align: center;
    width: 75px;
    font-size: 1.5rem;
    flex: 1;
    display: inline;
    background: transparent;
    border: none;
    :focus, :active, :focus-visible {
      border: none;
      outline: 0;
    }
  }

  @media screen and (max-width: 1100px){
    .solana-wallet-multi-btn {
      font-size: 14px;
    }
  }

  @media screen and (max-width: 48em) {
    .solana-wallet-multi-btn {
      margin-left: 3px;
      padding: 0 5px;
      font-size: 12px;
      > i {
        margin-right: 6px;
      }
      > i > img {
        height: 20px;
        width: 20px;
      }
    }
  }
`;
