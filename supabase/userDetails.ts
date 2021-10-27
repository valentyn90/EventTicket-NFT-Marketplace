import { supabase } from "./supabase-client";

export const updateUsername = async (user_name: string, id: string) =>
  supabase
    .from("user_details")
    .update([
      {
        user_name,
      },
    ])
    .match({ id });
