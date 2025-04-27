import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./env.js"; 

const customFetch = (url, options = {}) => {
  return fetch(url, {
    ...options,
    credentials: "omit",
  });
};

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: { fetch: customFetch }
});

console.log("🔥 Supabase Initialized:", supabase);
export { supabase };
