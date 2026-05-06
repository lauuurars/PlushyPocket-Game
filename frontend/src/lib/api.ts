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

/** URL pública según el cliente de Supabase (`getPublicUrl`). */
export function profilePicturePublicUrl(storagePath: string): string {
    const p = storagePath.trim();
    if (!p) {
        return "";
    }
    const base = (import.meta.env.VITE_SUPABASE_URL ?? "").trim();
    if (!base) {
        return "";
    }
    const { data } = supabase.storage.from("profilepicture").getPublicUrl(p);
    return data.publicUrl ?? "";
}

function pushUniquePath(paths: string[], value: string | null | undefined) {
    const t = value?.trim();
    if (t && !paths.includes(t)) {
        paths.push(t);
    }
}

function capitalizeSlug(slug: string): string {
    const s = slug.trim().toLowerCase();
    if (!s) {
        return "";
    }
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function fileBaseWithoutExtFromPath(storagePath: string): string {
    const last = storagePath.split("/").filter(Boolean).pop() ?? storagePath;
    return last.replace(/\.[^/.]+$/i, "").trim();
}

/**
 * Objetos en Storage (bucket `profilepicture`): raíz con Mochi.svg, Misu.svg, Yuki.svg.
 * `users.profile_picture_path` puede seguir con `.png` legacy; priorizamos `.svg` y el swap en la URL del API.
 */
export function profilePictureStoragePathCandidates(
    profilePath: string | null | undefined,
    characterSelected: string | null | undefined,
): string[] {
    const paths: string[] = [];

    function addNameVariants(baseRaw: string | null | undefined) {
        const base = baseRaw?.trim();
        if (!base) {
            return;
        }
        const slug = base.toLowerCase();
        const cap = capitalizeSlug(slug);
        if (!cap) {
            return;
        }

        pushUniquePath(paths, `${cap}.svg`);
        pushUniquePath(paths, `${slug}.svg`);
        pushUniquePath(paths, `${cap}.png`);
        pushUniquePath(paths, `${slug}.png`);
        pushUniquePath(paths, `choose/${cap}.svg`);
        pushUniquePath(paths, `choose/${slug}.svg`);
        pushUniquePath(paths, `choose/${cap}.png`);
        pushUniquePath(paths, `choose/${slug}.png`);
        pushUniquePath(paths, `assets/choose/${cap}.svg`);
        pushUniquePath(paths, `assets/choose/${slug}.svg`);
        pushUniquePath(paths, `src/assets/choose/${cap}.svg`);
        pushUniquePath(paths, `src/assets/choose/${slug}.svg`);
    }

    const pp = profilePath?.trim();
    if (pp) {
        if (/\.png$/i.test(pp)) {
            pushUniquePath(paths, pp.replace(/\.png$/i, ".svg"));
        }
        pushUniquePath(paths, pp);
        if (/\.svg$/i.test(pp)) {
            pushUniquePath(paths, pp.replace(/\.svg$/i, ".png"));
        }
        addNameVariants(fileBaseWithoutExtFromPath(pp));
    }

    const ch = characterSelected?.trim();
    if (ch) {
        addNameVariants(ch);
    }

    return paths;
}

/** URLs públicas ordenadas para `<img>` (prueba la siguiente en `onError`). */
export function profilePicturePublicUrlsOrdered(
    profile_picture_path: string | null,
    character_selected: string | null,
    backendPublicUrl?: string | null,
): string[] {
    const out: string[] = [];
    const add = (u: string | null | undefined) => {
        const t = u?.trim();
        if (t && !out.includes(t)) {
            out.push(t);
        }
    };
    const bu = backendPublicUrl?.trim();
    /** El API puede devolver `…/Yuki.png` pero en Storage existen sólo `.svg`. */
    if (bu && /\.png(?=\?|#|$)/i.test(bu)) {
        add(bu.replace(/\.png(?=\?|#|$)/i, ".svg"));
    }
    add(backendPublicUrl ?? null);

    const rawPaths = profilePictureStoragePathCandidates(profile_picture_path, character_selected);
    const fromPaths = rawPaths.map((p) => profilePicturePublicUrl(p)).filter(Boolean);
    for (const u of fromPaths) {
        add(u);
    }
    return out;
}

export function profilePictureUrlsForAuthMe(me: AuthMeResponse): string[] {
    return profilePicturePublicUrlsOrdered(
        me.profile_picture_path,
        me.character_selected,
        me.profile_picture_public_url,
    );
}

/** Estado recibido al navegar de PartyRoom → `/results`. */
export type PartyResultsNavState = {
    roomCode?: string;
    winnerPlayer: 1 | 2;
    winnerName: string;
    player1Name: string;
    player2Name: string;
    /** Lista de URLs públicas (.svg antes que `.png`). */
    player1AvatarUrls?: string[];
    player2AvatarUrl?: string | null;
};

/** Perfil del usuario enlazado a `LOCAL_STORAGE_DB_USER_ID_KEY` (misma sesión activa). */
export type PartyUserDisplay = {
    id: string;
    displayName: string;
    /** URLs Storage (`profilepicture`) ordenadas; vacío si no hay personaje/paths */
    avatarUrls: string[];
    character_selected: string | null;
};

function displayNameFromAuthMe(me: AuthMeResponse): string {
    const meta = me.user_metadata ?? {};
    const uname = meta.username;
    if (typeof uname === "string" && uname.trim() !== "") {
        return uname.trim();
    }
    const email = me.email?.trim();
    if (email && email.includes("@")) {
        return email.split("@")[0] ?? "Player";
    }
    if (me.character_display_name) {
        return me.character_display_name;
    }
    return "Player";
}

function displayNameFromSupabaseUser(user: {
    email?: string;
    user_metadata?: Record<string, unknown>;
} | null): string {
    if (!user) {
        return "Player";
    }
    const meta = user.user_metadata ?? {};
    const uname = meta.username;
    if (typeof uname === "string" && uname.trim() !== "") {
        return uname.trim();
    }
    const email = user.email?.trim();
    if (email && email.includes("@")) {
        return email.split("@")[0] ?? "Player";
    }
    return "Player";
}

/**
 * Carga datos del usuario cuyo id está en `plushyPocket_dbUserId`, validando que coincida
 * con la sesión de Supabase (sin lógica de salas; solo lectura de perfil).
 */
export async function fetchPartyRoomUserProfile(): Promise<PartyUserDisplay | null> {
    try {
        const raw =
            typeof localStorage !== "undefined"
                ? localStorage.getItem(LOCAL_STORAGE_DB_USER_ID_KEY)?.trim()
                : "";
        const {
            data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token || !session.user?.id) {
            return null;
        }
        const effectiveId = raw && raw.length > 0 ? raw : session.user.id;
        if (session.user.id !== effectiveId) {
            return null;
        }

        let me: AuthMeResponse | null = null;
        try {
            me = await fetchAuthMe(session.access_token);
        } catch {
            me = null;
        }

        if (me && me.id === effectiveId) {
            const avatarUrls = profilePicturePublicUrlsOrdered(
                me.profile_picture_path,
                me.character_selected,
                me.profile_picture_public_url,
            );
            return {
                id: me.id,
                displayName: displayNameFromAuthMe(me),
                avatarUrls,
                character_selected: me.character_selected,
            };
        }

        const { data: row, error } = await supabase
            .from("users")
            .select("character_selected, profile_picture_path")
            .eq("id", effectiveId)
            .maybeSingle();

        if (error || !row) {
            return null;
        }

        const character_selected =
            typeof row.character_selected === "string" ? row.character_selected : null;
        const profile_picture_path =
            typeof row.profile_picture_path === "string" ? row.profile_picture_path : null;

        const { data: userData } = await supabase.auth.getUser();
        const avatarUrls = profilePicturePublicUrlsOrdered(
            profile_picture_path,
            character_selected,
            null,
        );

        return {
            id: effectiveId,
            displayName: displayNameFromSupabaseUser(userData.user),
            avatarUrls,
            character_selected,
        };
    } catch {
        return null;
    }
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
