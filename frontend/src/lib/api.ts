import { supabase } from "./supabaseClient";

/** `public.users.id` (UUID de Auth), útil para el juego y APIs que referencian `users`. */
export const LOCAL_STORAGE_DB_USER_ID_KEY = "plushyPocket_dbUserId";

export function persistDatabaseUserId(userId: string): void {
    try {
        localStorage.setItem(LOCAL_STORAGE_DB_USER_ID_KEY, userId);
    } catch {
        // private mode / disabled storage — ignore
    }
}

function serverBase(): string {
    return (import.meta.env.VITE_SERVER_URL ?? "").replace(/\/$/, "");
}

function requireServerBase(): string {
    const baseUrl = serverBase();
    if (!baseUrl) {
        throw new Error(
            "Missing VITE_SERVER_URL in .env — set your API base URL (e.g. http://localhost:8080).",
        );
    }
    return baseUrl;
}

/** OAuth return URL; Supabase completes the PKCE/session exchange from the client. */
export function authRedirectUrl(): string {
    return `${window.location.origin}/auth/callback`;
}

export async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: authRedirectUrl() },
    });
    return { error };
}

/** Usuario en la respuesta de `POST /api/auth/register` y `POST /api/auth/login`. */
export type BackendAuthUser = {
    id: string;
    email: string | undefined;
    user_metadata: Record<string, unknown>;
};

export type AuthSessionPayload = {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    expires_at?: number;
    token_type: string;
};

export type BackendAuthSuccess = {
    user: BackendAuthUser;
    session: AuthSessionPayload | null;
};

/** Respuesta de `GET /api/auth/me` (perfil en `public.users`). */
export type AuthMeResponse = BackendAuthUser & {
    age: number | null;
    character_selected: string | null;
    character_display_name: string | null;
    profile_picture_path: string | null;
    profile_picture_public_url: string | null;
};

const MIN_RECORDED_AGE = 1;
const MAX_RECORDED_AGE = 100;

/** Edad guardada y válida para omitir la pantalla de edad. */
export function isRecordedAgeComplete(
    age: number | null | undefined,
): age is number {
    return (
        typeof age === "number" &&
        Number.isInteger(age) &&
        age >= MIN_RECORDED_AGE &&
        age <= MAX_RECORDED_AGE
    );
}

/** Ya eligió personaje en `public.users.character_selected`. */
export function isCharacterSelectionComplete(
    character_selected: string | null | undefined,
): character_selected is string {
    return typeof character_selected === "string" && character_selected.length > 0;
}

async function readJson(res: Response): Promise<unknown> {
    return res.json().catch(() => ({}));
}

async function postAuthJson(
    path: string,
    body: Record<string, unknown>,
): Promise<BackendAuthSuccess> {
    const baseUrl = requireServerBase();
    const res = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const data = (await readJson(res)) as { error?: string } & Partial<BackendAuthSuccess>;
    if (!res.ok) {
        throw new Error(data.error ?? `Auth request failed (${res.status})`);
    }
    if (!data.user) {
        throw new Error("Invalid response from server");
    }
    return {
        user: data.user,
        session: data.session ?? null,
    };
}

export async function registerWithBackend(params: {
    email: string;
    password: string;
    username: string;
}): Promise<BackendAuthSuccess> {
    return postAuthJson("/api/auth/register", {
        email: params.email,
        password: params.password,
        username: params.username,
    });
}

export async function loginWithBackend(params: {
    email: string;
    password: string;
}): Promise<BackendAuthSuccess> {
    return postAuthJson("/api/auth/login", {
        email: params.email,
        password: params.password,
    });
}

/** Guarda en el cliente la sesión emitida por el backend (mismo JWT que Supabase). */
export async function fetchAuthMe(accessToken: string): Promise<AuthMeResponse> {
    const baseUrl = requireServerBase();
    const res = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = (await readJson(res)) as { error?: string } & Partial<AuthMeResponse>;
    if (!res.ok) {
        throw new Error(data.error ?? `Session check failed (${res.status})`);
    }
    if (data.id == null || typeof data.id !== "string") {
        throw new Error("Invalid response from server");
    }
    persistDatabaseUserId(data.id);
    return data as AuthMeResponse;
}

export async function persistSupabaseSession(session: AuthSessionPayload): Promise<void> {
    const { error } = await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
    });
    if (error) {
        throw new Error(error.message);
    }
    const { data } = await supabase.auth.getUser();
    if (data.user?.id) {
        persistDatabaseUserId(data.user.id);
    }
}

/** URL pública del objeto en el bucket `profilepicture` (misma base que el proyecto). */
export function profilePicturePublicUrl(storagePath: string): string {
    const base = (import.meta.env.VITE_SUPABASE_URL ?? "").replace(/\/$/, "");
    if (!base) {
        return "";
    }
    return `${base}/storage/v1/object/public/profilepicture/${encodeURIComponent(storagePath)}`;
}

/** Guarda `age` en la fila `users` de Supabase vía el backend (JWT del usuario). */
export async function updatePlayerAge(age: number): Promise<void> {
    const {
        data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
        throw new Error("You need to be signed in to save your age.");
    }
    const baseUrl = requireServerBase();
    const res = await fetch(`${baseUrl}/api/auth/age`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ age }),
    });
    const data = (await readJson(res)) as { error?: string };
    if (!res.ok) {
        throw new Error(data.error ?? `Could not save age (${res.status})`);
    }
}

/** Guarda personaje elegido (`character_selected` + clave en bucket `profilepicture`). */
export async function updatePlayerCharacter(characterName: string): Promise<void> {
    const {
        data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
        throw new Error("You need to be signed in to save your character.");
    }
    const baseUrl = requireServerBase();
    const res = await fetch(`${baseUrl}/api/auth/character`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ character_name: characterName }),
    });
    const data = (await readJson(res)) as { error?: string };
    if (!res.ok) {
        throw new Error(data.error ?? `Could not save character (${res.status})`);
    }
}
