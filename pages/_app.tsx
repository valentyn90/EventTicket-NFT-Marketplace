import Layout from "@/components/ui/layout/Layout";
import theme from "@/utils/theme";
import { ChakraProvider } from "@chakra-ui/react";
import "@fontsource/kadwa";
import "@fontsource/lato";
import "@fontsource/open-sans";
import type { AppProps } from "next/app";
import Head from "next/head";
import { GlobalStyle } from "../css/globalStyle";
import "../css/rsuite.css";
import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import userStore from "@/mobx/UserStore";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  useEffect(() => {
    if (!userStore.loggedIn && userStore.loaded) {
      if (
        router.pathname.includes("collection") ||
        router.pathname.includes("profile") ||
        router.pathname.includes("recruit") ||
        router.pathname.includes("create/step")
      ) {
        router.push("/signin");
      }
    }
  }, [userStore.loggedIn, userStore.loaded, router.pathname]);

  return (
    <ChakraProvider theme={theme}>
      <Head>
        <title>Verified Ink</title>
        <meta
          property="og:image"
          content="https://verifiedink.us/img/verified-ink-site.png"
          key="preview"
        />
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-68N30YNDQ1"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-68N30YNDQ1');
          `,
          }}
        />
      </Head>
      <GlobalStyle />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ChakraProvider>
  );
}

export default observer(MyApp);
