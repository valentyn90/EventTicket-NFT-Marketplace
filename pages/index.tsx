import { SplashModal } from "@/components/ui/SplashModal";
import { NextApiRequest } from "next";

import React from "react";
import Cookies from 'cookies';


const Index: React.FC = () => {

  return (
    <SplashModal></SplashModal>
  );
};

export async function getServerSideProps({ req }: { req: NextApiRequest }) {

  const cookies = new Cookies(req)

  if (cookies.get("show-banner")) {
    return {
      redirect: {
        destination: "/create",
        permanent: false,
      },
    };
  }
  else{
    return {props: {}}
  }
}

export default Index;
