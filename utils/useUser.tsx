import React, { useEffect, useState, createContext, useContext } from "react";
import { supabase } from "./supabase-client";

interface Props {
  user: {
    name: string;
    email: string;
    user_metadata: {
      avatar_url: string;
    };
  } | null;
  session: object | null;
  signOut: () => void;
}

export const UserContext: React.Context<Props> = createContext({
  user: null,
  session: null,
  signOut: () => {},
});

export const UserContextProvider: React.FC<Props> = (props) => {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = supabase.auth.session();
    setSession(session);
    setUser((session?.user as any) ?? null);
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser((session?.user as any) ?? null);
      }
    );

    return () => {
      if (authListener) {
        authListener.unsubscribe();
      }
    };
  }, []);

  const value = {
    session,
    user,
    signOut: () => {
      return supabase.auth.signOut();
    },
  };

  return <UserContext.Provider value={value} {...props} />;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error(`useUser must be used within a UserContextProvider.`);
  }
  return context;
};
