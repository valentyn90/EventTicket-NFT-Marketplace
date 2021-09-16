import { supabase } from "@/utils/supabase-client";
import { Center, Spinner } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

interface Props {}

const Redirect: React.FC<Props> = () => {
  const router = useRouter();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // NOTE: Need to wait for the cookie to be written
        router.push("/create");
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

export default Redirect;
