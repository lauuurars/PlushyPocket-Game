import { createClient } from "@supabase/supabase-js"
import type { Session, User } from "@supabase/supabase-js"

import { SupabaseAdminClient, SupabaseClient } from "../config/supabase"

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

    if (SupabaseAdminClient) {
        const { data: adminData, error: adminErr } =
            await SupabaseAdminClient.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: userMetadata ?? {},
            })

        if (adminErr) {
            return { user: null, session: null, error: adminErr }
        }

        const user = adminData?.user ?? null

        const signedIn = await signInWithPassword(email, password)
        if (signedIn.error || !signedIn.session) {
            return {
                user,
                session: null,
                error:
                    signedIn.error ??
                    new Error(
                        "Cuenta creada pero no se pudo abrir sesión — revisa el login o la contraseña.",
                    ),
            }
        }

        return {
            user: signedIn.user ?? user,
            session: signedIn.session,
            error: null,
        }
    }

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

type ProfileRowResult = {
    age: number | null
    character_selected: string | null
    profile_picture_path: string | null
    error: Error | null
}

const getUserProfileRow = async (
    accessToken: string,
    userId: string,
): Promise<ProfileRowResult> => {
    const client = clientWithUserJwt(accessToken)
    const { data, error } = await client
        .from("users")
        .select("age, character_selected, profile_picture_path")
        .eq("id", userId)
        .maybeSingle()

    if (error) {
        return {
            age: null,
            character_selected: null,
            profile_picture_path: null,
            error: new Error(error.message),
        }
    }
    if (!data) {
        return { age: null, character_selected: null, profile_picture_path: null, error: null }
    }

    const rawAge = data.age
    let age: number | null = null
    if (rawAge !== null && rawAge !== undefined && typeof rawAge === "number") {
        age = rawAge
    }

    const ch = data.character_selected as unknown
    const character_selected =
        typeof ch === "string" ? ch : ch != null ? String(ch) : null

    const pathRaw = data.profile_picture_path as unknown
    const profile_picture_path =
        typeof pathRaw === "string" ? pathRaw : pathRaw != null ? String(pathRaw) : null

    return { age, character_selected, profile_picture_path, error: null }
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

const updateUserCharacterSelection = async (
    accessToken: string,
    userId: string,
    characterSelected: string,
    profilePicturePath: string,
): Promise<UpdateAgeResult> => {
    const client = clientWithUserJwt(accessToken)
    const { data, error } = await client
        .from("users")
        .update({
            character_selected: characterSelected,
            profile_picture_path: profilePicturePath,
        })
        .eq("id", userId)
        .select("id")

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
    getUserProfileRow,
    updateUserAge,
    updateUserCharacterSelection,
}
