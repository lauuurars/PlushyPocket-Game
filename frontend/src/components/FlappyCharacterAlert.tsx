import React from 'react';
import { X } from "lucide-react";

interface FlappyCharacterAlertProps {
    isOpen: boolean;
    characterName: string;
    characterImageUrl: string;
    onClose: () => void;
    onConfirm: () => void;
}

const FlappyCharacterAlert: React.FC<FlappyCharacterAlertProps> = ({
    isOpen,
    characterName,
    characterImageUrl,
    onClose,
    onConfirm,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative bg-white w-full max-w-[340px] rounded-[40px] p-8 flex flex-col items-center text-center shadow-2xl animate-in zoom-in-95 duration-300">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute -top-4 -right-4 w-12 h-12 bg-[#ED1C24] rounded-full flex items-center justify-center text-white active:scale-90 transition-transform"
                >
                    <X size={24} strokeWidth={3} />
                </button>

                {/* Title */}
                <h2
                    className="text-[#ED1C24] text-3xl font-black mb-6 leading-tight"
                    style={{ fontFamily: "'Baloo 2', system-ui, sans-serif" }}
                >
                    Play as this<br />character?
                </h2>

                {/* Character Avatar */}
                <div className="w-28 h-28 rounded-full border-[3px] border-[#ED1C24] flex items-center justify-center mb-4 overflow-hidden bg-white">
                    <img
                        src={characterImageUrl}
                        alt={characterName}
                        className="w-[80%] h-[80%] object-contain"
                    />
                </div>

                {/* Character Name */}
                <p
                    className="text-[#583921] text-base font-semibold mb-1"
                    style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
                >
                    {characterName}
                </p>

                {/* Description */}
                <p
                    className="text-[#583921] text-sm leading-relaxed mb-7 px-2"
                    style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
                >
                    Use this character to play<br />
                    <span className="font-bold">Flappy Bird</span>!
                </p>

                {/* Confirm Button */}
                <button
                    onClick={onConfirm}
                    className="w-full bg-[#ED1C24] py-4 rounded-full text-white font-bold text-xl active:scale-95 transition-transform"
                    style={{ fontFamily: "'Baloo 2', system-ui, sans-serif" }}
                >
                    Confirm
                </button>
            </div>
        </div>
    );
};

export default FlappyCharacterAlert;
