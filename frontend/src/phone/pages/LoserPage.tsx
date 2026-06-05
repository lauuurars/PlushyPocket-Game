import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { PinkButton } from "../../components/PinkButton";
import LoserBg from "../../assets/loser/LoserBg.svg";
import SadMisu from "../../assets/loser/SadMisu.svg";
import Corazon from "../../assets/welcome/Corazon.svg";
import Estrella3 from "../../assets/welcome/Estrella3.svg";
import Rayo from "../../assets/welcome/Rayo.svg";

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

const LoserPage: React.FC = () => {
    const navigate = useNavigate();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setReady(true), 100);
        return () => clearTimeout(t);
    }, []);

    const handlePlayAgain = () => {
        // TO-DO: Add logic to reconnect to the same room
        console.log("Play Again pressed - reconnect to same room");
    };

    const handleExitParty = () => {
        // TO-DO: Add logic to leave the room
        navigate("/home-phone");
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
                @keyframes floatSad {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
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
                .animate-float-sad {
                    animation: floatSad 3s ease-in-out infinite;
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
                {/* Estrella3 */}
                <FloatingElement src={Estrella3} alt="" size={40}
                    style={{ top: "38%", left: "10%" }}
                    animationClass={`float-b anim-scatter ${ready ? "" : "opacity-0"}`}
                    delay="0.4s" />
                
                {/* Rayo */}
                <FloatingElement src={Rayo} alt="" size={45}
                    style={{ top: "63%", left: "10%" }}
                    animationClass={`float-a anim-scatter ${ready ? "" : "opacity-0"}`}
                    delay="0.2s" />
                
                {/* Corazon */}
                <FloatingElement src={Corazon} alt="" size={35}
                    style={{ top: "63%", right: "12%" }}
                    animationClass={`pulse-s anim-scatter ${ready ? "" : "opacity-0"}`}
                    delay="0.6s" />
            </div>

            <div className="relative z-10 w-full h-full flex flex-col items-center pt-23 px-6">
                {/* Main Content */}
                <div className="flex flex-col items-center animate-fade-in">
                    <h1
                        className="text-[#ED1C24] text-[40px] font-extrabold leading-9.25 tracking-[-1px] text-center mb-3"
                        style={{ fontFamily: '"Baloo 2", sans-serif' }}
                    >
                        Oops! Better luck next time!
                    </h1>
                    <p
                        className="text-[#ED1C24] leading-5 text-center mb-10"
                        style={{ fontFamily: '"Nunito", sans-serif' }}
                    >
                        Don't worry, your plushy squad still thinks you're awesome.
                    </p>

                    {/* Buttons */}
                    <div className="w-full max-w-57.5 flex flex-col mt-30 gap-4">
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

                {/* Character - Anchored to bottom */}
                <div className="absolute bottom-0 left-01/2 w-[80%] left-1/2 -translate-x-1/2">
                    <img
                        src={SadMisu}
                        alt="Sad Misu"
                        className="w-full"
                    />
                </div>
            </div>
        </div>
    );
};

export default LoserPage;
