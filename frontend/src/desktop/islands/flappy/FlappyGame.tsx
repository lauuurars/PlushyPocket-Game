import React, { useEffect, useRef, useState } from 'react';
import Ocean from './Ocean';
import type { ObstacleData, Column } from '../../../types/flappyTypes';

// Assets
import boatPart from '../../../assets/flappybird/boatPart.svg';
import boatPart2 from '../../../assets/flappybird/boatPart2.svg';
import woodenbench from '../../../assets/flappybird/woodenbench.svg';
import woodenbench2 from '../../../assets/flappybird/woodenbench2.svg';
import woodenbench3 from '../../../assets/flappybird/woodenbench3.svg';
import GamePoints from '../../../components/GamePoints';

const ASSETS = [boatPart, boatPart2, woodenbench, woodenbench2, woodenbench3];


const FlappyGame: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const requestRef = useRef<number | null>(null);
    const [score, setScore] = useState(0);

    // Configuración Estricta
    const SPEED = 6;
    const MIN_HORIZONTAL_SPACING = 450;
    const OBSTACLE_COUNT = 5;
    const VERTICAL_GAP = 400;
    const BASE_HEIGHT = 300;

    const getAssetData = (typeIndex: number, position: 'top' | 'bottom'): ObstacleData => {
        const isBoat = typeIndex === 0 || typeIndex === 1;
        // el woodenbench en la  rotación si está arriba
        const isNormalBench = typeIndex === 2;
        const isClippedBench = typeIndex === 3 || typeIndex === 4;

        let rotation = 0;
        // Si es barco O el banco normal y está arriba, lo volteamos para ocultar el corte
        if ((isBoat || isNormalBench) && position === 'top') rotation = 180;
        // Los bancos que ya vienen cortados arriba se voltean si van abajo
        if (isClippedBench && position === 'bottom') rotation = 180;

        const width = typeIndex === 0 ? 450 : 320;

        let finalTopPos = -20;
        // ajuste manualmente para el boatPart arriba porque su corte es diferente por la curvita que tiene
        if (typeIndex === 0 && position === 'top') {
            finalTopPos = -120;
        }
        if (typeIndex === 2 && position === 'top') {
            finalTopPos = -40; // Lo subi un poquito más que el resto :P
        }

        return {
            typeIndex,
            rotation,
            width,
            height: BASE_HEIGHT,
            [position === 'top' ? 'topPos' : 'bottomPos']: position === 'top' ? finalTopPos : -20
        };
    };

    const generateColumn = (id: number, x: number, prevPos?: 'top' | 'bottom'): Column => {
        const viewportHeight = window.innerHeight;
        const canFitTwo = (BASE_HEIGHT * 2 + VERTICAL_GAP) <= viewportHeight;

        let targetPos: 'top' | 'bottom';
        if (!prevPos) {
            targetPos = Math.random() > 0.5 ? 'top' : 'bottom';
        } else {
            targetPos = prevPos === 'top' ? 'bottom' : 'top';
        }

        const isDouble = canFitTwo && Math.random() > 0.7;

        let top: ObstacleData | undefined;
        let bottom: ObstacleData | undefined;

        if (isDouble) {
            top = getAssetData(Math.floor(Math.random() * ASSETS.length), 'top');
            bottom = getAssetData(Math.floor(Math.random() * ASSETS.length), 'bottom');

            const topFinalEdge = BASE_HEIGHT + (top.topPos || 0);
            bottom.bottomPos = undefined;
            bottom.topPos = topFinalEdge + VERTICAL_GAP;
        } else {
            const typeIndex = Math.floor(Math.random() * ASSETS.length);
            if (targetPos === 'top') top = getAssetData(typeIndex, 'top');
            else bottom = getAssetData(typeIndex, 'bottom');
        }

        return { id, x, top, bottom, lastPosUsed: targetPos };
    };

    const [columns, setColumns] = useState<Column[]>(() => {
        const startX = window.innerWidth + 200;
        let lastSide: 'top' | 'bottom' | undefined;

        return Array.from({ length: OBSTACLE_COUNT }, (_, i) => {
            const col = generateColumn(i, startX + (i * MIN_HORIZONTAL_SPACING), lastSide);
            lastSide = col.lastPosUsed;
            return col;
        });
    });

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
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    const animate = () => {
        setColumns(prev => {
            const rightmostX = Math.max(...prev.map(c => c.x));
            const lastCol = prev.reduce((p, c) => (p.x > c.x ? p : c));

            return prev.map(col => {
                const newX = col.x - SPEED;
                if (newX < -500) {
                    return generateColumn(col.id, rightmostX + MIN_HORIZONTAL_SPACING, lastCol.lastPosUsed);
                }
                return { ...col, x: newX };
            });
        });
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
    },);

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-black">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="fixed top-0 left-0 w-screen h-dvh object-cover -scale-x-100 z-1"
            />

            {/* Contadores de puntos*/}
            <div className="fixed top-8 left-70 -translate-x-1/2 z-30">
                <GamePoints points={score} />
            </div>

            <div className="fixed top-8 right-40 -translate-x-1/2 z-30">
                <GamePoints points={score} />
            </div>

            <div className="z-30 relative">
                <Ocean />
            </div>

            {columns.map((col) => (
                <React.Fragment key={col.id}>
                    {col.top && (
                        <img
                            src={ASSETS[col.top.typeIndex]}
                            alt="obs-top"
                            className="fixed z-10 pointer-events-none object-contain"
                            style={{
                                width: `${col.top.width}px`,
                                height: `${col.top.height}px`,
                                left: `${col.x}px`,
                                top: `${col.top.topPos}px`,
                                transform: `rotate(${col.top.rotation}deg)`
                            }}
                        />
                    )}
                    {col.bottom && (
                        <img
                            src={ASSETS[col.bottom.typeIndex]}
                            alt="obs-bottom"
                            className="fixed z-10 pointer-events-none object-contain"
                            style={{
                                width: `${col.bottom.width}px`,
                                height: `${col.bottom.height}px`,
                                left: `${col.x}px`,
                                bottom: col.bottom.bottomPos !== undefined ? `${col.bottom.bottomPos}px` : 'auto',
                                top: col.bottom.topPos !== undefined ? `${col.bottom.topPos}px` : 'auto',
                                transform: `rotate(${col.bottom.rotation}deg)`
                            }}
                        />
                    )}
                </React.Fragment>
            ))}

            {/* Le agregue musiquita jajaaj */}
            <iframe
                width="0"
                height="0"
                src="https://www.youtube.com/embed/kEa7el_Tr04?autoplay=1&loop=1&playlist=kEa7el_Tr04&"
                frameBorder="0"
                allow="autoplay"
                className="hidden"
                title="Background Music"
            ></iframe>
        </div>
    );
};

export default FlappyGame;
