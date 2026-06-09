import { Lock } from "lucide-react";

type MiniCharacterCardProps = {
    imageSrc: string | null;
    bgColor: string;
    onClick?: () => void;
    isLocked?: boolean;
    isSelected?: boolean;
};

export default function MiniCharacterCard({ imageSrc, bgColor, onClick, isLocked = false, isSelected = false }: MiniCharacterCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                width: "100%",
                aspectRatio: "115 / 120",
                backgroundColor: bgColor,
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                border: isSelected ? "3px solid white" : "none",
                cursor: "pointer",
                padding: "8px",
                position: "relative",
                opacity: isLocked ? 0.8 : 1,
                boxShadow: isSelected ? "0 0 0 3px #ED1C24" : "none",
                transition: "box-shadow 0.2s, border 0.2s",
            }}
        >
            {imageSrc && (
                <img
                    src={imageSrc}
                    style={{
                        width: "85%",
                        height: "85%",
                        objectFit: "contain",
                        filter: isLocked ? "grayscale(100%)" : "none",
                    }}
                    alt="character"
                    draggable={false}
                />
            )}

            {isLocked && (
                <div style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: "rgba(0,0,0,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    <Lock size={32} color="white" />
                </div>
            )}

            {isSelected && (
                <div style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: "rgba(0,0,0,0.25)",
                    borderRadius: "17px",
                }} />
            )}
        </button>
    );
}
