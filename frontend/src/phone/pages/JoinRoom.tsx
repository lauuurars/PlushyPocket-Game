import { useEffect, useState } from "react";
import JoinBg from "../../assets/join/JoinBg.svg?url";
import StarRoom from "../../assets/join/StarRoom.svg";
import RayoRosa from "../../assets/join/RayoRosa.svg";
import FlorAzul from "../../assets/join/FlorAzul.svg";
import Estrella4 from "../../assets/join/Estrella4.svg";
import Corazon from "../../assets/welcome/Corazon.svg";
import Pinguino from "../../assets/onboarding/pinguino.svg";

interface SalaJuegoProps {
    roomCode?: string; // mockeado por ahora :p
}

export default function JoinRoom({ roomCode = "5173" }: SalaJuegoProps) {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setReady(true), 80);
        return () => clearTimeout(t);
    }, []);

    return (
        <>
            <style>{`
        @keyframes floatY {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50%       { transform: translateY(-10px) rotate(6deg); }
        }
        @keyframes floatY2 {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50%       { transform: translateY(-9px) rotate(-5deg); }
        }
        @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
        }
        @keyframes pulse-soft {
            0%, 100% { transform: scale(1); opacity: 1; }
            50%       { transform: scale(1.12); opacity: 0.9; }
        }
        @keyframes fade-up {
            0%   { transform: translateY(18px); opacity: 0; }
            100% { transform: translateY(0px); opacity: 1; }
        }
        @keyframes scatter-in {
            0%   { transform: scale(0) rotate(-22deg); opacity: 0; }
            70%  { transform: scale(1.15) rotate(4deg);  opacity: 1; }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes star-pop {
            0%   { opacity: 0; transform: scale(0.7); }
            100% { opacity: 1; transform: scale(1); }
        }
        @keyframes penguin-rise {
            0%   { transform: translateY(30%); opacity: 0; }
            100% { transform: translateY(0%); opacity: 1; }
        }

        .float-a  { animation: floatY  3.8s ease-in-out infinite; }
        .float-b  { animation: floatY2 4.2s ease-in-out infinite; }
        .spin-s   { animation: spin-slow 8s linear infinite; }
        .pulse-s  { animation: pulse-soft 2.6s ease-in-out infinite; }

        .anim-title    { animation: fade-up 0.6s ease both; }
        .anim-fade-up  { animation: fade-up 0.6s ease both; }
        .anim-star     { animation: star-pop 0.55s ease both; }
        .anim-flor     { animation: scatter-in 0.5s cubic-bezier(.34,1.56,.64,1) both, float-b 4.2s ease-in-out 0.6s infinite; }
        .anim-estrella { animation: scatter-in 0.5s cubic-bezier(.34,1.56,.64,1) both, float-a 3.8s ease-in-out 0.6s infinite; }
        .anim-corazon  { animation: scatter-in 0.5s cubic-bezier(.34,1.56,.64,1) both, pulse-s 2.6s ease-in-out 0.6s infinite; }
        .anim-rayo     { animation: scatter-in 0.5s cubic-bezier(.34,1.56,.64,1) both, float-a 3.6s ease-in-out 0.6s infinite; }
        .anim-penguin  { animation: penguin-rise 0.55s ease both; }
    `}</style>

            {/* ----- wrapper ------- */}
            <div
                className="relative w-full overflow-hidden flex flex-col"
                style={{ minHeight: "100svh", maxWidth: "430px", margin: "0 auto" }}
            >
                {/* fondo */}
                <div
                    aria-hidden
                    style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: `url("${JoinBg}")`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        zIndex: 0,
                    }}
                />

                {/* ----------- elementos decorativos ------------ */}
                <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>

                    {/* flor azul  */}
                    <img
                        src={FlorAzul} alt="" width={45} height={45}
                        className={ready ? "anim-flor" : "opacity-0"}
                        style={{ position: "absolute", top: "34%", left: "6%", animationDelay: "0.45s" }}
                    />

                    {/* estrella violeta */}
                    <img
                        src={Estrella4} alt="" width={44} height={44}
                        className={ready ? "anim-estrella" : "opacity-0"}
                        style={{ position: "absolute", top: "36%", right: "7%", animationDelay: "0.5s" }}
                    />

                    {/* corazón */}
                    <img
                        src={Corazon} alt="" width={46} height={46}
                        className={ready ? "anim-corazon" : "opacity-0"}
                        style={{ position: "absolute", top: "60%", left: "8%", animationDelay: "0.55s" }}
                    />

                    {/* rayo rosado */}
                    <img
                        src={RayoRosa} alt="" width={42} height={42}
                        className={ready ? "anim-rayo" : "opacity-0"}
                        style={{ position: "absolute", top: "60%", right: "8%", animationDelay: "0.6s" }}
                    />
                </div>

                {/* ------------------- contenido ----------------- */}
                <div
                    className="relative flex flex-col w-full"
                    style={{ zIndex: 3, flex: 1 }}
                >
                    {/* ------- título ------------- */}
                    <div
                        className="flex w-full flex-col items-center text-center"
                        style={{ padding: "clamp(100px, 10vw, 60px) clamp(24px, 7vw, 40px) 0" }}
                    >
                        <h1
                            className={ready ? "anim-title" : "opacity-0"}
                            style={{
                                fontFamily: "'Baloo 2', cursive",
                                fontWeight: 800,
                                fontSize: "clamp(2.4rem, 9vw, 3.2rem)",
                                color: "white",
                                lineHeight: 1.1,
                                margin: 0,
                                textShadow: "0 3px 16px rgba(0,0,0,0.12)",
                                animationDelay: "0.05s",
                            }}
                        >
                            You have joined<br />the party room!
                        </h1>

                        <p
                            className={ready ? "anim-fade-up" : "opacity-0" }
                            style={{
                                fontFamily: "'Nunito', sans-serif",
                                fontWeight: 500,
                                fontSize: "clamp(1rem, 4vw, 1.2rem)",
                                color: "rgba(255,255,255,0.88)",
                                marginTop: "clamp(12px, 4vw, 20px)",
                                lineHeight: 1.5,
                                animationDelay: "0.3s",
                                textAlign: "center",
                            }}
                        >
                            Get ready for some fun<br />with Miniso
                        </p>
                    </div>

                    {/* -------------- star code ------------ */}
                    <div
                        className="flex items-center justify-center"
                        style={{ marginTop: "clamp(70px, 6vw, 36px)", position: "relative" }}
                    >
                        <div
                            className={ready ? "anim-star" : "opacity-0"}
                            style={{ position: "relative", animationDelay: "0.4s" }}
                        >
                            <img
                                src={StarRoom}
                                alt={`Sala ${roomCode}`}
                                style={{ width: "clamp(200px, 55vw, 260px)", display: "block" }}
                            />
                            {/* --------- codigo de sala ------------- */}
                            <span
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    paddingTop: "20px", 
                                    fontFamily: "'Baloo 2', cursive",
                                    fontWeight: 800,
                                    fontSize: "clamp(3.2rem, 9vw, 3rem)",
                                    color: "#583921",
                                    letterSpacing: "-0.02em",
                                }}
                            >
                                {roomCode}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ------------------- Pingüino ------------------- */}
                <div
                    className="relative w-full flex items-end justify-center"
                    style={{ zIndex: 3, overflow: "hidden", marginTop: "auto" }}
                >
                    <img
                        src={Pinguino}
                        alt="Plushy Pocket penguin"
                        className={ready ? "anim-penguin" : "opacity-0"}
                        style={{
                            width: "clamp(220px, 72vw, 320px)",
                            display: "block",
                            animationDelay: "0.55s",
                            animationFillMode: "both",
                            marginBottom: "-24px",
                        }}
                    />
                </div>
            </div>
        </>
    );
}
