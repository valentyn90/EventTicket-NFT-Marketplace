import { extendTheme, ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const Alert = {
  baseStyle: {
    container: {
      top: "60px",
    },
  },
};

const theme = extendTheme({
  config,
  fonts: {
    heading: "Lato",
    body: "Lato",
  },
  colors: {
    blue: {
      500: "#0051CA",
      200: "#0051CA",
    },
    viBlue: "#0051CA",
  },
  components: {
    Alert,
  },
});

export default theme;
