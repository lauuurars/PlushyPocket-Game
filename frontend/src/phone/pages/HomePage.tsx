import { Music4, Volume2, VolumeX, Camera } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UnlockItemPopup from "../../components/UnlockItemPopup";
import Cloud from "../../assets/homePhone/cloud.svg";
import Cloud2 from "../../assets/homePhone/cloud2.svg";
import Mochi from "../../assets/homePhone/mochiFull.svg";
import Ocean from "../../assets/homePhone/oceanHome.svg";
import Palmtree from "../../assets/homePhone/palmtree.svg";
import Sand from "../../assets/homePhone/sand.svg";
import BackgroundMusic from "../../assets/welcome/Pocket Music.mp3";
import Navbar from "../../components/mobile/Navbar";

const HomePhone = () => {
    const [username, setUsername] = useState("Martin");
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [startedMusic, setStartedMusic] = useState(false);
    const [ready, setReady] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setReady(true);
        // guardar el username 
        const storedName = localStorage.getItem("username");
        if (storedName) {
            setUsername(storedName);
        }

        // Setup background music
        const audio = new Audio(BackgroundMusic);
        audio.loop = true;
        audio.volume = 0.4;
        audioRef.current = audio;

        return () => {
            audio.pause();
            audio.src = "";
        };
    }, []);

    const toggleMute = () => {
        const audioMute = audioRef.current;
        if (!audioMute) return;

        if (!startedMusic) {
            audioMute.play().catch(console.error);
            setStartedMusic(true);
            setIsMuted(false);
        } else {
            audioMute.muted = !audioMute.muted;
            setIsMuted(!isMuted);
        }
    };

    return (
        <div className="relative w-full h-screen overflow-hidden bg-[#97ECFF] font-sans flex flex-col items-center">
            <style>{`
                @keyframes floatCloud {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }
                @keyframes swayPalms {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(3deg); }
                }
                @keyframes waveMove {
                    0%, 100% { transform: translateX(0) translateY(0); }
                    50% { transform: translateX(-10px) translateY(5px); }
                }
                @keyframes floatMochi {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .animate-cloud-slow {
                    animation: floatCloud 6s ease-in-out infinite;
                }
                .animate-cloud-fast {
                    animation: floatCloud 4s ease-in-out infinite;
                }
                .animate-sway {
                    animation: swayPalms 4s ease-in-out infinite;
                    transform-origin: bottom center;
                }
                .animate-wave {
                    animation: waveMove 3s ease-in-out infinite;
                }
                .animate-mochi {
                    animation: floatMochi 3s ease-in-out infinite;
                }
                .fade-in {
                    animation: fadeIn 1s ease-out forwards;
                }
            `}</style>

            {/* nubesitas */}
            <div className="absolute top-[20%] left-[80%] w-[120px] animate-cloud-slow opacity-80">
                <img src={Cloud}
                    alt=""
                    className="w-full" />
            </div>

            <div className="absolute top-[15%] right-[65%] w-[150px] animate-cloud-fast opacity-90"
                style={{ animationDelay: '-2s' }}>
                <img src={Cloud2}
                    alt=""
                    className="w-full" />
            </div>

            {/* Palmerita */}
            <div className="absolute left-[-15%] bottom-[12%] w-[60%] z-35 animate-sway">
                <img src={Palmtree}
                    alt=""
                    className="w-full" />
            </div>

            {/* Aguita */}
            <div className="absolute bottom-[20%] left-0 w-full z-20 overflow-hidden">
                <img src={Ocean}
                    alt=""
                    className="min-w-[105vw] h-[300px] object-cover animate-wave"
                    style={{ marginBottom: '-2px' }} />
            </div>

            <div className="absolute bottom-0 left-0 w-full z-30">
                <img src={Sand} alt="" className="w-full object-cover" />
            </div>

            {/* Mochi*/}
            <div className="absolute left-1/2 bottom-[10%] -translate-x-1/2 w-[75%] z-40 animate-mochi">
                <img src={Mochi}
                    alt="Mochi"
                    className="w-full" />
            </div>


            <div className="relative w-full p-6  pt-18 flex items-center justify-between z-50 fade-in">

                <div className="bg-[#ED1C24] px-5 py-2 rounded-full border-2 border-white/20">
                    <span className="text-white font-bold text-lg">Hey, {username}!</span>
                </div>

                {/* Musiquita y Camara */}
                <div className="flex gap-3">
                    <button
                        onClick={toggleMute}
                        className="w-11 h-11 bg-[#ED1C24] rounded-full flex items-center justify-center text-white border-2 border-white/20 active:scale-95 transition-transform"
                    >
                        {!startedMusic ? (
                            <Music4 size={22} />
                        ) : isMuted ? (
                            <VolumeX size={22} />
                        ) : (
                            <Volume2 size={22} />
                        )}
                    </button>
                    <button
                        onClick={() => setShowPopup(true)}
                        className="w-11 h-11 bg-[#ED1C24] rounded-full flex items-center justify-center text-white border-2 border-white/20 active:scale-95 transition-transform"
                    >
                        <Camera size={22} />
                    </button>
                </div>
            </div>

            {/* Pop up :P  */}
            <UnlockItemPopup
                isOpen={showPopup}
                onClose={() => setShowPopup(false)}
            />
            <Navbar />
        </div>

    );
};

export default HomePhone;
