type PinkButtonProps = {
    text: string;
    onClick?: () => void;
    icon?: React.ReactNode;
    disabled?: boolean;
};

export const PinkButton: React.FC<PinkButtonProps> = ({
    text,
    onClick,
    icon,
    disabled = false,
}) => {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className="
        flex items-center justify-center gap-1
        px-10 py-3 cursor-pointer
        rounded-full 
        text-white text-2xl md:text-[20px] font-bold
        bg-[#FF7BE2] hover:bg-[#FF7BE2]
        hover:scale-105 active:scale-95
        transition-all duration-200
        shadow-lg
        disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 disabled:active:scale-100
    "
        >
            <span>{text}</span>

            {icon && (
                <span className="flex items-center justify-center">
                    {icon}
                </span>
            )}
        </button>
    );
};