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
        <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico?v=1" />
      </Head>
      <Navbar />
      {/* Margin for fixed navbar position */}
      <main style={{ marginTop: "56px" }}>{children}</main>
    </>
  );
};

export default Layout;
