import { Lock } from "lucide-react";

type BlockedCharacterCardProps = {
    name: string;
    imageSrc: string | null;
    bgColor?: string;
    imageAlign?: "center" | "bottom";
    hideName?: boolean;
};

export default function BlockedCharacterCard({
    name,
    imageSrc,
    bgColor = "#333333",
    imageAlign = "center",
    hideName = true, // Por defecto oculto para que se vea como en la foto
}: BlockedCharacterCardProps) {
    return (
        <div className="flex flex-col items-center gap-2 opacity-80">
            <div
                className={`relative flex h-35.75 w-34.75 justify-center overflow-hidden rounded-[30px] ${imageAlign === "bottom" ? "items-end" : "items-center"
                    }`}
                style={{ backgroundColor: bgColor }}
            >
                {/* Character image with grayscale filter */}
                {imageSrc && (
                    <img
                        src={imageSrc}
                        alt={name}
                        className="h-28 w-auto object-contain grayscale filter"
                        draggable={false}
                    />
                )}

                {/* Dark overlay and Lock icon */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Lock className="h-10 w-10 text-white drop-shadow-md" />
                </div>
            </div>
            {!hideName && (
                <p
                    className="text-center text-[20px] font-bold leading-6 text-[#FAFAFA]/60"
                    style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
                >
                    {name}
                </p>
            )}
        </div>
    );
}
