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

const blueBlack2 = "#1d253c";
const blueBlack = "#040d27";

const theme = extendTheme({
  config,
  styles: {
    global: {
      body: {
        bg: blueBlack,
      },
    },
  },
  fonts: {
    heading: "sofia-pro, sans-serif",
    body: "sofia-pro, sans-serif",
  },
  colors: {
    blue: {
      200: "#0D9DE5",
      500: "#0D9DE5",
    },
    blueBlack: blueBlack,
    blueBlack2: blueBlack2,
    blueBlackTransparent: "#040d2760",
    viBlue: "#0D9DE5",
    viBlueTransparent: "#0D9DE560",
    viBlue2: "#0D9DE5",
    purpleBlue: "#525AB2",
    purpleBlueTransparent: "#525AB290",
    darkPurple: "1d253c",
    lightPurple: "#3d4662",
    gray3: "#B3B6BE",
    gray4: "#4F5567",
    gray5: "#BEC1C7",
    gray6: "#4F556733",
  },
  components: {
    Alert,
    Button: {
      baseStyle: {
        borderRadius: "1px",
      },
    },
  },
});

export default theme;
