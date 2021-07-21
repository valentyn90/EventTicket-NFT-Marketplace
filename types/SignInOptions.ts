import { Provider } from "@supabase/supabase-js";

interface SignInOptions {
  provider?: Provider;
  email?: string;
  goToStepOne?: boolean;
}

export default SignInOptions;
