import React from "react";
import Navbar from "@/components/Navbar";
import Head from "next/head";
import { useRouter } from "next/router";
import { background } from "@chakra-ui/styled-system";

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {

  const router = useRouter();
  console.log(router.pathname)
  const showNav = router.pathname === '/screenshot/[id]' ? false : true;
  return (
    <>
      <Head>
        <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico?v=2" />
        <meta property="og:title" content="Verified Ink" key="title" />
        <meta property="og:image" content="https://verifiedink.us/img/verified-ink-site.png" key="preview" />
      </Head>
      {showNav && <Navbar />}
      {/* Margin for fixed navbar position */}
      <main style={{ marginTop: "56px" }}>{children}</main>
    </>
  );
};

export default Layout;
