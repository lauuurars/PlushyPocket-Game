import { useEffect, useState } from "react";
import Background from "../../assets/welcome/Background.svg";
import Rayo from "../../assets/error404/rayo.svg";
import Brillito from "../../assets/error404/brillito.svg";
import Flo from "../../assets/error404/flo.svg";
import Corazon from "../../assets/error404/corazon.svg";
import SadCharacters from "../../assets/error404/sadCharacters.svg";

// --- Floating Element Component ---
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

export default function Error404() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setReady(true), 100);
        return () => clearTimeout(t);
    }, []);

    return (
        <>
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
                @keyframes characters-enter {
                    0%   { transform: translateY(30%); }
                    60%  { transform: translateY(-10px); }
                    80%  { transform: translateY(4px); }
                    100% { transform: translateY(0px); }
                }
                @keyframes logo-enter {
                    0%   { transform: translateY(-30px) scale(0.9); opacity: 0; }
                    70%  { transform: translateY(6px)  scale(1.03); opacity: 1; }
                    100% { transform: translateY(0px)  scale(1); opacity: 1; }
                }
                @keyframes fade-up {
                    0%   { transform: translateY(20px); opacity: 0; }
                    100% { transform: translateY(0px);  opacity: 1; }
                }
                @keyframes scatter-in {
                    0%   { transform: scale(0) rotate(-30deg); opacity: 0; }
                    70%  { transform: scale(1.2) rotate(5deg);  opacity: 1; }
                    100% { transform: scale(1)   rotate(0deg);  opacity: 1; }
                }

                .float-a  { animation: floatY      3.8s ease-in-out infinite; }
                .float-b  { animation: floatY2     4.4s ease-in-out infinite; }
                .spin-s   { animation: spin-slow   8s   linear       infinite; }
                .pulse-s  { animation: pulse-soft  2.6s ease-in-out  infinite; }

                .anim-logo       { animation: logo-enter       0.7s cubic-bezier(.34,1.56,.64,1) both; }
                .anim-chars      { animation: characters-enter 0.9s cubic-bezier(.34,1.56,.64,1) both; }
                .anim-fade-up    { animation: fade-up          0.6s ease both; }
                .anim-scatter    { animation: scatter-in       0.5s cubic-bezier(.34,1.56,.64,1) both; }
            `}</style>

            <div
                className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-between"
                style={{ minHeight: "100svh" }}
            >
                {/* Background */}
                <img
                    src={Background}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ zIndex: 0 }}
                />

                {/* Depth styling */}
                <div
                    aria-hidden
                    className="absolute inset-0 pointer-events-none"
                    style={{ zIndex: 1 }}
                >
                    <div style={{
                        position: "absolute", top: "10%", left: "15%",
                        width: 320, height: 320, borderRadius: "50%",
                        background: "rgba(255,255,255,0.06)", filter: "blur(40px)"
                    }} />
                    <div style={{
                        position: "absolute", bottom: "20%", right: "10%",
                        width: 260, height: 260, borderRadius: "50%",
                        background: "rgba(255,255,255,0.05)", filter: "blur(50px)"
                    }} />
                </div>

                {/* Floating Decorative Elements */}
                <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
                    {/* Rayo */}
                    <FloatingElement src={Rayo} alt="" size={50}
                        style={{ top: "40%", left: "15%" }}
                        animationClass={`float-a anim-scatter ${ready ? "" : "opacity-0"}`}
                        delay="0.2s" />

                    {/* Brillito */}
                    <FloatingElement src={Brillito} alt="" size={40}
                        style={{ top: "15%", left: "25%" }}
                        animationClass={`spin-s anim-scatter ${ready ? "" : "opacity-0"}`}
                        delay="0.5s" />

                    {/* Flor */}
                    <FloatingElement src={Flo} alt="" size={45}
                        style={{ top: "18%", right: "22%" }}
                        animationClass={`float-b anim-scatter ${ready ? "" : "opacity-0"}`}
                        delay="0.35s" />

                    {/* Corazón */}
                    <FloatingElement src={Corazon} alt="" size={40}
                        style={{ top: "48%", right: "18%" }}
                        animationClass={`pulse-s anim-scatter ${ready ? "" : "opacity-0"}`}
                        delay="0.6s" />
                </div>

                {/* Content */}
                <div
                    className="relative flex flex-col items-center justify-center flex-1 w-full px-4 text-center"
                    style={{ zIndex: 3, paddingTop: "clamp(24px, 10vh, 80px)" }}
                >
                    <h1
                        className={`anim-logo ${ready ? "" : "opacity-0"}`}
                        style={{
                            animationDelay: "0.05s",
                            color: "white",
                            fontSize: "clamp(48px, 8vw, 84px)",
                            fontFamily: "'Baloo 2', system-ui, cursive",
                            fontWeight: 800,
                            margin: 0,
                            lineHeight: 1.1,
                            letterSpacing: "0.02em"
                        }}
                    >
                        Uh Oh!
                    </h1>

                    <p
                        className={`anim-fade-up ${ready ? "" : "opacity-0"} max-w-xl mx-auto`}
                        style={{
                            fontWeight: 400,
                            color: "rgba(255,255,255,0.95)",
                            fontSize: "clamp(16px, 2vw, 25px)",
                            marginTop: "20px",
                            marginBottom: "clamp(20px, 4vh, 36px)",
                            animationDelay: "0.4s",
                            fontFamily: "'Nunito', system-ui, sans-serif",
                            lineHeight: 1.5
                        }}
                    >
                        Oh no, something went wrong, but don't worry-you can just reload the page and enjoy Plushy Pocket again
                    </p>
                </div>

                {/* Characters */}
                <div
                    className="relative w-full flex items-end justify-center"
                    style={{ zIndex: 3, marginTop: "auto" }}
                >
                    <img
                        src={SadCharacters}
                        alt="Sad Plushy Pocket characters"
                        className={`anim-chars ${ready ? "" : "opacity-0"}`}
                        style={{
                            width: "clamp(280px, 70vw, 800px)",
                            display: "block",
                            filter: "drop-shadow(0 -8px 30px rgba(0,0,0,0.15))",
                            animationDelay: "0.1s",
                            marginTop: "80px",
                        }}
                    />
                </div>
            </div>
        </>
    );
}
