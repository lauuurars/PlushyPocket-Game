type CharacterCardProps = {
    name: string
    imageSrc: string
    bgColor: string
    onClick?: () => void
}

export default function CharacterCard({ name, imageSrc, bgColor, onClick }: CharacterCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex flex-col items-center gap-2"
        >
            <div
                className="flex h-35.75 w-34.75 items-center justify-center overflow-hidden rounded-[22px]"
                style={{ backgroundColor: bgColor }}
            >
                <img
                    src={imageSrc}
                    alt={name}
                    className="h-27.5 w-auto object-contain"
                    draggable={false}
                />
            </div>
            <p
                className="text-center text-[18px] font-medium leading-6 text-[#825D40]"
                style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
            >
                {name}
            </p>
        </button>
    )
}
