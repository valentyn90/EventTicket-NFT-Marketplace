import Layout from "@/components/ui/layout/Layout";
import theme from "@/utils/theme";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { ChakraProvider } from "@chakra-ui/react";
import "@fontsource/kadwa";
import "@fontsource/lato";
import "@fontsource/open-sans";
import { AppProps } from "next/app";
import Head from "next/head";
import { GlobalStyle } from "../css/globalStyle";
import { useEffect, FC, ReactNode } from "react";
import { observer } from "mobx-react-lite";
import userStore from "@/mobx/UserStore";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { IntercomProvider } from "react-use-intercom";
import mixpanel from "mixpanel-browser";
import { MixpanelProvider } from "react-mixpanel-browser";
import TagManager from "react-gtm-module";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import builder, { Builder } from "@builder.io/react";
import Hero from "@/components/Builder/Hero";
import TransformButton from "@/components/ui/TransformButton";
import StaticCard from "@/components/NftCard/StaticCard";


require("../css/rsuite.css");

require("@solana/wallet-adapter-react-ui/styles.css");

builder.init('52246859efc049d1aaa68e6c2ee2b1c4');

Builder.registerComponent(TransformButton,{
  name: 'TransformButton',
  inputs: [{name: 'text', type: 'string'},{name:'textSize', type:'string'},{ name: 'color', type: 'color'},{ name: 'shadow', type: 'color'}, {name: 'disabled', type: 'boolean', defaultValue: false}],
})

Builder.registerComponent(StaticCard,{
  name: 'StaticCard',
  inputs:[{name:'nft_id', type: 'number'},{name:'width', type: 'number', defaultValue: 300},{name:'reverse', type: 'boolean', defaultValue: false}]
})

Builder.registerComponent(Hero,{
  name: 'Hero',
  inputs:[{name:'nft_id', type: 'number'},{name:'banner_text', type: 'string'},{name:'heading', type: 'string'},{name:'subtext', type: 'string'},{name:'link_text', type: 'string'},{name:'link_url', type: 'string'},{name:'flip_timer', type: 'number',defaultValue: 5}]
})

const WalletConnectionProvider = dynamic<{ children: ReactNode }>(
  () =>
    import("../components/Components/WalletConnectionProvider").then(
      ({ WalletConnectionProvider }) => WalletConnectionProvider
    ),
  {
    ssr: true,
  }
);

const queryClient = new QueryClient()

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  useEffect(() => {
    if (!userStore.loggedIn && userStore.loaded) {
      if (
        router.pathname.includes("collection") ||
        router.pathname.includes("profile") ||
        router.pathname.includes("recruit")
      ) {
        router.push("/athletes/signin");
      }
    }
  }, [userStore.loggedIn, userStore.loaded, router.pathname]);

  useEffect(() => {
    TagManager.initialize({ gtmId: "GTM-KP825Q5" });
  }, []);

  return (
    <ChakraProvider theme={theme}>
      <WalletConnectionProvider>
        <WalletModalProvider>
          <MixpanelProvider token={"b78dc989c036b821147f68e00c354313"}>
            <IntercomProvider appId={"b3ms6uff"}>
            <QueryClientProvider client={queryClient}>
              <Head>
                <title>VerifiedInk</title>
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

          gtag('config', 'G-68N30YNDQ1',{
            cookie_flags: 'secure;samesite=none'
          });
          `,
                  }}
                />
              </Head>
              <GlobalStyle />
              <Layout>
                <Component {...pageProps} />
              </Layout>
              </QueryClientProvider>
            </IntercomProvider>
          </MixpanelProvider>
        </WalletModalProvider>
      </WalletConnectionProvider>
    </ChakraProvider>
  );
}

export default observer(MyApp);
