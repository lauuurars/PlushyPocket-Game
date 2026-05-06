export type RegisterDTO = {
    email: string
    password: string
    username?: string
}

export type LoginDTO = {
    email: string
    password: string
}

export type UpdateAgeDTO = {
    age: number
}

/** Display name from Choose Character (Mochi / Misu / Yuki). */
export type UpdateCharacterDTO = {
    character_name: string
}

/** Fragmento de sesión enviado al cliente para `supabase.auth.setSession`. */
export type AuthSessionPayload = {
    access_token: string
    refresh_token: string
    expires_in: number
    expires_at?: number
    token_type: string
}

export type AuthUserPayload = {
    id: string
    email: string | undefined
    user_metadata: Record<string, unknown>
}

/** `GET /api/auth/me`: usuario de Auth + edad en `public.users` (null si no hay fila o sin edad). */
export type AuthMePayload = AuthUserPayload & {
    age: number | null
    /** Valor enum en BD (`mochi` | `misu` | `yuki`) o null si aún no eligió personaje. */
    character_selected: string | null
    /** Nombre mostrado del personaje (p. ej. Mochi); null si no hay selección. */
    character_display_name: string | null
    /** Clave del objeto en el bucket `profilepicture` (p. ej. Mochi.png). */
    profile_picture_path: string | null
    /** URL pública de Storage para `profile_picture_path`. */
    profile_picture_public_url: string | null
}

export type AuthSuccessResponse = {
    user: AuthUserPayload
    session: AuthSessionPayload | null
}
