import "@fontsource/open-sans";
import "@fontsource/lato";
import "@fontsource/kadwa";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { UserContextProvider } from "@/utils/useUser";
import Layout from "@/components/ui/layout/Layout";
import theme from "@/utils/theme";
import Head from "next/head";
import { GlobalStyle } from "../css/globalStyle";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Head>
        <title>Verified Ink</title>
        <meta property="og:image" content="https://verifiedink.us/img/verified-ink-site.png" key="preview" />

      </Head>
      <GlobalStyle />
      <UserContextProvider {...pageProps}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </UserContextProvider>
    </ChakraProvider>
  );
}

export default MyApp;
