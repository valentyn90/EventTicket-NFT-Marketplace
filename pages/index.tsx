import { SplashModal } from "@/components/ui/SplashModal";
import Cookies from "cookies";
import { NextApiRequest } from "next";
import React from "react";

const Index: React.FC = () => {
  return <SplashModal />;
};

export async function getServerSideProps({ req }: { req: NextApiRequest }) {
  const cookies = new Cookies(req);

  return {
    redirect: {
      destination: "/create",
      permanent: false,
    },
  }
  
  if (cookies.get("show-banner")) {
    return {
      redirect: {
        destination: "/create",
        permanent: false,
      },
    };
  } else {
    return {
      props: {},
    };
  }
}

export default Index;
