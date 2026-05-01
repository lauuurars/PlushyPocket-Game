import React, { useEffect, useRef } from 'react';

import partedearriba from '../../../assets/marcoHammerMole/partedearriba.svg';
import partedeabajo from '../../../assets/marcoHammerMole/partedeabajotopos.svg';
import ladoizquierdo from '../../../assets/marcoHammerMole/ladoizquierdotopos.svg';

const HammerMoleGame: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        let stream: MediaStream | null = null;

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: "user",
                        width: { ideal: 1920 },
                        height: { ideal: 1080 }
                    }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error("Error accessing camera:", error);
            }
        };

        startCamera();

        document.body.style.overflow = 'hidden'; //  Este sirve para quitar esas barras de desplazamiento

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            document.body.style.overflow = 'auto';
        };
    }, []);

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-black">


            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="fixed top-0 left-0 w-screen h-[100dvh] object-cover -scale-x-100 z-[1]"
            />

            {/* Marco de arriba */}
            <img
                src={partedearriba}
                alt="Marco Superior"
                className="fixed top-[-140px] left-0 w-screen h-auto z-20 pointer-events-none"
            />

            {/* Marco de abajo */}
            <img
                src={partedeabajo}
                alt="Marco Inferior"
                className="fixed bottom-[-120px] left-0 w-screen h-auto z-20 pointer-events-none"
            />

            {/* Marco de la izquierda */}
            <img
                src={ladoizquierdo}
                alt="Marco Izquierdo"
                className="fixed top-0 left-[-10px] h-screen w-auto z-10 pointer-events-none"
            />

        </div>
    );
};

export default HammerMoleGame;