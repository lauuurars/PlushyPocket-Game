import PartyBackground from "../../assets/startGame/Party Background.svg";
import QR from "../../assets/startGame/QR.svg";
import Leon from "../../assets/startGame/leon.svg";
import Pinguino from "../../assets/startGame/pingüino.svg";

import { useEffect, useState } from "react";

import Rayo from "../../assets/welcome/Rayo.svg";
import Estrella2 from "../../assets/welcome/Estrella2.svg";
import Estrella3 from "../../assets/welcome/Estrella3.svg";
import Flor from "../../assets/welcome/Flor.svg";
import Corona from "../../assets/welcome/Corona.svg";
import Corazon from "../../assets/welcome/Corazon.svg";

export default function StartGame() {
    const [ready, setReady] = useState(false)

    useEffect(() => {
        const prevOverflow = document.body.style.overflow
        document.body.style.overflow = "hidden"
        const t = setTimeout(() => setReady(true), 100)
        return () => {
            clearTimeout(t)
            document.body.style.overflow = prevOverflow
        }
    }, [])

    return (
        <div className="relative h-svh w-screen overflow-hidden bg-[#ED1C24]">

            { /* ----- animaciones :p --------  */}

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
                    50%      { transform: scale(1.12); opacity: 0.85; }
                }
                @keyframes scatter-in {
                    0%   { transform: scale(0) rotate(-30deg); opacity: 0; }
                    70%  { transform: scale(1.2) rotate(5deg);  opacity: 1; }
                    100% { transform: scale(1)   rotate(0deg);  opacity: 1; }
                }
                @keyframes character-enter-left {
                    0%   { transform: translate(-18%, 28%) rotate(17deg); opacity: 0; }
                    100% { transform: translate(0%, 0%) rotate(17deg); opacity: 1; }
                }
                @keyframes character-enter-right {
                    0%   { transform: translate(18%, 30%) rotate(-23deg); opacity: 0; }
                    100% { transform: translate(0%, 0%) rotate(-23deg); opacity: 1; }
                }
                .float-a  { animation: floatY     3.8s ease-in-out infinite; }
                .float-b  { animation: floatY2    4.4s ease-in-out infinite; }
                .spin-s   { animation: spin-slow  8s   linear       infinite; }
                .pulse-s  { animation: pulse-soft 2.6s ease-in-out  infinite; }
                .anim-scatter { animation: scatter-in 0.5s cubic-bezier(.34,1.56,.64,1) both; }
                .anim-character-left { animation: character-enter-left 0.95s cubic-bezier(.34,1.56,.64,1) both; }
                .anim-character-right { animation: character-enter-right 0.95s cubic-bezier(.34,1.56,.64,1) both; }
            `}</style>

            <div className="absolute inset-0">

                { /* ----- fondo img --------  */}

                <img
                    src={PartyBackground}
                    className="absolute inset-0 h-full w-full object-cover"
                />

                { /* ----- corona element ------  */}
                <img
                    src={Corona}
                    className={`absolute left-[86.6%] top-[30.4%] h-[8.2svh] w-auto 
                        rotate-60 ${ready ? "" : "opacity-0"} float-a anim-scatter`}
                    style={{ animationDelay: "0.25s" }}
                />

                { /* ----- flor element ------  */}
                <img
                    src={Flor}
                    className={`absolute left-[65.3%] top-[33.7%] h-[7.2svh] w-auto rotate-[-11deg] ${ready ? "" : "opacity-0"} spin-s anim-scatter`}
                    style={{ animationDelay: "0.5s" }}
                />

                { /* ----- estrella2 element ------  */}
                <img
                    src={Estrella2}
                    className={`absolute left-[31.1%] top-[66.0%] h-[6.4svh] w-auto 
                        rotate-7 ${ready ? "" : "opacity-0"} float-b anim-scatter`}
                    style={{ animationDelay: "0.35s" }}
                />

                { /* ----- corazon element ------  */}
                <img
                    src={Corazon}
                    className={`absolute left-[61.6%] top-[66.2%] h-[5.6svh] w-auto 
                        rotate-[-40deg] ${ready ? "" : "opacity-0"} pulse-s anim-scatter`}
                    style={{ animationDelay: "0.6s" }}
                />

                { /* ----- estrella3 element ------  */}
                <img
                    src={Estrella3}
                    className={`absolute left-[4.4%] top-[36%] h-[6.8svh] w-auto 
                        rotate-19 ${ready ? "" : "opacity-0"} float-a anim-scatter`}
                    style={{ animationDelay: "0.4s" }}
                />


                { /* ----- rayo element ------  */}
                <img
                    src={Rayo}
                    className={`absolute left-[27.5%] top-[35.7%] h-[8.2svh] w-auto 
                        rotate-82 ${ready ? "" : "opacity-0"} float-b anim-scatter`}
                    style={{ animationDelay: "0.2s" }}
                />

                { /* ----- títuloooooo ------  */}
                <h1
                    className="absolute left-1/2 top-[clamp(28px,8.5svh,116px)] w-[min(92vw,740px)] -translate-x-1/2 text-center 
                    text-[clamp(30px,4.8vw,80px)] leading-[0.9] tracking-[-1px] text-[#FAFAFA] font-bold"
                    style={{ fontFamily: "'Baloo 2', sans-serif" }}
                >
                    Ready for a new adventure?
                </h1>

                { /* ---------  QR img para reemplazar -----------   */}
                <div className="absolute left-1/2 top-[34.5%] h-[min(32svh,304px)] w-[min(32svh,304px)] -translate-x-1/2 overflow-hidden rounded-[37px] bg-white shadow-[0px_4px_12px_rgba(76,76,76,0.25)]">
                    <img src={QR} alt="QR code" className="h-full w-full object-cover" />
                </div>

                { /* ----- párrafo  ----------  */}
                <p className="absolute left-1/2 top-[76%] w-[min(92vw,480px)] -translate-x-1/2 text-center 
                text-[clamp(18px,2.2vw,30px)] leading-[1.4] tracking-[-0.57px] text-[#FFFDF6]">
                    <span>Turn on your phone&apos;s camera and </span>
                    <span className="font-bold">scan the QR code</span>
                    <span> to play</span>
                </p>

                { /* ----- pingüino personaje ------  */}
                <img
                    src={Pinguino}
                    className={`absolute bottom-[-7.6%] left-[-4.2%] w-[min(30vw,473px)] rotate-17 ${ready ? "anim-character-left" : "opacity-0"}`}
                    style={{ animationDelay: "0.15s" }}
                />

                { /* ----- león personaje ------  */}
                <img
                    src={Leon}
                    className={`absolute bottom-[-12.3%] right-[-4.4%] w-[min(28vw,463px)] rotate-[-23deg] ${ready ? "anim-character-right" : "opacity-0"}`}
                    style={{ animationDelay: "0.15s" }}
                />
            </div>
        </div>
    );
}
