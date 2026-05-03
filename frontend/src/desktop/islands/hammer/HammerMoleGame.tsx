import React, { useState, useEffect, useRef } from 'react';
import type { ActiveCharacter, Character, Position, Side } from '../../../types/hammerTypes';
import partedearriba from '../../../assets/marcoHammerMole/partedearriba.svg';
import partedeabajo from '../../../assets/marcoHammerMole/partedeabajotopos.svg';
import ladoizquierdo from '../../../assets/marcoHammerMole/ladoizquierdotopos.svg';
import cinnamoroll from '../../../assets/marcoHammerMole/cinnamoroll.svg';
import kuromi from '../../../assets/marcoHammerMole/kuromi.svg';
import myMelody from '../../../assets/marcoHammerMole/myMelody.svg';
import pompompurin from '../../../assets/marcoHammerMole/pompompurin.svg';

const charactersList: Character[] = [
    { name: 'Cinnamoroll', image: cinnamoroll },
    { name: 'Kuromi', image: kuromi },
    { name: 'My Melody', image: myMelody },
    { name: 'Pompompurin', image: pompompurin },
];
// offset: Empuja al personaje para que el marco no le tape la cara
const SIDE_CONFIG: Record<Side, { rotation: number, offset: string, ranges: number[][], anim: string }> = {
    top: { rotation: 180, offset: '40px', ranges: [[40, 60]], anim: 'popTop' },
    bottom: { rotation: 0, offset: '35px', ranges: [[40, 60]], anim: 'popBottom' },
    left: { rotation: 90, offset: '25px', ranges: [[40, 60]], anim: 'popLeft' },
    right: { rotation: -90, offset: '25px', ranges: [[40, 60]], anim: 'popRight' },
    'top-left': { rotation: 135, offset: '120px', ranges: [[5, 12]], anim: 'popDiagTL' },
    'top-right': { rotation: 225, offset: '120px', ranges: [[5, 12]], anim: 'popDiagTR' },
    'bottom-left': { rotation: 45, offset: '160px', ranges: [[5, 12]], anim: 'popDiagBL' },
    'bottom-right': { rotation: -45, offset: '160px', ranges: [[5, 12]], anim: 'popDiagBR' }
};

const HammerMoleGame: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [activeCharacters, setActiveCharacters] = useState<ActiveCharacter[]>([]);

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


    // Controla la aparición aleatoria de los personajes 
    useEffect(() => {
        const sides: Side[] = ['top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'];
        const getRandomFromRanges = (ranges: number[][]) => {
            const range = ranges[Math.floor(Math.random() * ranges.length)];
            return (range[0] + Math.random() * (range[1] - range[0])) + '%';
        };

        const interval = setInterval(() => {
            const count = Math.floor(Math.random() * 3) + 1; 
            const newActive: ActiveCharacter[] = [];
            const usedSides = new Set<string>();

            for (let i = 0; i < count; i++) {
                // Filtramos la lista para que no salga el mismo personaje dos veces
                const availableChars = charactersList.filter(c => 
                    !newActive.some(active => active.character.name === c.name)
                );
                
                if (availableChars.length === 0) break;

                const char = availableChars[Math.floor(Math.random() * availableChars.length)];
                let side: Side;
                let attempts = 0;
                
                // Aseguramos que no salgan en el mismo lado
                do {
                    side = sides[Math.floor(Math.random() * sides.length)];
                    attempts++;
                } while (usedSides.has(side) && attempts < 10);
                usedSides.add(side);

                const config = SIDE_CONFIG[side];
                const randomPos = getRandomFromRanges(config.ranges);

                let pos: Position = {};
                if (side === 'top') pos = { top: config.offset, left: randomPos };
                else if (side === 'bottom') pos = { bottom: config.offset, left: randomPos };
                else if (side === 'left') pos = { left: config.offset, top: randomPos };
                else if (side === 'right') pos = { right: config.offset, top: randomPos };
                else if (side === 'top-left') pos = { top: config.offset, left: config.offset };
                else if (side === 'top-right') pos = { top: config.offset, right: config.offset };
                else if (side === 'bottom-left') pos = { bottom: config.offset, left: config.offset };
                else if (side === 'bottom-right') pos = { bottom: config.offset, right: config.offset };

                newActive.push({ id: Math.random(), character: char, position: pos, side });
            }
            setActiveCharacters(newActive);
        }, 1500); 

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-black">
            <style>
                {`
                @keyframes popTop { 0%, 100% { transform: translateY(-130%); opacity: 0; } 25%, 75% { transform: translateY(0); opacity: 1; } }
                @keyframes popBottom { 0%, 100% { transform: translateY(130%); opacity: 0; } 25%, 75% { transform: translateY(0); opacity: 1; } }
                @keyframes popLeft { 0%, 100% { transform: translateX(-130%); opacity: 0; } 25%, 75% { transform: translateX(0); opacity: 1; } }
                @keyframes popRight { 0%, 100% { transform: translateX(130%); opacity: 0; } 25%, 75% { transform: translateX(0); opacity: 1; } }
                @keyframes popDiagTL { 0%, 100% { transform: translate(-100%, -100%); opacity: 0; } 25%, 75% { transform: translate(0, 0); opacity: 1; } }
                @keyframes popDiagTR { 0%, 100% { transform: translate(100%, -100%); opacity: 0; } 25%, 75% { transform: translate(0, 0); opacity: 1; } }
                @keyframes popDiagBL { 0%, 100% { transform: translate(-100%, 100%); opacity: 0; } 25%, 75% { transform: translate(0, 0); opacity: 1; } }
                @keyframes popDiagBR { 0%, 100% { transform: translate(100%, 100%); opacity: 0; } 25%, 75% { transform: translate(0, 0); opacity: 1; } }
                .char-anim { animation-duration: 1.5s; animation-iteration-count: infinite; animation-timing-function: ease-in-out; }
                `}
            </style>

            <video ref={videoRef} autoPlay playsInline className="fixed top-0 left-0 w-screen h-dvh object-cover -scale-x-100 z-0" />

            {activeCharacters.map((active) => {
                const config = SIDE_CONFIG[active.side];
                return (
                    <div
                        key={active.id}
                        className="absolute char-anim flex items-center justify-center"
                        style={{
                            ...active.position,
                            width: 'auto',
                            height: '180px',
                            minWidth: '180px',
                            zIndex: 5,
                            animationName: config.anim,
                            transformOrigin: 'center',
                            overflow: 'visible'
                        }}
                    >
                        <img
                            src={active.character.image}
                            alt={active.character.name}
                            className="h-full w-auto object-contain" 
                            style={{
                                transform: `rotate(${config.rotation}deg)`,
                                transformOrigin: 'center'
                            }}
                        />
                    </div>
                );
            })}

            <img src={partedearriba} alt="Marco Superior" className="fixed -top-35 left-0 w-screen h-auto z-20 pointer-events-none" />
            <img src={partedeabajo} alt="Marco Inferior" className="fixed -bottom-30 left-0 w-screen h-auto z-20 pointer-events-none" />
            <img src={ladoizquierdo} alt="Marco Izquierdo" className="fixed top-0 -left-2.5 h-screen w-auto z-10 pointer-events-none" />


            <iframe
                width="0"
                height="0"
                src="https://www.youtube.com/embed/pxDHwSwDMr0?autoplay=1&loop=1&playlist=pxDHwSwDMr0"
                allow="autoplay"
                className="hidden"
                title="Background Music"
            ></iframe>
        </div>

    );



};

export default HammerMoleGame;