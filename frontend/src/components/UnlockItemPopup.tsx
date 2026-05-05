import React from 'react';
import { Camera, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UnlockItemPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

const UnlockItemPopup: React.FC<UnlockItemPopupProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

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

                <h2 className="text-[#ED1C24] text-3xl font-black mb-6 leading-tight">
                    Unlock a new item!
                </h2>

                <div className="w-32 h-32 rounded-full border-5 border-[#ED1C24] flex items-center justify-center mb-8">
                    <Camera size={64} className="text-[#ED1C24]" />
                </div>

                <p className="text-[#583921] text-lg leading-relaxed mb-10 px-2">
                    Open your phone's camera to scan the QR code and get a new item.
                </p>

                <button
                    onClick={() => navigate("/qr-character")}
                    className="w-full bg-[#ED1C24] py-4 rounded-full text-white font-bold text-xl active:scale-95 transition-transform"
                >
                    Get Item
                </button>
            </div>
        </div>
    );
};

export default UnlockItemPopup;
