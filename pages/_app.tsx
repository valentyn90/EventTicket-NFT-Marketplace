import type { AppProps /*, AppContext */ } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { Auth } from "@supabase/ui";
import { supabase } from "@/utils/supabase-client";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <Auth.UserContextProvider supabaseClient={supabase}>
        <Component {...pageProps} />
      </Auth.UserContextProvider>
    </ChakraProvider>
  );
}

export default MyApp;
