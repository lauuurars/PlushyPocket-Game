import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Music4, Volume2, VolumeX } from "lucide-react";

import Background from "../../assets/welcome/Background.svg";
import Logo from "../../assets/welcome/Plushy-Logo.png";
import Characters from "../../assets/welcome/Characters.svg";
import Rayo from "../../assets/welcome/Rayo.svg";
import Estrella1 from "../../assets/welcome/Estrella1.svg";
import Estrella2 from "../../assets/welcome/Estrella2.svg";
import Estrella3 from "../../assets/welcome/Estrella3.svg";
import Flor from "../../assets/welcome/Flor.svg";
import Corona from "../../assets/welcome/Corona.svg";
import Corazon from "../../assets/welcome/Corazon.svg";
import BackgroundMusic from "../../assets/welcome/Pocket Music.mp3"
import { VioletButton } from "../../components/VioletButton";

// --- elemento decorativo flotante -------------------
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

export default function Welcome() {
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const [isMuted, setIsMuted] = useState(false);
    const [startedMusic, setStartedMusic] = useState(false);
    const [ready, setReady] = useState(false);
    const navigate = useNavigate();

    // delay para animación

    useEffect(() => {
        const t = setTimeout(() => setReady(true), 100);
        return () => clearTimeout(t);
    }, []);

    //  background music :D
    useEffect(() => {
        const audio = new Audio(BackgroundMusic);
        audio.loop = true;
        audio.volume = 0.4;
        audioRef.current = audio;

        return () => {
            audio.pause();
            audio.src = "";
        }
    }, [])

    const toggleMute = () => {
        const audioMute = audioRef.current
        if (!audioMute) return;

        if (!startedMusic) {
            audioMute.play().catch(console.error)
            setStartedMusic(true);
            setIsMuted(false);
        } else {
            audioMute.muted = !audioMute.muted
            setIsMuted(!isMuted)
        }
    };

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
                {/* Fondo */}
                <img
                    src={Background}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ zIndex: 0 }}
                />

                {/* profundidad :p */}
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

                {/* botón mute */}
                <button
                    onClick={toggleMute}
                    style={{
                        position: "absolute",
                        top: "20px",
                        right: "40px",
                        zIndex: 10,
                        background: "rgba(255,255,255,0.2)",
                        border: "2px solid rgba(255,255,255,0.4)",
                        borderRadius: "50%",
                        width: "42px",
                        height: "42px",
                        cursor: "pointer",
                        fontSize: "1.2rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backdropFilter: "blur(6px)",
                    }}
                >
                    {!startedMusic ? (
                        <Music4 className="h-5 w-5 text-white" />
                    ) : isMuted ? (
                        <VolumeX className="h-5 w-5 text-white" />
                    ) : (
                        <Volume2 className="h-5 w-5 text-white" />
                    )}
                </button>


                {/* ── elementos decorativossss ── */}
                <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>

                    {/* rayo moradito */}
                    <FloatingElement src={Rayo} alt="" size={60}
                        style={{ top: "7%", left: "20%" }}
                        animationClass={`float-a anim-scatter ${ready ? "" : "opacity-0"}`}
                        delay="0.2s" />

                    {/* estrella azul*/}
                    <FloatingElement src={Estrella2} alt="" size={34}
                        style={{ top: "33%", left: "20%" }}
                        animationClass={`float-b anim-scatter ${ready ? "" : "opacity-0"}`}
                        delay="0.35s" />

                    {/* coronaaa */}
                    <FloatingElement src={Corona} alt="" size={48}
                        style={{ top: "10%", right: "23%" }}
                        animationClass={`float-a anim-scatter ${ready ? "" : "opacity-0"}`}
                        delay="0.25s" />

                    {/* estrella morada */}
                    <FloatingElement src={Estrella1} alt="" size={36}
                        style={{ top: "35%", right: "18%" }}
                        animationClass={`spin-s anim-scatter ${ready ? "" : "opacity-0"}`}
                        delay="0.5s" />

                    {/* estrella amarilla */}
                    <FloatingElement src={Estrella3} alt="" size={50}
                        style={{ top: "55%", left: "15%" }}
                        animationClass={`float-b anim-scatter ${ready ? "" : "opacity-0"}`}
                        delay="0.4s" />

                    {/* flor rosada */}
                    <FloatingElement src={Flor} alt="" size={38}
                        style={{ bottom: "40%", right: "25%" }}
                        animationClass={`float-a anim-scatter ${ready ? "" : "opacity-0"}`}
                        delay="0.55s" />

                    {/* corazón */}
                    <FloatingElement src={Corazon} alt="" size={35}
                        style={{ top: "55%", left: "32%" }}
                        animationClass={`pulse-s anim-scatter ${ready ? "" : "opacity-0"}`}
                        delay="0.6s" />
                </div>

                <div
                    className="relative flex flex-col items-center justify-center flex-1 w-full"
                    style={{ zIndex: 3, paddingTop: "clamp(24px, 5vh, 60px)" }}
                >
                    {/* Logo */}
                    <div
                        className={`anim-logo ${ready ? "" : "opacity-0"}`}
                        style={{ animationDelay: "0.05s" }}
                    >
                        <img
                            src={Logo}
                            alt="Plushy Pocket"
                            style={{
                                width: "clamp(260px, 45vw, 520px)",
                                filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.25))",
                            }}
                        />
                    </div>

                    {/* texto by miniso */}
                    <p
                        className={`anim-fade-up ${ready ? "" : "opacity-0"}`}
                        style={{
                            fontWeight: 700,
                            color: "rgba(255,255,255)",
                            fontSize: "20px",
                            marginTop: "10px",
                            marginBottom: "clamp(20px, 4vh, 36px)",
                            animationDelay: "0.4s",
                        }}
                    >
                        by MINISO
                    </p>

                    {/* Botón */}
                    <div
                        className={`anim-fade-up ${ready ? "" : "opacity-0"}`}
                        style={{ animationDelay: "0.55s" }}
                    >
                        <VioletButton
                            text="Let's Play"
                            onClick={() => navigate("/home")}
                            icon={<svg
                                width="28"
                                height="28"
                                viewBox="0 0 24 24"
                                fill="white"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M8 5v14l11-7z" />
                            </svg>} />
                    </div>
                </div>

                {/* personajess */}
                <div
                    className="relative w-full flex items-end justify-center"
                    style={{ zIndex: 3, marginTop: "auto" }}
                >
                    <img
                        src={Characters}
                        alt="Plushy Pocket characters"
                        className={`anim-chars ${ready ? "" : "opacity-0"}`}
                        style={{
                            width: "clamp(280px, 70vw, 700px)",
                            display: "block",
                            filter: "drop-shadow(0 -8px 30px rgba(0,0,0,0.15))",
                            animationDelay: "0.1s",
                        }}
                    />
                </div>
            </div>
        </>
    );
}
