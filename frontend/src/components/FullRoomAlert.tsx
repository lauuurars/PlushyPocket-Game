
interface FullRoomAlertProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function FullRoomAlert({ isOpen, onClose }: FullRoomAlertProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-xs p-6">
            <style>{`
                @keyframes scaleIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-scale-in {
                    animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
            `}</style>
            
            <div 
                className="bg-[#FAFAFA] rounded-[30px] w-full max-w-70 p-8 flex flex-col items-center shadow-2xl border border-white/20 animate-scale-in"
                style={{ fontFamily: "'Nunito', sans-serif" }}
            >
                {/* Title */}
                <h2 
                    className="text-[#D51017] text-[24px] font-black leading-tight tracking-tight text-center mb-6"
                    style={{ fontFamily: "'Baloo 2', cursive" }}
                >
                    Oops! Full Room
                </h2>

                {/* Warning Icon inside circle */}
                <div className="mb-6 flex items-center justify-center">
                    <svg className="w-21 h-21 text-[#ED1C24]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="5" />
                        <path d="M50 25 L25 68 L75 68 Z" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
                        <rect x="47.5" y="38" width="5" height="15" rx="2.5" fill="currentColor" />
                        <circle cx="50" cy="60" r="3.5" fill="currentColor" />
                    </svg>
                </div>

                {/* Description */}
                <p className="text-[#583921] text-[13px] font-bold text-center leading-relaxed mb-8 w-45 max-w-full">
                    This room is already full, try later!
                </p>

                {/* Accept Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="bg-[#ED1C24] text-[#FAFAFA] font-black text-[13.5px] px-8 py-2.5 rounded-[20px] shadow-[0px_3px_4px_rgba(76,76,76,0.25)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                    Accept
                </button>
            </div>
        </div>
    );
}
