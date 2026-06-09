import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from "react-router-dom";
import { VioletButton } from '../../components/VioletButton';

const QRGame: React.FC = () => {
    const navigate = useNavigate();
    const navigatedRef = useRef(false);
    const qrRef = useRef<Html5Qrcode | null>(null);
    const [scannerError, setScannerError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const queuedUserGestureRef = useRef(false);

    const handleDecodedText = async (decodedText: string) => {
        if (navigatedRef.current) return;

        let roomId: string | null = null;
        let minigameId: string | null = null;

        const raw = decodedText?.trim() ?? "";
        if (!raw) return;

        try {
            if (raw.startsWith("{")) {
                const parsed = JSON.parse(raw) as unknown;
                if (parsed && typeof parsed === "object") {
                    const o = parsed as Record<string, unknown>;
                    if (typeof o.roomId === "string") roomId = o.roomId;
                    if (typeof o.minigameId === "string") minigameId = o.minigameId;
                }
            } else {
                const url = new URL(raw);
                roomId =
                    url.searchParams.get("roomId") ??
                    url.searchParams.get("roomCode") ??
                    url.searchParams.get("code");
                minigameId = url.searchParams.get("minigameId");
            }
        } catch {
            if (/^\d{4}$/.test(raw)) roomId = raw;
        }

        if (!roomId) return;

        navigatedRef.current = true;
        try {
            const qr = qrRef.current;
            if (qr?.isScanning) {
                await qr.stop();
                await qr.clear();
            }
        } catch (err) {
            console.warn("Clearing scanner failed:", err);
        }

        const target = `/joined-room?roomId=${encodeURIComponent(roomId)}${minigameId ? `&minigameId=${encodeURIComponent(minigameId)}` : ""}`;
        navigate(target, { replace: true });
    };

    const startScanner = async () => {
        const qr = qrRef.current;
        if (!qr) {
            throw new Error("Scanner not initialized.");
        }
        if (qr.isScanning) {
            setIsScanning(true);
            return;
        }

        await qr.start(
            { facingMode: "environment" },
            { fps: 15, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
            (decodedText) => void handleDecodedText(decodedText),
            () => { },
        );
        setIsScanning(true);
    };

    const activarSensorCamara = async (): Promise<void> => {
        if (!navigator.mediaDevices?.getUserMedia) {
            alert("Camera is not supported by this browser :p");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
            });
            stream.getTracks().forEach((t) => t.stop());
            await startScanner();
        } catch (error: unknown) {
            const err = error as { name?: unknown; message?: unknown };
            const errName = typeof err?.name === "string" ? err.name : "";
            const errMessage = typeof err?.message === "string" ? err.message : "";

            if (errName === "NotAllowedError" || errName === "SecurityError") {
                const msg =
                    "Camera access denied. Please enable prompt permission.";
                setScannerError(msg);
                alert(msg);

                if (!queuedUserGestureRef.current) {
                    queuedUserGestureRef.current = true;
                    window.addEventListener(
                        "pointerdown",
                        () => {
                            queuedUserGestureRef.current = false;
                            void activarSensorCamara();
                        },
                        { once: true },
                    );
                }
                return;
            }

            const fallback = errMessage || String(error);
            setScannerError(fallback);
            alert(fallback);
        }
    };

    useEffect(() => {
        qrRef.current = new Html5Qrcode("reader");

        void activarSensorCamara();

        return () => {
            const qr = qrRef.current;
            qrRef.current = null;
            if (!qr) return;
            if (qr.isScanning) {
                qr.stop()
                    .then(() => qr.clear())
                    .catch((err) => console.error("Error al detener el escáner", err));
            }
        };
    }, []);

    return (
        <div className="relative w-screen h-dvh overflow-hidden bg-black font-sans">

            {/* Camara*/}
            <div id="reader" className="absolute inset-0 w-full h-full z-0"></div>

            {/* Círculo rojo*/}
            <div className="absolute top-[-45%] left-1/2 -translate-x-1/2 w-[140vw] aspect-square bg-[#ED1C24] rounded-full flex items-end justify-center pb-12 z-20">
                <h1
                    className="text-[#FAFAFA] text-[40px] font-black leading-tight text-center px-10 mb-8"
                    style={{ fontFamily: "'Baloo 2', system-ui, sans-serif" }}
                >
                    Scan your <br /> game QR code!
                </h1>
            </div>


            <div className="absolute inset-0 flex items-center justify-center pt-20 z-10 pointer-events-none">
                <div className="w-65 h-65 border-4 border-white rounded-[40px] shadow-[0_0_0_1000px_rgba(0,0,0,0.3)]">
                </div>
            </div>


            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 w-full flex justify-center">
                <VioletButton
                    text={isScanning ? "Scanning..." : "Join Party"}
                    onClick={() => console.log('Trying to join...')}
                />
            </div>

            {scannerError ? (
                <div className="absolute bottom-26 left-1/2 z-20 w-[min(360px,86vw)] -translate-x-1/2 text-center">
                    <div
                        className="rounded-[18px] bg-[rgba(0,0,0,0.65)] px-4 py-3 text-sm font-semibold text-white"
                        style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
                    >
                        {scannerError}
                    </div>
                </div>
            ) : null}

            <style>
                {`

                body {
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                    position: fixed;
                    width: 100%;
                    height: 100%;
                }
                #reader video {
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: cover !important;
                }
                #reader__scan_region {
                    background: transparent !important;
                }
                #reader__dashboard {
                    display: none !important;
                }
                `}
            </style>
        </div>
    );
};

export default QRGame;
