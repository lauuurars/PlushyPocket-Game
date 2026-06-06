import React, { useEffect, useRef, useState } from 'react';
import GamePoints from '../../../components/GamePoints';
import Catapulta from '../../../assets/cake/Catapulta.svg';
import CatapultaTwo from '../../../assets/cake/Catapulta2.svg';
import { fetchPartyRoomUserProfile } from '../../../lib/api';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import MisuIcon from '../../../assets/profile-pic/Misu-Icon.svg';
import MochiIcon from '../../../assets/profile-pic/Mochi-Icon.svg';
import YukiIcon from '../../../assets/profile-pic/Yuki-Icon.svg';
const CakeGame: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [score] = useState(0);
    const [gamePhase, setGamePhase] = useState<"alert" | "line" | "playing">("alert");
    const [profileIcon, setProfileIcon] = useState<string>(MochiIcon);

    useEffect(() => {
        void fetchPartyRoomUserProfile().then((profile) => {
            const char = (profile?.character_selected || "").toLowerCase();
            if (char === "misu") setProfileIcon(MisuIcon);
            else if (char === "yuki") setProfileIcon(YukiIcon);
            else setProfileIcon(MochiIcon);
        });
    }, []);

    useEffect(() => {
        if (gamePhase === "alert") {
            const t = setTimeout(() => setGamePhase("line"), 4000);
            return () => clearTimeout(t);
        } else if (gamePhase === "line") {
            const t = setTimeout(() => setGamePhase("playing"), 9000);
            return () => clearTimeout(t);
        }
    }, [gamePhase]);

    useEffect(() => {
        let stream: MediaStream | null = null;
        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "user", width: { ideal: 1920 }, height: { ideal: 1080 } }
                });
                if (videoRef.current) videoRef.current.srcObject = stream;
            } catch (error) { console.error(error); }
        };
        startCamera();
        document.body.style.overflow = 'hidden';
        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop());
            document.body.style.overflow = 'auto';
        };
    }, []);

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-black">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="fixed top-0 left-0 w-screen h-dvh object-cover -scale-x-100 z-0"
            />

            <style>{`
                @keyframes alert-anim {
                    0% { opacity: 0; transform: scale(0.85); }
                    10% { opacity: 1; transform: scale(1); }
                    90% { opacity: 1; transform: scale(1); }
                    100% { opacity: 0; transform: scale(0.95); }
                }
                @keyframes line-anim {
                    0% { opacity: 0; }
                    10% { opacity: 1; }
                    25% { opacity: 0.2; }
                    40% { opacity: 1; }
                    55% { opacity: 0.2; }
                    70% { opacity: 1; }
                    85% { opacity: 0.2; }
                    90% { opacity: 1; }
                    100% { opacity: 0; }
                }
                @keyframes bounce-left {
                    0%, 100% { transform: translateX(0); }
                    50% { transform: translateX(-20px); }
                }
                @keyframes bounce-right {
                    0%, 100% { transform: translateX(0); }
                    50% { transform: translateX(20px); }
                }
            `}</style>

            {gamePhase === "alert" && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 px-5" style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}>
                    <div 
                        className="flex w-full max-w-140 flex-col items-center rounded-[40px] bg-[#FAFAFA] p-10 pb-12 text-center shadow-2xl"
                        style={{ animation: "alert-anim 5s forwards" }}
                    >
                        <div className="mb-8 flex items-center justify-center gap-8">
                            <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full bg-[#71D0FF]">
                                <img src={profileIcon} alt="Player 1" className="h-full w-full object-cover" />
                            </div>
                            <div className="h-35 w-1 shrink-0 rounded-full bg-[#ED1C24]" />
                            <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full bg-[#8E44AD]">
                                <img src={profileIcon} alt="Player 2" className="h-full w-full object-cover" />
                            </div>
                        </div>
                        <h2 className="mb-5 text-[34px] font-extrabold text-[#ED1C24] leading-tight" style={{ fontFamily: "'Baloo 2', cursive" }}>Keep Your Distance</h2>
                        <p className="text-[20px] font-semibold text-[#583921] leading-[1.4]">
                           Take your positions on opposite sides of the screen, separated by the line, then shout into the phone.
                        </p>
                    </div>
                </div>
            )}

            {gamePhase === "line" && (
                <div 
                    className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
                    style={{ animation: "line-anim 3s forwards" }}
                >
                    <div className="relative flex items-center justify-center h-[84%] w-full">
                        <div className="absolute right-1/2 mr-10" style={{ animation: "bounce-left 1s infinite" }}>
                            <ArrowLeft color="#ED1C24" size={200} strokeWidth={2.5} />
                        </div>
                        
                        <div className="w-1.25 h-full rounded-full bg-[#ED1C24]" />

                        <div className="absolute left-1/2 ml-10" style={{ animation: "bounce-right 1s infinite" }}>
                            <ArrowRight color="#ED1C24" size={200} strokeWidth={2.5} />
                        </div>
                    </div>
                </div>
            )}

            {/* Contadores de puntos */}
            <div className="fixed top-8 left-70 -translate-x-1/2 z-30">
                <GamePoints points={score} />
            </div>
            <div className="fixed top-8 right-40 -translate-x-1/2 z-30">
                <GamePoints points={score} />
            </div>

            <img
                src={Catapulta}
                alt="Catapulta"
                className="fixed bottom-0 right-10 z-20 w-110 pointer-events-none"
            />

            <img
                src={CatapultaTwo}
                alt="Catapulta"
                className="fixed bottom-0 left-10 z-20 w-110 pointer-events-none"
            />



        </div>
    );
};

export default CakeGame;
