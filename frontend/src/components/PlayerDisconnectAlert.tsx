interface PlayerDisconnectAlertProps {
    isOpen: boolean;
}

export default function PlayerDisconnectAlert({ isOpen }: PlayerDisconnectAlertProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-xs p-6 animate-fade-in">
            <style>{`
                @keyframes scaleIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-scale-in {
                    animation: scaleIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
                .animate-fade-in {
                    animation: fadeIn 0.2s ease-out forwards;
                }
            `}</style>

            <div 
                className="bg-[#FAFAFA] rounded-[40px] w-full max-w-[500px] p-12 flex flex-col items-center shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border border-white/20 animate-scale-in"
                style={{ fontFamily: "'Nunito', sans-serif" }}
            >
                {/* Warning Icon with a pulse glow */}
                <div className="mb-8 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-[#ED1C24]/10 rounded-full blur-xl scale-125 animate-pulse" />
                    <svg className="w-28 h-28 text-[#ED1C24] relative z-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="5" />
                        {/* Triangulo de Advertencia */}
                        <path d="M50 20 L18 70 L82 70 Z" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" fill="#ED1C24" fillOpacity="0.08" />
                        {/* Signo de exclamación */}
                        <rect x="47.5" y="38" width="5" height="18" rx="2.5" fill="currentColor" />
                        <circle cx="50" cy="62" r="3.5" fill="currentColor" />
                    </svg>
                </div>

                {/* Title */}
                <h2 
                    className="text-[#D51017] text-[36px] font-black leading-tight tracking-tight text-center mb-4"
                    style={{ fontFamily: "'Baloo 2', cursive" }}
                >
                    Player Disconnected!
                </h2>

                {/* Description */}
                <p className="text-[#583921] text-[18px] font-bold text-center leading-relaxed max-w-[380px]">
                    To play Plushy Pocket, 2 players are required. Redirection to home in progress...
                </p>

                {/* Redirection indicator / spinner */}
                <div className="mt-8 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#ED1C24] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 rounded-full bg-[#ED1C24] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 rounded-full bg-[#ED1C24] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        </div>
    );
}
