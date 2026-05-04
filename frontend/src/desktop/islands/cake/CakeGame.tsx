import React, { useEffect, useRef, useState } from 'react';
import GamePoints from '../../../components/GamePoints';
import Catapulta from '../../../assets/cake/Catapulta.svg';
import CatapultaTwo from '../../../assets/cake/Catapulta2.svg';


const CakeGame: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [score, setScore] = useState(0);

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
