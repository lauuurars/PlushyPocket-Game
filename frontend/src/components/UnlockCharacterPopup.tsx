import React from 'react';
import { Lock, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UnlockCharacterPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

const UnlockCharacterPopup: React.FC<UnlockCharacterPopupProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative bg-[#F8F9FA] w-full max-w-sm rounded-[40px] p-8 flex flex-col items-center text-center shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute -top-4 -right-4 w-12 h-12 bg-[#ED1C24] rounded-full flex items-center justify-center text-white active:scale-90 transition-transform"
                >
                    <X size={24} strokeWidth={3} />
                </button>

                <h2 className="text-[#ED1C24] text-3xl font-black mb-6 leading-tight font-['Baloo_2']">
                    Do you want to unlock<br/>this character?
                </h2>

                <div className="w-24 h-24 rounded-full border-[4px] border-[#ED1C24] flex items-center justify-center mb-6">
                    <Lock size={48} className="text-[#ED1C24]" strokeWidth={2} />
                </div>

                <p className="text-[#583921] text-[22px] font-medium leading-tight mb-10 px-2">
                    Scan the QR code<br/>to unlock it
                </p>

                <button
                    onClick={() => navigate("/qr-character")}
                    className="w-48 bg-[#ED1C24] py-3 rounded-[30px] text-white font-bold text-xl active:scale-95 transition-transform"
                >
                    Unlock
                </button>
            </div>
        </div>
    );
};

export default UnlockCharacterPopup;
