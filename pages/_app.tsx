import "@fontsource/open-sans";
import "@fontsource/kadwa";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { UserContextProvider } from "@/utils/useUser";
import Layout from "@/components/ui/layout/Layout";
import theme from "@/utils/theme";
import Head from "next/head";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Head>
        <title>Verified Ink</title>
      </Head>
      <UserContextProvider {...pageProps}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </UserContextProvider>
    </ChakraProvider>
  );
}

export default MyApp;
