import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, X } from "lucide-react";

import Background from "../../assets/BgProfile.svg?url";
import BackgroundEdit from "../../assets/EditBg.svg?url"
import MisuIcon from "../../assets/profile-pic/Misu-Icon.svg";
import MochiIcon from "../../assets/profile-pic/Mochi-Icon.svg";
import YukiIcon from "../../assets/profile-pic/Yuki-Icon.svg";
import Navbar from "../../components/mobile/Navbar";
import { PinkButton } from "../../components/PinkButton";
import { fetchAuthMe, persistUsername, updatePlayerAge } from "../../lib/api";
import { supabase } from "../../lib/supabaseClient";

export default function Profile() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [username, setUsername] = useState("Player");
    const [email, setEmail] = useState<string>("");
    const [age, setAge] = useState<number | null>(null);
    const [characterSelected, setCharacterSelected] = useState<string | null>(null);
    const [showEdit, setShowEdit] = useState(false);
    const [editUsername, setEditUsername] = useState("");
    const [editAge, setEditAge] = useState("");
    const [editPassword, setEditPassword] = useState("");
    const [editConfirmPassword, setEditConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [baselineUsername, setBaselineUsername] = useState("");
    const [baselineAge, setBaselineAge] = useState<number | null>(null);

    const passwordsMismatch = editConfirmPassword.trim().length > 0 && editPassword !== editConfirmPassword;

    const parsedEditAge = editAge.trim().length === 0 ? null : Number(editAge);
    const isValidEditAge = typeof parsedEditAge === "number" && Number.isFinite(parsedEditAge) && Number.isInteger(parsedEditAge);

    const hasProfileChanges =
        editUsername.trim() !== baselineUsername.trim() ||
        parsedEditAge !== baselineAge ||
        editPassword.trim().length > 0 ||
        editConfirmPassword.trim().length > 0;

    const canSaveProfileChanges =
        hasProfileChanges &&
        !saving &&
        editUsername.trim().length > 0 &&
        isValidEditAge &&
        !passwordsMismatch &&
        (editPassword.trim().length === 0 || editPassword.length >= 6);

    const profileIcon = useMemo(() => {
        const key = (characterSelected ?? "").toLowerCase();
        if (key === "misu") return MisuIcon;
        if (key === "yuki") return YukiIcon;
        return MochiIcon;
    }, [characterSelected]);

    useEffect(() => {
        let cancelled = false;

        async function loadProfile() {
            setLoading(true);
            setError(null);
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();

                if (!session?.access_token) {
                    navigate("/login", { replace: true });
                    return;
                }

                const me = await fetchAuthMe(session.access_token);
                if (cancelled) return;

                const storedName = localStorage.getItem("username");
                if (typeof storedName === "string" && storedName.trim() !== "") {
                    setUsername(storedName);
                } else {
                    const meta = me.user_metadata ?? {};
                    const u = meta.username;
                    if (typeof u === "string" && u.trim() !== "") {
                        setUsername(u.trim());
                    } else if (typeof me.email === "string" && me.email.includes("@")) {
                        setUsername(me.email.split("@")[0] ?? "Player");
                    } else {
                        setUsername("Player");
                    }
                }

                setEmail(typeof me.email === "string" ? me.email : "");
                setAge(typeof me.age === "number" ? me.age : null);
                const storedCharacter = localStorage.getItem("character");
                if (typeof me.character_selected === "string" && me.character_selected.trim() !== "") {
                    setCharacterSelected(me.character_selected);
                } else if (typeof storedCharacter === "string" && storedCharacter.trim() !== "") {
                    setCharacterSelected(storedCharacter);
                } else {
                    setCharacterSelected(null);
                }
            } catch (e) {
                if (cancelled) return;
                setError(e instanceof Error ? e.message : "Something went wrong.");
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadProfile();
        return () => {
            cancelled = true;
        };
    }, [navigate]);

    function openEdit() {
        setSaveError(null);
        setBaselineUsername(username);
        setBaselineAge(age);
        setEditUsername(username);
        setEditAge(age != null ? String(age) : "");
        setEditPassword("");
        setEditConfirmPassword("");
        setShowPassword(false);
        setShowConfirmPassword(false);
        setShowEdit(true);
    }

    async function handleSaveChanges() {
        if (saving) return;
        setSaveError(null);

        const nextUsername = editUsername.trim();
        if (!nextUsername) {
            setSaveError("Username is required.");
            return;
        }

        const nextAgeRaw = editAge.trim();
        const nextAge = nextAgeRaw ? Number(nextAgeRaw) : NaN;
        if (!nextAgeRaw || !Number.isFinite(nextAge) || !Number.isInteger(nextAge)) {
            setSaveError("Age must be a valid number.");
            return;
        }

        if (editPassword || editConfirmPassword) {
            if (editPassword !== editConfirmPassword) {
                setSaveError("Passwords do not match.");
                return;
            }
            if (editPassword.length < 6) {
                setSaveError("Password must be at least 6 characters.");
                return;
            }
        }

        setSaving(true);
        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (!session) {
                navigate("/login", { replace: true });
                return;
            }

            const usernameChanged = nextUsername !== username;
            const ageChanged = nextAge !== (age ?? null);
            const passwordChanged = !!editPassword;

            if (usernameChanged) {
                const { error: uErr } = await supabase.auth.updateUser({
                    data: { username: nextUsername },
                });
                if (uErr) throw new Error(uErr.message);

                const { error: dbErr } = await supabase
                    .from("users")
                    .update({ username: nextUsername })
                    .eq("id", session.user.id);
                if (dbErr) throw new Error(dbErr.message);
            }

            if (ageChanged) {
                await updatePlayerAge(nextAge);
            }

            if (passwordChanged) {
                const { error: pErr } = await supabase.auth.updateUser({
                    password: editPassword,
                });
                if (pErr) throw new Error(pErr.message);
            }

            setUsername(nextUsername);
            persistUsername(nextUsername);
            setAge(nextAge);
            setShowEdit(false);
        } catch (e) {
            setSaveError(e instanceof Error ? e.message : "Something went wrong.");
        } finally {
            setSaving(false);
        }
    }

    async function handleLogout() {
        try {
            await supabase.auth.signOut();
        } finally {
            navigate("/login", { replace: true });
        }
    }

    return (
        <>
            <style>{`
                input[type="password"]::-ms-reveal,
                input[type="password"]::-ms-clear {
                    display: none;
                }
                input[type="password"]::-webkit-credentials-auto-fill-button,
                input[type="password"]::-webkit-textfield-decoration-container {
                    display: none !important;
                    visibility: hidden;
                    pointer-events: none;
                }
            `}</style>
            <div className="relative w-full overflow-hidden flex flex-col md:hidden"
                style={{ minHeight: "100svh", maxWidth: "430px", margin: "0 auto" }}>
                {/* fondo */}
                <div
                    aria-hidden
                    style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: `url("${Background}")`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        zIndex: 0,
                    }}
                />

                {loading && (
                    <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                            zIndex: 40,
                            background: "rgba(250, 250, 250, 0.75)",
                        }}
                    >
                        <div
                            className="h-12 w-12 animate-spin rounded-full border-4"
                            style={{
                                borderColor: "rgba(237, 28, 36, 0.25)",
                                borderTopColor: "#ED1C24",
                            }}
                        />
                    </div>
                )}

                {!loading && (
                    <div className="relative flex flex-col w-full" style={{ zIndex: 3, flex: 1 }}>
                        <div
                            className="flex w-full flex-col items-center text-center"
                            style={{ padding: "clamp(86px, 9vw, 110px) clamp(24px, 7vw, 40px) 0" }}
                        >
                            <h1
                                style={{
                                    fontFamily: "'Baloo 2', cursive",
                                    fontWeight: 800,
                                    fontSize: "45px",
                                    color: "#D51017",
                                    lineHeight: 1.1,
                                    margin: 0,
                                    textShadow: "0 3px 16px rgba(0,0,0,0.12)",
                                }}
                            >
                                My Profile
                            </h1>

                            <div className="mt-5 flex flex-col items-center">
                                <div
                                    className="rounded-full overflow-hidden flex items-center justify-center bg-white"
                                    style={{
                                        width: 112,
                                        height: 112,
                                    }}
                                >
                                    <img
                                        src={profileIcon}
                                        alt="Profile picture"
                                        className="h-full w-full object-cover"
                                    />
                                </div>

                                <p
                                    className="mt-6 pt-5"
                                    style={{
                                        fontFamily: "'Nunito', system-ui, sans-serif",
                                        fontWeight: 900,
                                        fontSize: "30px",
                                        color: "#583921",
                                        lineHeight: 1.1,
                                        margin: 0,
                                    }}
                                >
                                    {username}
                                </p>

                                <p
                                    className="mt-2 pt-1"
                                    style={{
                                        fontFamily: "'Nunito', system-ui, sans-serif",
                                        fontWeight: 700,
                                        fontSize: "15px",
                                        color: "#8B7767",
                                        margin: 0,
                                    }}
                                >
                                    Age: {age ?? "-"}
                                </p>
                            </div>
                        </div>

                        <div
                            className="w-full"
                            style={{ padding: "34px clamp(24px, 7vw, 40px) 0" }}
                        >
                            {error && (
                                <p
                                    className="mx-auto mb-6 max-w-[320px] text-center text-sm"
                                    role="alert"
                                    style={{
                                        fontFamily: "'Nunito', system-ui, sans-serif",
                                        color: "#D51017",
                                        fontWeight: 700,
                                        margin: 0,
                                    }}
                                >
                                    {error}
                                </p>
                            )}

                            <div>
                                <p
                                    style={{
                                        fontFamily: "'Nunito', system-ui, sans-serif",
                                        fontSize: "18px",
                                        fontWeight: 700,
                                        color: "#6a6a6a",
                                        margin: 0,
                                    }}
                                >
                                    Email
                                </p>
                                <p
                                    className="mt-1"
                                    style={{
                                        fontFamily: "'Nunito', system-ui, sans-serif",
                                        fontSize: "16px",
                                        fontWeight: 500,
                                        color: "#979797",
                                        margin: 0,
                                        wordBreak: "break-word",
                                    }}
                                >
                                    {email || "-"}
                                </p>
                                <div
                                    className="mt-2"
                                    style={{
                                        height: 1,
                                        width: "100%",
                                        background: "#979797",
                                        opacity: 0.9,
                                    }}
                                />
                            </div>

                            <div className="mt-6">
                                <p
                                    style={{
                                        fontFamily: "'Nunito', system-ui, sans-serif",
                                        fontSize: "18px",
                                        fontWeight: 700,
                                        color: "#6a6a6a",
                                        margin: 0,
                                    }}
                                >
                                    Password
                                </p>
                                <p
                                    className="mt-2"
                                    style={{
                                        fontFamily: "'Nunito', system-ui, sans-serif",
                                        fontSize: "18px",
                                        fontWeight: 700,
                                        color: "#979797",
                                        margin: 0,
                                        letterSpacing: "2px",
                                    }}
                                >
                                    ••••••••
                                </p>
                                <div
                                    className="mt-2"
                                    style={{
                                        height: 1,
                                        width: "100%",
                                        background: "#979797",
                                        opacity: 0.9,
                                    }}
                                />
                            </div>

                            <div className="mt-14 flex items-center justify-between gap-5 pb-36">
                                <PinkButton
                                    text="Edit Profile"
                                    disabled={loading}
                                    onClick={openEdit}
                                    className="w-42.5 h-11.25 px-0 py-0 text-[17px] font-bold shadow-[0px_3px_8px_rgba(76,76,76,0.25)] hover:scale-[1.02] active:scale-[0.98]"
                                />
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={() => void handleLogout()}
                                    className="w-42.5 h-11.25 rounded-full text-[18px] font-bold text-[#FAFAFA] shadow-[0px_3px_8px_rgba(76,76,76,0.25)] transition-transform enabled:hover:scale-[1.02] enabled:active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                                    style={{
                                        background: "#979797",
                                        fontFamily: "'Nunito', system-ui, sans-serif",
                                    }}
                                >
                                    Log Out
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --------- edit profile pop up ------------------- */}
                {showEdit && (
                    <div
                        className="fixed inset-0 flex items-end justify-center md:hidden"
                        style={{ zIndex: 60 }}
                        role="dialog"
                        aria-modal="true"
                    >
                        <div
                            className="absolute inset-0"
                            onClick={() => (saving ? null : setShowEdit(false))}
                            style={{ background: "rgba(0,0,0,0.15)" }}
                        />
                        <div
                            className="relative w-full overflow-hidden"
                            style={{
                                maxWidth: "430px",
                                background: "#FAFAFA",
                                borderTopLeftRadius: 60,
                                borderTopRightRadius: 60,
                                minHeight: "92svh",
                                backgroundImage: `url("${BackgroundEdit}")`,
                                backgroundPosition: "center",
                                backgroundSize: "cover",
                                backgroundRepeat: "no-repeat",
                            }}
                        >
                            <div className="relative w-full" style={{ padding: "24px 24px 0" }}>
                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={() => setShowEdit(false)}
                                    className="flex h-10 w-10 items-center justify-center rounded-full text-white disabled:opacity-60"
                                    style={{ background: "#ED1C24" }}
                                    aria-label="Close"
                                >
                                    <X size={22} />
                                </button>
                            </div>

                            <div className="flex flex-col items-center text-center" style={{ padding: "0 24px" }}>
                                <h2
                                    className="mt-3"
                                    style={{
                                        fontFamily: "'Baloo 2', cursive",
                                        fontWeight: 800,
                                        fontSize: "45px",
                                        color: "#D51017",
                                        lineHeight: 1.05,
                                        margin: 0,
                                    }}
                                >
                                    Edit Profile
                                </h2>

                                <div className="mt-5 flex flex-col items-center">
                                    <div
                                        className="rounded-full overflow-hidden flex items-center justify-center bg-white"
                                        style={{
                                            width: 112,
                                            height: 112,
                                        }}
                                    >
                                        <img
                                            src={profileIcon}
                                            alt="Profile picture"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <p
                                        className="mt-6 pt-3"
                                        style={{
                                            fontFamily: "'Nunito', system-ui, sans-serif",
                                            fontWeight: 900,
                                            fontSize: "30px",
                                            color: "#583921",
                                            lineHeight: 1.1,
                                            margin: 0,
                                        }}
                                    >
                                        {username}
                                    </p>
                                    <p
                                        className="mt-2 pt-1"
                                        style={{
                                            fontFamily: "'Nunito', system-ui, sans-serif",
                                            fontWeight: 700,
                                            fontSize: "15px",
                                            color: "#8B7767",
                                            margin: 0,
                                        }}
                                    >
                                        Age: {age ?? "-"}
                                    </p>
                                </div>
                            </div>

                            <div className="w-full" style={{ padding: "22px 24px 24px" }}>
                                {saveError && (
                                    <p
                                        className="mx-auto mb-4 max-w-[320px] text-center text-sm"
                                        role="alert"
                                        style={{
                                            fontFamily: "'Nunito', system-ui, sans-serif",
                                            color: "#D51017",
                                            fontWeight: 700,
                                            margin: 0,
                                        }}
                                    >
                                        {saveError}
                                    </p>
                                )}

                                <div>
                                    <label
                                        style={{
                                            fontFamily: "'Nunito', system-ui, sans-serif",
                                            fontSize: "18px",
                                            fontWeight: 700,
                                            color: "#6a6a6a",
                                        }}
                                    >
                                        Username
                                    </label>
                                    <input
                                        value={editUsername}
                                        onChange={(e) => setEditUsername(e.target.value)}
                                        disabled={saving}
                                        className="mt-1 w-full bg-transparent outline-none"
                                        style={{
                                            fontFamily: "'Nunito', system-ui, sans-serif",
                                            fontSize: "16px",
                                            fontWeight: 500,
                                            color: "#979797",
                                        }}
                                    />
                                    <div className="mt-2" style={{ height: 1, width: "100%", background: "#979797" }} />
                                </div>

                                <div className="mt-4">
                                    <label
                                        style={{
                                            fontFamily: "'Nunito', system-ui, sans-serif",
                                            fontSize: "18px",
                                            fontWeight: 700,
                                            color: "#6a6a6a",
                                        }}
                                    >
                                        Age
                                    </label>
                                    <input
                                        value={editAge}
                                        onChange={(e) => setEditAge(e.target.value)}
                                        disabled={saving}
                                        inputMode="numeric"
                                        className="mt-1 w-full bg-transparent outline-none"
                                        style={{
                                            fontFamily: "'Nunito', system-ui, sans-serif",
                                            fontSize: "16px",
                                            fontWeight: 500,
                                            color: "#979797",
                                        }}
                                    />
                                    <div className="mt-2" style={{ height: 1, width: "100%", background: "#979797" }} />
                                </div>

                                <div className="mt-4">
                                    <label
                                        style={{
                                            fontFamily: "'Nunito', system-ui, sans-serif",
                                            fontSize: "18px",
                                            fontWeight: 700,
                                            color: "#6a6a6a",
                                        }}
                                    >
                                        Email
                                    </label>
                                    <input
                                        value={email}
                                        disabled
                                        className="mt-1 w-full bg-transparent outline-none"
                                        style={{
                                            fontFamily: "'Nunito', system-ui, sans-serif",
                                            fontSize: "16px",
                                            fontWeight: 500,
                                            color: "#979797",
                                        }}
                                    />
                                    <div className="mt-2" style={{ height: 1, width: "100%", background: "#979797" }} />
                                </div>

                                <div className="mt-4">
                                    <label
                                        style={{
                                            fontFamily: "'Nunito', system-ui, sans-serif",
                                            fontSize: "18px",
                                            fontWeight: 700,
                                            color: "#6a6a6a",
                                        }}
                                    >
                                        Password
                                    </label>
                                    <div className="relative mt-1">
                                        <input
                                            value={editPassword}
                                            onChange={(e) => setEditPassword(e.target.value)}
                                            disabled={saving}
                                            type={showPassword ? "text" : "password"}
                                            className="w-full bg-transparent pr-10 outline-none"
                                            style={{
                                                fontFamily: "'Nunito', system-ui, sans-serif",
                                                fontSize: "16px",
                                                fontWeight: 500,
                                                color: "#979797",
                                                letterSpacing: showPassword ? "0px" : "2px",
                                            }}
                                        />
                                        {editPassword.length > 0 && (
                                            <button
                                                type="button"
                                                disabled={saving}
                                                onClick={() => setShowPassword((v) => !v)}
                                                className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-[#979797] disabled:opacity-60"
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                            >
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        )}
                                    </div>
                                    <div className="mt-2" style={{ height: 1, width: "100%", background: "#979797" }} />
                                    {passwordsMismatch && (
                                        <p
                                            className="mt-2 text-sm"
                                            role="alert"
                                            style={{
                                                fontFamily: "'Nunito', system-ui, sans-serif",
                                                color: "#ED1C24",
                                                fontWeight: 700,
                                                margin: 0,
                                            }}
                                        >
                                            Passwords do not match.
                                        </p>
                                    )}
                                </div>

                                <div className="mt-4">
                                    <label
                                        style={{
                                            fontFamily: "'Nunito', system-ui, sans-serif",
                                            fontSize: "18px",
                                            fontWeight: 700,
                                            color: "#6a6a6a",
                                        }}
                                    >
                                        Confirm Password
                                    </label>
                                    <div className="relative mt-1">
                                        <input
                                            value={editConfirmPassword}
                                            onChange={(e) => setEditConfirmPassword(e.target.value)}
                                            disabled={saving}
                                            type={showConfirmPassword ? "text" : "password"}
                                            className="w-full bg-transparent pr-10 outline-none"
                                            style={{
                                                fontFamily: "'Nunito', system-ui, sans-serif",
                                                fontSize: "16px",
                                                fontWeight: 500,
                                                color: "#979797",
                                                letterSpacing: showConfirmPassword ? "0px" : "2px",
                                            }}
                                        />
                                        {editConfirmPassword.length > 0 && (
                                            <button
                                                type="button"
                                                disabled={saving}
                                                onClick={() => setShowConfirmPassword((v) => !v)}
                                                className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-[#979797] disabled:opacity-60"
                                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                            >
                                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        )}
                                    </div>
                                    <div className="mt-2" style={{ height: 1, width: "100%", background: "#979797" }} />
                                </div>

                                <div className="mt-8 flex w-full justify-center pb-6">
                                    <PinkButton
                                        text={saving ? "Saving…" : "Save Changes"}
                                        disabled={!canSaveProfileChanges}
                                        onClick={() => void handleSaveChanges()}
                                        className="w-48 h-11 px-0 py-0 text-[17px] font-bold shadow-[0px_3px_8px_rgba(76,76,76,0.25)] hover:scale-[1.02] active:scale-[0.98]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* --------------- edit profile pop up fin --------------------- */}

                <Navbar />
            </div>
        </>
    )
}
