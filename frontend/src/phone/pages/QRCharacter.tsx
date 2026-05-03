import React, { useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { VioletButton } from '../../components/VioletButton';

const QRCharacter: React.FC = () => {
    useEffect(() => {
        const html5QrCode = new Html5Qrcode("reader");

        const qrCodeSuccessCallback = (decodedText: string) => {
            console.log(`Resultado del escaneo: ${decodedText}`);
        };

        const config = {
            fps: 15,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        };

        const startScanner = async () => {
            try {
                await html5QrCode.start(
                    { facingMode: "environment" },
                    config,
                    qrCodeSuccessCallback,
                    () => { }
                );
            } catch (err) {
                console.error("Error al iniciar la cámara trasera:", err);
            }
        };

        startScanner();

        return () => {
            if (html5QrCode.isScanning) {
                html5QrCode.stop().then(() => {
                    html5QrCode.clear();
                }).catch(err => console.error("Error al detener el escáner", err));
            }
        };
    }, []);

    return (
        <div className="relative w-screen h-dvh overflow-hidden bg-black font-sans">

            {/* Camara*/}
            <div id="reader" className="absolute inset-0 w-full h-full z-0"></div>

            {/* Círculo rojo*/}
            <div className="absolute -top-[45%]  right-[-92%] -translate-x-1/2 w-[140vw] aspect-square bg-[#ED1C24] rounded-full flex items-end justify-center pb-12 z-20 shadow-2xl">
                <h1 className="text-[#FAFAFA] text-4xl font-bold leading-tight text-center px-10 mb-8">
                    Scan your QR <br /> code!
                </h1>
            </div>


            <div className="absolute inset-0 flex items-center justify-center pt-20 z-10 pointer-events-none">
                <div className="w-[260px] h-[260px] border-4 border-white rounded-[40px] shadow-[0_0_0_1000px_rgba(0,0,0,0.3)]">
                </div>
            </div>


            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 w-full flex justify-center">
                <VioletButton
                    text="Scan Me"
                    onClick={() => console.log('Intentando escanear...')}
                />
            </div>

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

export default QRCharacter;