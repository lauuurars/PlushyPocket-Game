import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import MiniCharacterCard from "../../components/MiniCharacterCard";
import Navbar from "../../components/mobile/Navbar";
import UnlockCharacterPopup from "../../components/UnlockCharacterPopup";

interface Character {
    id: string;
    character_name: string; // Updated from name
    collection_name?: string;
    img_url: string;
    bg_color?: string;
}

const CHARACTER_COLORS = ["#76D6FF", "#FF7BE2", "#FFE23F", "#925FDF"];

const getImageUrl = (char: any) => {



    const path = char.img_url || char.url || char.image || char.image_url;

    if (!path) return null;
    if (path.startsWith("http")) return path;

    const projectId = "rnuuksshouctvcpebsbg";
    const bucket = "characters";
    return `https://${projectId}.supabase.co/storage/v1/object/public/${bucket}/${path}`;
};

const getRandomColor = (id: string) => {
    const charSum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return CHARACTER_COLORS[charSum % CHARACTER_COLORS.length];
};

export default function BlockedCharacters() {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUnlockPopupOpen, setIsUnlockPopupOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchCharacters() {
            setLoading(true);
            const userId = localStorage.getItem("plushyPocket_dbUserId");

            // Fetch all characters
            const { data: allCharacters, error: charError } = await supabase
                .from("characters")
                .select("*");

            if (charError) {
                console.error("Error fetching blocked characters:", charError);
                setLoading(false);
                return;
            }

            // Fetch user's unlocked characters
            let unlockedCharIds = new Set<string>();
            if (userId) {
                const { data: userChars, error: userCharError } = await supabase
                    .from("user_characters")
                    .select("character_id")
                    .eq("user_id", userId);

                if (userCharError) {
                    console.error("Error fetching user characters:", userCharError);
                } else if (userChars) {
                    userChars.forEach(uc => unlockedCharIds.add(uc.character_id));
                }
            }

            // Filter logic: NOT default unlocked AND NOT in user_characters
            const blockedCharacters = (allCharacters || []).filter(char => {
                const isDefaultUnlocked = ['mochi', 'misu', 'yuki'].includes(char.character_name?.toLowerCase());
                return !isDefaultUnlocked && !unlockedCharIds.has(char.id);
            });

            setCharacters(blockedCharacters);
            setLoading(false);
        }

        fetchCharacters();
    }, []);

    return (
        <div className="relative min-h-svh w-screen overflow-x-hidden bg-[#ED1C24] md:hidden">

            <div
                style={{
                    position: "absolute",
                    top: "-40px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "140%",
                    height: "250px",
                    borderRadius: "50%",
                    background: "#FAFAFA",
                    zIndex: 0,
                }}
            />

            <div
                style={{
                    position: "relative",
                    zIndex: 10,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    paddingTop: "80px",
                    paddingLeft: "20px",
                    paddingRight: "20px",
                    paddingBottom: "120px",
                }}
            >

                <div style={{ height: "90px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <h1
                        style={{
                            fontFamily: "'Baloo 2', system-ui, sans-serif",
                            fontSize: "40px",
                            fontWeight: 800,
                            color: "#ED1C24",
                            margin: 0,
                            lineHeight: 1.1,
                            textAlign: "center"
                        }}
                    >
                        Characters to <br /> unlock
                    </h1>
                </div>


                <div style={{ height: "30px" }} />


                <div
                    style={{
                        display: "flex",
                        gap: "40px",
                        marginBottom: "28px",
                        marginTop: "60px",
                        borderRadius: "999px",
                        padding: "5px",
                        width: "100%",
                        maxWidth: "400px",
                    }}
                >
                    <button
                        onClick={() => navigate("/characters")}
                        style={{
                            flex: 1,
                            padding: "10px 0",
                            borderRadius: "999px",
                            fontSize: "16px",
                            fontWeight: 700,
                            background: "#979797",
                            color: "rgba(255,255,255,0.7)",
                            border: "none",
                            cursor: "pointer",
                            fontFamily: "'Baloo 2', system-ui, sans-serif",
                        }}
                    >
                        Unlocked
                    </button>
                    <button
                        onClick={() => navigate("/blocked-characters")}
                        style={{
                            flex: 1,
                            padding: "10px 0",
                            borderRadius: "999px",
                            fontSize: "16px",
                            fontWeight: 700,
                            background: "#FF7BE2",
                            color: "#fff",
                            border: "none",
                            cursor: "pointer",
                            fontFamily: "'Baloo 2', system-ui, sans-serif",
                        }}
                    >
                        Blocked
                    </button>
                </div>

                {/* Grid de personajes bloqueados */}
                {loading ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0" }}>
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" />
                        <p style={{ marginTop: "16px", color: "white", fontWeight: 700 }}>Checking locked characters...</p>
                    </div>
                ) : characters.length === 0 ? (
                    <div style={{ padding: "60px 20px", textAlign: "center", color: "white" }}>
                        <h2 style={{ fontSize: "24px", fontWeight: 800 }}>Amazing!</h2>
                        <p>You have all characters unlocked!</p>
                    </div>
                ) : (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                            gap: "15px",
                            justifyContent: "center",
                            width: "100%",
                            maxWidth: "400px",
                        }}
                    >
                        {characters.map((char) => (
                            <MiniCharacterCard
                                key={char.id}
                                imageSrc={getImageUrl(char)}
                                bgColor="#343434"
                                onClick={() => setIsUnlockPopupOpen(true)}
                                isLocked={true}
                            />
                        ))}
                    </div>
                )}
            </div>

            <UnlockCharacterPopup
                isOpen={isUnlockPopupOpen}
                onClose={() => setIsUnlockPopupOpen(false)}
            />

            <Navbar />
        </div>
    );
}
