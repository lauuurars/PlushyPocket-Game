import React, { useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { VioletButton } from '../../components/VioletButton';

const QRGame: React.FC = () => {
    useEffect(() => {
        const html5QrCode = new Html5Qrcode("reader");
        const qrCodeSuccessCallback = (decodedText: string) => {
            console.log(`Scan result: ${decodedText}`);
        };

        // Ajustamos el qrbox para que sea responsive al ancho del celular
        const config = {
            fps: 15,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        };

        // Forzamos cámara trasera (environment)
        html5QrCode.start(
            { facingMode: "environment" },
            config,
            qrCodeSuccessCallback,
            () => { /* ignore errors */ }
        ).catch((err) => {
            console.error("No se pudo iniciar el escáner: ", err);
        });

        return () => {
            if (html5QrCode.isScanning) {
                html5QrCode.stop().then(() => {
                    html5QrCode.clear();
                }).catch(err => console.error("Error al detener", err));
            }
        };
    }, []);

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-black font-sans">

            {/* 1. CAMARA COMO FONDO (Ocupa todo) */}
            <div id="reader" className="absolute inset-0 w-full h-full z-0"></div>

        
            <div className="absolute -top-[20] left-1/2 -translate-x-1/2 w-[140vw] aspect-square bg-[#ED1C24] rounded-full flex items-end justify-center pb-12 z-10 shadow-2xl">
                <h1 className="text-[#FAFAFA] text-4xl font-bold leading-tight text-center px-20 mb-4">
                    Scan your <br /> game QR code!
                </h1>
            </div>

            {/* 3. GUÍA VISUAL CENTRAL (El recuadro blanco) */}
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="w-[280px] h-[280px] border-4 border-white rounded-[40px] relative">
                    {/* Esquinitas o brillo (opcional) */}
                    <div className="absolute inset-0 border-2 border-white/20 rounded-[36px]"></div>
                </div>
            </div>

            {/* 4. BOTÓN INFERIOR */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 w-full flex justify-center">
                <VioletButton
                    text="Join Party"
                    onClick={() => console.log('Join Party...')}
                />
            </div>

            {/* ESTILOS PARA FORZAR FULL SCREEN */}
            <style>
                {`
                #reader video {
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: cover !important;
                }
                /* Quitamos cualquier borde o interfaz extra de la librería */
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