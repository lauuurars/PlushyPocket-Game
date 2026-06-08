import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PinkButton } from "../../components/PinkButton";
import { Ticket } from "lucide-react";
import Corazon from "../../assets/welcome/Corazon.svg";
import Estrella3 from "../../assets/welcome/Estrella3.svg";
import Brillito from "../../assets/error404/brillito.svg";

interface FloatingElementProps {
    children: React.ReactNode;
    style: React.CSSProperties;
    animationClass: string;
    delay?: string;
}

function FloatingElement({ children, style, animationClass, delay = "0s" }: FloatingElementProps) {
    return (
        <div
            className={animationClass}
            style={{ position: "absolute", animationDelay: delay, ...style }}
        >
            {children}
        </div>
    );
}

const UnlockedReward: React.FC = () => {
    const navigate = useNavigate();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setReady(true), 100);
        return () => clearTimeout(t);
    }, []);

    const handleContinue = () => {
        navigate("/rewards");
    };

    return (
        <div className="relative w-full h-screen overflow-hidden font-sans bg-[#ED1C24]">
            <style>{`
                @keyframes floatY {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50%       { transform: translateY(-12px) rotate(4deg); }
                }
                @keyframes floatY2 {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50%       { transform: translateY(-10px) rotate(-5deg); }
                }
                @keyframes pulse-soft {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50%       { transform: scale(1.12); opacity: 0.85; }
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
                .pulse-s  { animation: pulse-soft  2.6s ease-in-out  infinite; }
                .anim-scatter { animation: scatter-in 0.5s cubic-bezier(.34,1.56,.64,1) both; }
            `}</style>

            {/* Background Swooshes */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 800" preserveAspectRatio="none" style={{ zIndex: 1 }}>
                <path d="M -50 500 C 100 200 300 700 500 400" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="60" strokeLinecap="round" />
                <path d="M -100 600 C 200 900 350 200 450 600" fill="none" stroke="rgba(200,0,0,0.2)" strokeWidth="80" strokeLinecap="round" />
                <path d="M 50 300 C 250 500 150 800 400 850" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="40" strokeLinecap="round" />
            </svg>

            {/* Decorative elements */}
            <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
                {/* Heart */}
                <FloatingElement
                    style={{ top: "60%", left: "8%" }}
                    animationClass={`float-a anim-scatter ${ready ? "" : "opacity-0"}`}
                    delay="0.2s"
                >
                    <img src={Corazon} alt="" className="w-[38px] h-[38px] transform -rotate-12" />
                </FloatingElement>

                {/* Star */}
                <FloatingElement
                    style={{ top: "42%", right: "12%" }}
                    animationClass={`float-b anim-scatter ${ready ? "" : "opacity-0"}`}
                    delay="0.4s"
                >
                    <img src={Estrella3} alt="" className="w-[48px] h-[48px] transform rotate-12" />
                </FloatingElement>

                {/* Sparkle (Brillito) */}
                <FloatingElement
                    style={{ top: "69%", right: "18%" }}
                    animationClass={`pulse-s anim-scatter ${ready ? "" : "opacity-0"}`}
                    delay="0.6s"
                >
                    <img src={Brillito} alt="" className="w-[42px] h-[42px] transform -rotate-12" />
                </FloatingElement>
            </div>

            <div className="relative z-10 w-full h-full flex flex-col items-center justify-between pt-[15vh] px-6 pb-[10vh]">
                {/* Main Content */}
                <div className="flex flex-col items-center w-full">
                    <h1
                        className="text-white text-[40px] font-extrabold leading-[1.1] tracking-tight text-center mb-6"
                        style={{ fontFamily: '"Baloo 2", sans-serif' }}
                    >
                        You've unlocked a<br />new item!
                    </h1>
                    <p
                        className="text-white leading-[1.4] text-[17px] text-center mb-10"
                        style={{ fontFamily: '"Nunito", sans-serif' }}
                    >
                        Here are your prizes for<br />winning on <span className="font-bold">Sanrio Island</span>
                    </p>

                    {/* Reward Card */}
                    <div className="bg-white rounded-[32px] w-[260px] p-7 flex flex-col items-center shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                        <h2 className="text-[#ED1C24] font-extrabold text-[22px] mb-5 tracking-tight" style={{ fontFamily: '"Nunito", sans-serif' }}>
                            50% Discount
                        </h2>
                        
                        <div className="w-[84px] h-[84px] rounded-full border-[3px] border-[#ED1C24] flex items-center justify-center mb-5">
                            <Ticket className="w-[42px] h-[42px] text-[#ED1C24] transform -rotate-45" strokeWidth={2.5} />
                        </div>
                        
                        <p className="text-[#333333] font-bold text-[14px] mb-1.5" style={{ fontFamily: '"Nunito", sans-serif' }}>
                            In house products
                        </p>
                        <p className="text-[#999999] text-[11px] font-semibold" style={{ fontFamily: '"Nunito", sans-serif' }}>
                            Valid Until: 7/04/26
                        </p>
                    </div>

                    <p className="text-white text-[15px] leading-[1.4] text-center mt-8 px-4 opacity-95 font-medium" style={{ fontFamily: '"Nunito", sans-serif' }}>
                        You can claim it at our<br />Miniso stores or on our<br />website
                    </p>
                </div>

                {/* Bottom Button */}
                <div className="w-full max-w-[280px] mt-auto">
                    <PinkButton
                        text="Continue"
                        onClick={handleContinue}
                        className="w-full !text-[24px] !py-3.5"
                    />
                </div>
            </div>
        </div>
    );
};

export default UnlockedReward;
