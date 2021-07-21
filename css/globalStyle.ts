import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  .blue-link {
    color: var(--chakra-colors-blue-500);
    :hover {
      text-decoration: underline;
      text-decoration-color: var(--chakra-colors-blue-500);
    }
  }
`;
