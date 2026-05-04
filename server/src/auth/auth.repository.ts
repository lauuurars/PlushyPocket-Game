import { createClient } from "@supabase/supabase-js"
import type { Session, User } from "@supabase/supabase-js"

import { SupabaseClient } from "../config/supabase"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_PUBLISHABLE_KEY!

type SignUpResult = {
    user: User | null
    session: Session | null
    error: Error | null
}

type SignInResult = {
    user: User | null
    session: Session | null
    error: Error | null
}

type GetUserResult = {
    user: User | null
    error: Error | null
}

const signUpWithEmail = async (
    email: string,
    password: string,
    userMetadata?: Record<string, unknown>,
): Promise<SignUpResult> => {
    const { data, error } = await SupabaseClient.auth.signUp({
        email,
        password,
        options: userMetadata ? { data: userMetadata } : undefined,
    })

    return {
        user: data.user ?? null,
        session: data.session ?? null,
        error: error ?? null,
    }
}

const signInWithPassword = async (
    email: string,
    password: string,
): Promise<SignInResult> => {
    const { data, error } = await SupabaseClient.auth.signInWithPassword({
        email,
        password,
    })

    return {
        user: data.user ?? null,
        session: data.session ?? null,
        error: error ?? null,
    }
}

const getUserFromAccessToken = async (accessToken: string): Promise<GetUserResult> => {
    const {
        data: { user },
        error,
    } = await SupabaseClient.auth.getUser(accessToken)

    return {
        user: user ?? null,
        error: error ?? null,
    }
}

type UpdateAgeResult = {
    error: Error | null
}

/** Cliente con JWT del usuario para respetar RLS al actualizar `users`. */
const clientWithUserJwt = (accessToken: string) =>
    createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: { Authorization: `Bearer ${accessToken}` },
        },
    })

type ProfileAgeResult = {
    age: number | null
    error: Error | null
}

const getUserProfileAge = async (
    accessToken: string,
    userId: string,
): Promise<ProfileAgeResult> => {
    const client = clientWithUserJwt(accessToken)
    const { data, error } = await client.from("users").select("age").eq("id", userId).maybeSingle()

    if (error) {
        return { age: null, error: new Error(error.message) }
    }
    if (!data) {
        return { age: null, error: null }
    }
    const raw = data.age
    if (raw === null || raw === undefined) {
        return { age: null, error: null }
    }
    if (typeof raw !== "number") {
        return { age: null, error: null }
    }
    return { age: raw, error: null }
}

const updateUserAge = async (
    accessToken: string,
    userId: string,
    age: number,
): Promise<UpdateAgeResult> => {
    const client = clientWithUserJwt(accessToken)
    const { data, error } = await client.from("users").update({ age }).eq("id", userId).select("id")

    if (error) {
        return { error: new Error(error.message) }
    }
    if (!data?.length) {
        return {
            error: new Error(
                "No user profile row to update — check that public.users has a row for this account.",
            ),
        }
    }

    return { error: null }
}

export default {
    signUpWithEmail,
    signInWithPassword,
    getUserFromAccessToken,
    getUserProfileAge,
    updateUserAge,
}
