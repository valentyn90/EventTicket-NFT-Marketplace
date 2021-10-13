import Layout from "@/components/ui/layout/Layout";
import theme from "@/utils/theme";
import { ChakraProvider } from "@chakra-ui/react";
import "@fontsource/kadwa";
import "@fontsource/lato";
import "@fontsource/open-sans";
import type { AppProps } from "next/app";
import Head from "next/head";
import { GlobalStyle } from "../css/globalStyle";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Head>
        <title>Verified Ink</title>
        <meta
          property="og:image"
          content="https://verifiedink.us/img/verified-ink-site.png"
          key="preview"
        />
      </Head>
      <GlobalStyle />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ChakraProvider>
  );
}

export default MyApp;
