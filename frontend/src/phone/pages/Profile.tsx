import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Background from "../../assets/BgProfile.svg?url";
import MisuIcon from "../../assets/profile-pic/Misu-Icon.svg";
import MochiIcon from "../../assets/profile-pic/Mochi-Icon.svg";
import YukiIcon from "../../assets/profile-pic/Yuki-Icon.svg";
import Navbar from "../../components/mobile/Navbar";
import { PinkButton } from "../../components/PinkButton";
import { fetchAuthMe } from "../../lib/api";
import { supabase } from "../../lib/supabaseClient";

export default function Profile() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [username, setUsername] = useState("Player");
    const [email, setEmail] = useState<string>("");
    const [age, setAge] = useState<number | null>(null);
    const [characterSelected, setCharacterSelected] = useState<string | null>(null);

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

    async function handleLogout() {
        try {
            await supabase.auth.signOut();
        } finally {
            navigate("/login", { replace: true });
        }
    }

    return (
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
                                fontSize: "clamp(2.4rem, 9vw, 3.2rem)",
                                color: "#D51017",
                                lineHeight: 1.1,
                                margin: 0,
                                textShadow: "0 3px 16px rgba(0,0,0,0.12)",
                            }}
                        >
                            My Profile
                        </h1>

                        <div className="mt-9 flex flex-col items-center">
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

            <Navbar />
        </div>
    )
}
