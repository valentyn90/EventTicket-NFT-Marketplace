import React from "react";
import Navbar from "@/components/Navbar";

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <>
      <Navbar />
      {/* Margin for fixed navbar position */}
      <main style={{ marginTop: "56px" }}>{children}</main>
    </>
  );
};

export default Layout;
