import React, { useState, useEffect, useRef, useCallback } from 'react';
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
    'bottom-right': { rotation: -45, offset: '160px', ranges: [[5, 12]], anim: 'popDiagBR' },
};

const ALL_SIDES: Side[] = ['top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'];

function getRandomFromRanges(ranges: number[][]): string {
    const range = ranges[Math.floor(Math.random() * ranges.length)];
    return (range[0] + Math.random() * (range[1] - range[0])) + '%';
}

function buildPosition(side: Side): Position {
    const config = SIDE_CONFIG[side];
    const randomPos = getRandomFromRanges(config.ranges);
    if (side === 'top') return { top: config.offset, left: randomPos };
    if (side === 'bottom') return { bottom: config.offset, left: randomPos };
    if (side === 'left') return { left: config.offset, top: randomPos };
    if (side === 'right') return { right: config.offset, top: randomPos };
    if (side === 'top-left') return { top: config.offset, left: config.offset };
    if (side === 'top-right') return { top: config.offset, right: config.offset };
    if (side === 'bottom-left') return { bottom: config.offset, left: config.offset };
    if (side === 'bottom-right') return { bottom: config.offset, right: config.offset };
    return {};
}

// Genera un topo nuevo que no repita personaje ni lado de los actuales
function spawnOne(usedSides: Side[], usedCharNames: string[]): ActiveCharacter {
    const availableSides = ALL_SIDES.filter(s => !usedSides.includes(s));
    const availableChars = charactersList.filter(c => !usedCharNames.includes(c.name));

    const side = availableSides[Math.floor(Math.random() * availableSides.length)];
    const char = availableChars[Math.floor(Math.random() * availableChars.length)];

    return {
        id: Math.random(),
        character: char,
        position: buildPosition(side),
        side,
    };
}

// Genera los 3 topos iniciales sin repetir personaje ni lado
function spawnInitial(): ActiveCharacter[] {
    const result: ActiveCharacter[] = [];
    for (let i = 0; i < 3; i++) {
        const usedSides = result.map(c => c.side);
        const usedChars = result.map(c => c.character.name);
        result.push(spawnOne(usedSides, usedChars));
    }
    return result;
}

const HammerMoleGame: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const socketRef = useRef<Socket | null>(null);
    const activeCharactersRef = useRef<ActiveCharacter[]>([]);

    const [activeCharacters, setActiveCharacters] = useState<ActiveCharacter[]>([]);
    const [score, setScore] = useState(0);
    const [showInstructions, setShowInstructions] = useState(true);

    // Mantener ref sincronizado para leerlo dentro del socket handler
    useEffect(() => {
        activeCharactersRef.current = activeCharacters;
    }, [activeCharacters]);

    // Reemplaza un topo golpeado por uno nuevo sin repetir lado ni personaje
    const replaceCharacter = useCallback((hitId: number) => {
        setActiveCharacters(prev => {
            const remaining = prev.filter(c => c.id !== hitId);
            const usedSides = remaining.map(c => c.side);
            const usedChars = remaining.map(c => c.character.name);
            const newOne = spawnOne(usedSides, usedChars);
            return [...remaining, newOne];
        });
    }, []);

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
            const hit = current.find(c => c.side === direction);
            if (!hit) return;

            // Sumar puntos y reemplazar topo inmediatamente
            setScore(prev => prev + 10);
            replaceCharacter(hit.id);

            socket.emit('hit_confirmed', {
                userId: data.userId,
                characterName: hit.character.name,
                points: 10,
            });
        });

        return () => {
            socket.disconnect();
        };
    }, [replaceCharacter]);

    // Spawn inicial al arrancar el juego
    const handleStart = useCallback(() => {
        setShowInstructions(false);
        setActiveCharacters(spawnInitial());
    }, []);

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-black">
            <style>{`
                @keyframes popTop    { 0%, 100% { transform: translateY(-130%); opacity: 0; } 25%, 75% { transform: translateY(0); opacity: 1; } }
                @keyframes popBottom { 0%, 100% { transform: translateY(130%);  opacity: 0; } 25%, 75% { transform: translateY(0); opacity: 1; } }
                @keyframes popLeft   { 0%, 100% { transform: translateX(-130%); opacity: 0; } 25%, 75% { transform: translateX(0); opacity: 1; } }
                @keyframes popRight  { 0%, 100% { transform: translateX(130%);  opacity: 0; } 25%, 75% { transform: translateX(0); opacity: 1; } }
                @keyframes popDiagTL { 0%, 100% { transform: translate(-100%, -100%); opacity: 0; } 25%, 75% { transform: translate(0, 0); opacity: 1; } }
                @keyframes popDiagTR { 0%, 100% { transform: translate(100%,  -100%); opacity: 0; } 25%, 75% { transform: translate(0, 0); opacity: 1; } }
                @keyframes popDiagBL { 0%, 100% { transform: translate(-100%,  100%); opacity: 0; } 25%, 75% { transform: translate(0, 0); opacity: 1; } }
                @keyframes popDiagBR { 0%, 100% { transform: translate(100%,   100%); opacity: 0; } 25%, 75% { transform: translate(0, 0); opacity: 1; } }
                .char-anim { animation-duration: 1.5s; animation-iteration-count: infinite; animation-timing-function: ease-in-out; }
            `}</style>

            <video ref={videoRef} autoPlay playsInline className="fixed top-0 left-0 w-screen h-dvh object-cover -scale-x-100 z-0" />

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
                <HammerInstructionsModal onStart={handleStart} />
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
                            overflow: 'visible',
                        }}
                    >
                        <img
                            src={active.character.image}
                            alt={active.character.name}
                            className="h-full w-auto object-contain"
                            style={{ transform: `rotate(${config.rotation}deg)`, transformOrigin: 'center' }}
                        />
                    </div>
                );
            })}

            <img src={partedearriba} alt="Marco Superior" className="fixed -top-35 left-0 w-screen h-auto z-20 pointer-events-none" />
            <img src={partedeabajo} alt="Marco Inferior" className="fixed -bottom-30 left-0 w-screen h-auto z-20 pointer-events-none" />
            <img src={ladoizquierdo} alt="Marco Izquierdo" className="fixed top-0 -left-2.5 h-screen w-auto z-10 pointer-events-none" />

            <iframe
                width="0" height="0"
                src="https://www.youtube.com/embed/pxDHwSwDMr0?autoplay=1&loop=1&playlist=pxDHwSwDMr0"
                allow="autoplay" className="hidden" title="Background Music"
            />
        </div>
    );
};

export default HammerMoleGame;