import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
    console.warn(
        "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — auth routes will fail until set.",
    );
}

export const supabase = createClient(url ?? "", anonKey ?? "");
