import React, { useState, useEffect, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import type { ActiveCharacter, Character, Position, Side } from '../../../types/hammerTypes';
import { createRealtimeSocket } from '../../../lib/api';
import partedearriba from '../../../assets/marcoHammerMole/partedearriba.svg';
import partedeabajo from '../../../assets/marcoHammerMole/partedeabajotopos.svg';
import ladoizquierdo from '../../../assets/marcoHammerMole/ladoizquierdotopos.svg';
import cinnamoroll from '../../../assets/marcoHammerMole/cinnamoroll.svg';
import kuromi from '../../../assets/marcoHammerMole/kuromi.svg';
import myMelody from '../../../assets/marcoHammerMole/myMelody.svg';
import pompompurin from '../../../assets/marcoHammerMole/pompompurin.svg';
import GamePoints from '../../../components/GamePoints';
import Timer from '../../../components/Timer';
import HammerInstructionsModal from '../../../components/HammerInstructionsModal';

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
    const socketRef = useRef<Socket | null>(null);
    const activeCharactersRef = useRef<ActiveCharacter[]>([]);

    const [activeCharacters, setActiveCharacters] = useState<ActiveCharacter[]>([]);
    const [score, setScore] = useState(0);
    const [showInstructions, setShowInstructions] = useState(true);

    // Sincronizar ref con state para poder leerlo dentro del socket handler
    useEffect(() => {
        activeCharactersRef.current = activeCharacters;
    }, [activeCharacters]);

    // Cámara
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

    // Socket — escucha golpes del celular
    useEffect(() => {
        const socket = createRealtimeSocket() as unknown as Socket;
        socketRef.current = socket;

        socket.on('player_action', (data: {
            userId: string;
            action: string;
            payload: { direction: string };
        }) => {
            if (data.action !== 'hammer_swing') return;

            const { direction } = data.payload;
            const current = activeCharactersRef.current;

            // Buscar topo activo en esa dirección
            const hit = current.find(c => c.side === direction);
            if (!hit) return;

            // Eliminar el topo (anti doble-golpe)
            setActiveCharacters(prev => prev.filter(c => c.id !== hit.id));

            // Sumar puntos
            setScore(prev => prev + 10);

            // Confirmar al cel que pegó
            socket.emit('hit_confirmed', {
                userId: data.userId,
                characterName: hit.character.name,
                points: 10,
            });
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // Aparición aleatoria de personajes
    useEffect(() => {
        if (showInstructions) return;

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
    }, [showInstructions]);

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

            {/* Contadores de puntos*/}
            {!showInstructions && (
                <>
                    <div className="fixed top-6 left-[80px] z-30">
                        <GamePoints points={score} playerRole="P1" />
                    </div>
                    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-30">
                        <Timer initialSeconds={90} />
                    </div>
                    <div className="fixed top-6 right-[80px] z-30">
                        <GamePoints points={score} playerRole="P2" />
                    </div>
                </>
            )}

            {showInstructions && (
                <HammerInstructionsModal onStart={() => setShowInstructions(false)} />
            )}

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