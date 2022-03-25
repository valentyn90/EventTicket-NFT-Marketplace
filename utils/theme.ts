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
      500: "#4688F1",
      200: "#4688F1",
    },
    viBlue: "#4688F1",
  },
  components: {
    Alert,
    Button:{
      baseStyle: {
        borderRadius: "1px"
      }
    }
  },
});

export default theme;
