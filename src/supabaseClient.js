import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wscauplnnlcalfjjargp.supabase.co";
const supabaseAnonKey = "sb_publishable_HS9FsgN6CjJBj4R3pchcmw_HRzmxhA3";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
