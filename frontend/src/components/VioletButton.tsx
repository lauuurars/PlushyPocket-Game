type VioletButtonProps = {
    text: string;
    onClick?: () => void;
    icon?: React.ReactNode; 
};

export const VioletButton: React.FC<VioletButtonProps> = ({
    text,
    onClick,
    icon,
}) => {
    return (
        <button
            onClick={onClick}
            className="
        flex items-center justify-center gap-1
        px-10 py-3 cursor-pointer
        rounded-full 
        text-white text-2xl md:text-[20px] font-bold
        bg-purple-500 hover:bg-[#8e47eb]
        hover:scale-105 active:scale-95
        transition-all duration-200
        shadow-lg
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