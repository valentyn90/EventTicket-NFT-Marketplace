import { Provider } from "@supabase/supabase-js";

interface SignUpOptions {
  provider?: Provider;
  email?: string;
  referralCode?: string;
}

export default SignUpOptions;
