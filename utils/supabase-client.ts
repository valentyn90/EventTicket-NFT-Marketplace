import { createClient, Provider } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export const getPosts = async () => {
  const { data, error } = await supabase.from("posts").select();

  if (error) {
    console.log(error.message);
    throw error;
  }

  return data || [];
};

export const signIn = async (provider: Provider) => {
  const { error } = await supabase.auth.signIn({ provider });
  if (error) console.log(error);
};
