import { useEffect, useState } from "react";
import BgParty from "../../assets/startGame/Bg Party.svg?url";
import Estrella3 from "../../assets/welcome/Estrella3.svg";
import Flor from "../../assets/welcome/Flor.svg";

interface PartyRoomProps {
    roomCode?: string;        // ej: "5173"
    islandName?: string;      // ej: "Sanrio Island"
}

export default function PartyRoom({
    roomCode = "5173",
    islandName = "Sanrio Island",
}: PartyRoomProps) {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setReady(true), 80);
        return () => clearTimeout(t);
    }, []);

    return (
        <>
            <style>{`
        @keyframes fade-down {
            0%   { opacity: 0; transform: translateY(-16px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-up-soft {
            0%   { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes title-pop {
            0%   { opacity: 0; transform: scale(0.88) translateY(10px); }
            65%  { opacity: 1; transform: scale(1.04) translateY(-4px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes floatA {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50%       { transform: translateY(-10px) rotate(8deg); }
        }
        @keyframes floatB {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50%       { transform: translateY(-8px) rotate(-6deg); }
        }
        @keyframes scatter {
            0%   { opacity: 0; transform: scale(0) rotate(-20deg); }
            70%  { opacity: 1; transform: scale(1.15) rotate(5deg); }
            100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }

        .anim-fade-down   { animation: fade-down    0.55s ease both; }
        .anim-title-pop   { animation: title-pop    0.7s cubic-bezier(.34,1.56,.64,1) both; }
        .anim-fade-up     { animation: fade-up-soft 0.6s ease both; }
        .anim-scatter-a   { animation: scatter      0.55s cubic-bezier(.34,1.56,.64,1) both, floatA 4s ease-in-out 0.6s infinite; }
        .anim-scatter-b   { animation: scatter      0.55s cubic-bezier(.34,1.56,.64,1) both, floatB 3.6s ease-in-out 0.6s infinite; }
    `}</style>

            {/* wrapper */}
            <div
                className="relative w-full h-screen overflow-hidden flex flex-col"
                style={{ minHeight: "100svh" }}
            >
                {/* ------------- fondo */}
                <div
                    aria-hidden
                    style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: `url("${BgParty}")`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        zIndex: 0,
                    }}
                />

                {/*  -------- elementos decorativoooss ------ */}
                <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>

                    {/* ------ estrella ----- */}
                    <img
                        src={Estrella3}
                        alt=""
                        width={70}
                        height={70}
                        className={ready ? "anim-scatter-a" : "opacity-0"}
                        style={{
                            position: "absolute",
                            top: "28%",
                            left: "12%",
                            animationDelay: "0.4s",
                        }}
                    />

                    {/* ----------- flor ---------- */}
                    <img
                        src={Flor}
                        alt=""
                        width={64}
                        height={64}
                        className={ready ? "anim-scatter-b" : "opacity-0"}
                        style={{
                            position: "absolute",
                            top: "8%",
                            right: "12%",
                            animationDelay: "0.5s",
                        }}
                    />
                </div>

                {/*  ------------- room label ------ */}
                <div
                    className="relative"
                    style={{ zIndex: 3, padding: "28px 36px 0" }}
                >
                    <p
                        className={ready ? "anim-fade-down" : "opacity-0"}
                        style={{
                            fontFamily: "'Nunito', sans-serif",
                            fontWeight: 800,
                            fontSize: "clamp(0.95rem, 1.8vw, 1.5rem)",
                            color: "white",
                            letterSpacing: "0.01em",
                            animationDelay: "0.05s",
                            margin: 0,
                        }}
                    >
                        Party Room - {roomCode}
                    </p>
                </div>

                <div
                    className="relative flex flex-col items-center justify-center flex-1"
                    style={{ zIndex: 3, marginTop: "-370px" }}
                >
                    {/* ------------- título ------------ */}
                    <h1
                        className={ready ? "anim-title-pop" : "opacity-0"}
                        style={{
                            fontFamily: "'Baloo 2', cursive",
                            fontWeight: 800,
                            fontSize: "clamp(2.8rem, 7vw, 6rem)",
                            color: "white",
                            textAlign: "center",
                            lineHeight: 1.05,
                            margin: 0,
                            animationDelay: "0.15s",
                        }}
                    >
                        Welcome Players!
                    </h1>

                    {/* -------------- texto -------------- */}
                    <p
                        className={ready ? "anim-fade-up" : "opacity-0"}
                        style={{
                            fontFamily: "'Nunito', sans-serif",
                            fontWeight: 500,
                            fontSize: "clamp(1rem, 2.2vw, 1.4rem)",
                            color: "rgba(255,255,255,0.92)",
                            textAlign: "center",
                            marginTop: "20px",
                            lineHeight: 1.5,
                            animationDelay: "0.35s",
                        }}
                    >
                        Your next adventure together
                        <br />
                        starts in{" "}
                        <strong
                            style={{
                                fontFamily: "'Baloo 2', cursive",
                                fontWeight: 700,
                                color: "white",
                            }}
                        >
                            {islandName}
                        </strong>
                    </p>
                </div>
            </div>
        </>
    );
}
