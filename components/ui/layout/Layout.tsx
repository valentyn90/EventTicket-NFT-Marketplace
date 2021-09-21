import React from "react";
import Navbar from "@/components/Navbar";
import Head from "next/head";

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <>
      <Head>
        <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico?v=2" />
        <meta property="og:title" content="Verified Ink" key="title" />
        <meta property="og:image" content="https://verifiedink.us/img/verified-ink-site.png" key="preview" />
      </Head>
      <Navbar />
      {/* Margin for fixed navbar position */}
      <main style={{ marginTop: "56px" }}>{children}</main>
    </>
  );
};

export default Layout;
