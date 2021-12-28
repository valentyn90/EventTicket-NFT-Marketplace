import { supabase } from "@/supabase/supabase-client";
import { Spinner } from "@chakra-ui/react";
import Cookies from "cookies";
import { NextApiRequest } from "next";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

interface Props {
  redirect: string;
}

const Redirect: React.FC<Props> = ({ redirect }) => {
  const router = useRouter();

  // TODO: Handle the following error: /redirect?error=server_error&error_description=Error+getting+user+email+from+external+provider

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setTimeout(() => {
          if (event === "SIGNED_IN") {
            if (redirect === "true") {
              router.push("/create/step-1");
            } else {
              // NOTE: Need to wait for the cookie to be written
              router.push("/create");
            }
          } else {
            router.push("/signin");
          }
        }, 1000);
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <Spinner size="xl" />
    </div>
  );
};

export async function getServerSideProps({ req }: { req: NextApiRequest }) {
  const cookies = new Cookies(req);

  let redirect =
    cookies.get("redirect-step-1") === undefined
      ? null
      : cookies.get("redirect-step-1");

  return {
    props: {
      redirect,
    },
  };
}

export default Redirect;
