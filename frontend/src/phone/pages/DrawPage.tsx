import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { PinkButton } from "../../components/PinkButton";
import LoserBg from "../../assets/loser/LoserBg.svg";
import Pinguino from "../../assets/draw/drawPinguin.svg";
import Corazon from "../../assets/welcome/Corazon.svg";
import Corona from "../../assets/welcome/Corona.svg";
import Rayo from "../../assets/welcome/Rayo.svg";
import { getRoomState, resetRoomState } from "../../lib/roomStore";

interface FloatingElementProps {
    src: string;
    alt: string;
    style: React.CSSProperties;
    animationClass: string;
    size: number;
    delay?: string;
}

function FloatingElement({ src, alt, style, animationClass, size, delay = "0s" }: FloatingElementProps) {
    return (
        <img
            src={src}
            alt={alt}
            width={size}
            height={size}
            className={animationClass}
            style={{ position: "absolute", animationDelay: delay, ...style }}
        />
    );
}

const DrawPage: React.FC = () => {
    const navigate = useNavigate();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setReady(true), 100);
        return () => clearTimeout(t);
    }, []);

    const handlePlayAgain = () => {
        const { roomId, minigameId, socket } = getRoomState();
        if (socket) {
            socket.emit("player__leave", { roomId });
            socket.disconnect();
        }
        resetRoomState();
        if (roomId) {
            navigate(`/joined-room?roomId=${encodeURIComponent(roomId)}${minigameId ? `&minigameId=${encodeURIComponent(minigameId)}` : ""}`, { replace: true });
        } else {
            navigate("/home-phone", { replace: true });
        }
    };

    const handleExitParty = () => {
        const { roomId, socket } = getRoomState();
        if (socket) {
            socket.emit("player__leave", { roomId });
            socket.disconnect();
        }
        resetRoomState();
        navigate("/home-phone", { replace: true });
    };

    return (
        <div className="relative w-full h-screen overflow-hidden font-sans">
            <style>{`
                @keyframes floatY {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50%       { transform: translateY(-12px) rotate(4deg); }
                }
                @keyframes floatY2 {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50%       { transform: translateY(-10px) rotate(-5deg); }
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
                @keyframes pulse-soft {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50%       { transform: scale(1.12); opacity: 0.85; }
                }
                @keyframes floatHappy {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                @keyframes scatter-in {
                    0%   { transform: scale(0) rotate(-30deg); opacity: 0; }
                    70%  { transform: scale(1.2) rotate(5deg);  opacity: 1; }
                    100% { transform: scale(1)   rotate(0deg);  opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .float-a  { animation: floatY      3.8s ease-in-out infinite; }
                .float-b  { animation: floatY2     4.4s ease-in-out infinite; }
                .spin-s   { animation: spin-slow   8s   linear       infinite; }
                .pulse-s  { animation: pulse-soft  2.6s ease-in-out  infinite; }
                .anim-scatter { animation: scatter-in 0.5s cubic-bezier(.34,1.56,.64,1) both; }
                .animate-float-happy {
                    animation: floatHappy 3s ease-in-out infinite;
                }
                .animate-fade-in {
                    animation: fadeIn 0.8s ease-out forwards;
                }
            `}</style>

            {/* Background */}
            <img
                src={LoserBg}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Decorative elements */}
            <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
                {/* Corona */}
                <FloatingElement src={Corona} alt="" size={48}
                    style={{ top: "34%", left: "10%" }}
                    animationClass={`float-a anim-scatter ${ready ? "" : "opacity-0"}`}
                    delay="0.25s" />

                {/* Rayo */}
                <FloatingElement src={Rayo} alt="" size={45}
                    style={{ top: "63%", left: "10%" }}
                    animationClass={`float-b anim-scatter ${ready ? "" : "opacity-0"}`}
                    delay="0.35s" />

                {/* Corazon */}
                <FloatingElement src={Corazon} alt="" size={35}
                    style={{ top: "63%", right: "12%" }}
                    animationClass={`pulse-s anim-scatter ${ready ? "" : "opacity-0"}`}
                    delay="0.6s" />
            </div>

            <div className="relative z-10 w-full h-screen flex flex-col items-center justify-between px-6 pt-18 pb-0">
                {/* Main Content */}
                <div className="flex flex-col items-center text-center animate-fade-in">
                    <h1
                        className="text-[#ED1C24] text-[40px] font-extrabold leading-9.25 tracking-[-1px] text-center mb-3"
                        style={{ fontFamily: '"Baloo 2", sans-serif' }}
                    >
                        Wow, It's<br/>a Tie!
                    </h1>
                    <p
                        className="text-[#ED1C24] leading-5 text-center"
                        style={{ fontFamily: '"Nunito", sans-serif' }}
                    >
                        Your plushy squad can't <br /> pick a favorite!
                    </p>
                </div>

                {/* Buttons Container - Centered vertically in the remaining space */}
                <div className="flex-1 flex flex-col justify-center items-center w-full z-20">
                    <div className="w-full max-w-70 flex flex-col gap-4 animate-fade-in">
                        <PinkButton
                            text="Play Again"
                            onClick={handlePlayAgain}
                            className="w-full"
                        />
                        <button
                            type="button"
                            onClick={handleExitParty}
                            className={`
                                flex items-center justify-center gap-1
                                px-10 py-3 cursor-pointer
                                rounded-full 
                                text-[#FAFAFA] text-2xl md:text-[20px] font-bold
                                bg-[#979797]
                                hover:scale-105 active:scale-95
                                transition-all duration-200
                                shadow-lg
                            `}
                        >
                            Exit Party
                        </button>
                    </div>
                </div>

                {/* Character - Anchored to bottom in normal flow to keep layout responsive */}
                <div className="w-[75%] max-w-[280px] select-none pointer-events-none mt-auto z-10">
                    <img
                        src={Pinguino}
                        alt="Happy Penguin"
                        className="w-full h-auto block"
                    />
                </div>
            </div>
        </div>
    );
};

export default DrawPage;
