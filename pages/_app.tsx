import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { UserContextProvider } from "@/utils/useUser";
import Layout from "@/components/ui/Layout";
import theme from "@/utils/theme";

import "@fontsource/open-sans";
import "@fontsource/kadwa";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <UserContextProvider {...pageProps}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </UserContextProvider>
    </ChakraProvider>
  );
}

export default MyApp;
