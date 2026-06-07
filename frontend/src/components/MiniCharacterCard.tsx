import { Lock } from "lucide-react";

type MiniCharacterCardProps = {
    imageSrc: string | null;
    bgColor: string;
    onClick?: () => void;
    isLocked?: boolean;
};

export default function MiniCharacterCard({ imageSrc, bgColor, onClick, isLocked = false }: MiniCharacterCardProps) {
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
                border: "none",
                cursor: "pointer",
                padding: "8px",
                position: "relative",
                opacity: isLocked ? 0.8 : 1,
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
        </button>
    );
}
