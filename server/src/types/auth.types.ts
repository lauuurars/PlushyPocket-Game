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
}

export type AuthSuccessResponse = {
    user: AuthUserPayload
    session: AuthSessionPayload | null
}
