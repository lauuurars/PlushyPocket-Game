import type { Session, User } from "@supabase/supabase-js"

import AuthRepository from "./auth.repository"
import type {
    AuthMePayload,
    AuthSessionPayload,
    AuthSuccessResponse,
    AuthUserPayload,
    LoginDTO,
    RegisterDTO,
    UpdateCharacterDTO,
} from "../types/auth.types"

const toUserPayload = (user: User): AuthUserPayload => ({
    id: user.id,
    email: user.email,
    user_metadata: (user.user_metadata ?? {}) as Record<string, unknown>,
})

const toSessionPayload = (session: Session): AuthSessionPayload => ({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_in: session.expires_in ?? 3600,
    expires_at: session.expires_at,
    token_type: session.token_type,
})

const buildSuccessResponse = (
    user: User | null,
    session: Session | null,
): AuthSuccessResponse => {
    if (!user) {
        throw new Error("Auth succeeded but user payload is missing")
    }
    return {
        user: toUserPayload(user),
        session: session ? toSessionPayload(session) : null,
    }
}

const PROFILE_PICTURE_BUCKET = "profilepicture"

type ResolvedCharacter = {
    enumValue: "mochi" | "misu" | "yuki"
    displayName: string
    storageFileName: string
}

const resolveCharacterChoice = (raw: string): ResolvedCharacter | null => {
    const key = raw.trim().toLowerCase()
    if (key === "mochi") {
        return { enumValue: "mochi", displayName: "Mochi", storageFileName: "Mochi.png" }
    }
    if (key === "misu") {
        return { enumValue: "misu", displayName: "Misu", storageFileName: "Misu.png" }
    }
    if (key === "yuki") {
        return { enumValue: "yuki", displayName: "Yuki", storageFileName: "Yuki.png" }
    }
    return null
}

const displayNameFromEnum = (enumVal: string | null): string | null => {
    if (!enumVal) {
        return null
    }
    return resolveCharacterChoice(enumVal)?.displayName ?? null
}

const publicProfilePictureUrl = (path: string | null): string | null => {
    if (!path) {
        return null
    }
    const base = process.env.SUPABASE_URL?.replace(/\/$/, "")
    if (!base) {
        return null
    }
    return `${base}/storage/v1/object/public/${PROFILE_PICTURE_BUCKET}/${encodeURIComponent(path)}`
}

const register = async (dto: RegisterDTO): Promise<AuthSuccessResponse> => {
    const email = dto.email.trim()
    const password = dto.password
    if (!email || !password) {
        throw new Error("Email and password are required")
    }

    const metadata =
        dto.username?.trim() != null && dto.username.trim() !== ""
            ? { username: dto.username.trim() }
            : undefined

    const { user, session, error } = await AuthRepository.signUpWithEmail(
        email,
        password,
        metadata,
    )

    if (error) {
        throw new Error(error.message)
    }

    return buildSuccessResponse(user, session)
}

const login = async (dto: LoginDTO): Promise<AuthSuccessResponse> => {
    const email = dto.email.trim()
    const password = dto.password
    if (!email || !password) {
        throw new Error("Email and password are required")
    }

    const { user, session, error } = await AuthRepository.signInWithPassword(email, password)

    if (error) {
        throw new Error(error.message)
    }

    if (!session) {
        throw new Error("No session returned — check Supabase auth settings")
    }

    return buildSuccessResponse(user, session)
}

const getMeFromBearerToken = async (accessToken: string): Promise<AuthMePayload> => {
    const { user, error } = await AuthRepository.getUserFromAccessToken(accessToken)

    if (error) {
        throw new Error(error.message)
    }
    if (!user) {
        throw new Error("Invalid session")
    }

    const { age, character_selected, profile_picture_path, error: profileErr } =
        await AuthRepository.getUserProfileRow(accessToken, user.id)
    if (profileErr) {
        throw new Error(profileErr.message)
    }

    return {
        ...toUserPayload(user),
        age,
        character_selected,
        character_display_name: displayNameFromEnum(character_selected),
        profile_picture_path,
        profile_picture_public_url: publicProfilePictureUrl(profile_picture_path),
    }
}

const MIN_AGE = 1
const MAX_AGE = 100

const updateAgeForBearerToken = async (
    accessToken: string,
    age: number,
): Promise<{ ok: true }> => {
    if (!Number.isInteger(age) || age < MIN_AGE || age > MAX_AGE) {
        throw new Error(`Age must be a whole number between ${MIN_AGE} and ${MAX_AGE}`)
    }

    const { user, error: userErr } = await AuthRepository.getUserFromAccessToken(accessToken)
    if (userErr) {
        throw new Error(userErr.message)
    }
    if (!user) {
        throw new Error("Invalid session")
    }

    const { error } = await AuthRepository.updateUserAge(accessToken, user.id, age)
    if (error) {
        throw new Error(error.message)
    }

    return { ok: true }
}

const updateCharacterForBearerToken = async (
    accessToken: string,
    dto: UpdateCharacterDTO,
): Promise<{ ok: true }> => {
    const resolved = resolveCharacterChoice(dto.character_name)
    if (!resolved) {
        throw new Error("Invalid character — choose Mochi, Misu, or Yuki.")
    }

    const { user, error: userErr } = await AuthRepository.getUserFromAccessToken(accessToken)
    if (userErr) {
        throw new Error(userErr.message)
    }
    if (!user) {
        throw new Error("Invalid session")
    }

    const { error } = await AuthRepository.updateUserCharacterSelection(
        accessToken,
        user.id,
        resolved.enumValue,
        resolved.storageFileName,
    )
    if (error) {
        throw new Error(error.message)
    }

    return { ok: true }
}

export default {
    register,
    login,
    getMeFromBearerToken,
    updateAgeForBearerToken,
    updateCharacterForBearerToken,
}
