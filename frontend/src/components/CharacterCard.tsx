type CharacterCardProps = {
    name: string
    imageSrc: string
    bgColor: string
    onClick?: () => void
    imageAlign?: "center" | "bottom"
}

export default function CharacterCard({ name, imageSrc, bgColor, onClick, imageAlign = "center" }: CharacterCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex flex-col items-center gap-2"
        >
            <div
                className={`flex h-35.75 w-34.75 justify-center overflow-hidden rounded-[22px] ${imageAlign === "bottom" ? "items-end" : "items-center"}`}
                style={{ backgroundColor: bgColor }}
            >
                <img
                    src={imageSrc}
                    alt={name}
                    className="h-30 w-auto object-contain"
                    draggable={false}
                />
            </div>
            <p
                className="text-center text-[20px] font-bold leading-6 text-[#825D40]"
                style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
            >
                {name}
            </p>
        </button>
    )
}
