import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

dotenv.config()

const url = process.env.SUPABASE_URL!
const key = process.env.SUPABASE_PUBLISHABLE_KEY!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const SupabaseClient = createClient(url, key)

export const SupabaseAdminClient =
    serviceRoleKey != null && serviceRoleKey !== ""
        ? createClient(url, serviceRoleKey, {
              auth: { autoRefreshToken: false, persistSession: false },
          })
        : null