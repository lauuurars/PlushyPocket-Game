import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import MiniCharacterCard from "../../components/MiniCharacterCard";
import Navbar from "../../components/mobile/Navbar";

interface Character {
    id: string;
    name: string;
    img_url: string;
    is_blocked: boolean;
    bg_color?: string;
}

const CHARACTER_COLORS = ["#76D6FF", "#FF7BE2", "#925FDF", "#FFE23F"];

const getImageUrl = (char: any) => {
    const path = char.img_url || char.url || char.image || char.image_url;
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const projectId = "rnuuksshouctvcpebsbg";
    const bucket = "characters";
    return `https://${projectId}.supabase.co/storage/v1/object/public/${bucket}/${path}`;
};

const getColorByIndex = (index: number) => {
    return CHARACTER_COLORS[index % CHARACTER_COLORS.length];
};

export default function Characters() {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchCharacters() {
            setLoading(true);
            const { data, error } = await supabase
                .from("characters")
                .select("*")
                .eq("is_blocked", false);

            if (error) {
                console.error("Error fetching characters:", error);
            } else {
                setCharacters(data || []);
            }
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
                        My characters
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
                            background: "#FF7BE2",
                            color: "#fff",
                            border: "none",
                            cursor: "pointer",
                            fontFamily: "'Baloo 2', system-ui, sans-serif",
                            boxShadow: "none",
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
                            background: "#979797",
                            color: "rgba(255,255,255,0.7)",
                            border: "none",
                            cursor: "pointer",
                            fontFamily: "'Baloo 2', system-ui, sans-serif",
                            boxShadow: "none",
                        }}
                    >
                        Blocked
                    </button>
                </div>

                {/* Grid de personajes */}
                {loading ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0" }}>
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" />
                        <p style={{ marginTop: "16px", color: "white", fontWeight: 700 }}>Loading characters...</p>
                    </div>
                ) : (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 95px)",
                            gap: "35px",
                            justifyContent: "center",
                            width: "100%",
                            maxWidth: "400px",
                        }}
                    >
                        {characters.map((char, index) => (
                            <MiniCharacterCard
                                key={char.id}
                                imageSrc={getImageUrl(char)}
                                bgColor={char.bg_color || getColorByIndex(index)}
                                onClick={() => console.log(`Clicked ${char.name}`)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Navbar />
        </div>
    );
}