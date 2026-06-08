import React from 'react';
import instructionsImg from '../assets/cake/cakeInstructions.svg';

interface Props {
  onStart: () => void;
}

const CakeInstructionsModal: React.FC<Props> = ({ onStart }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-5">
      <div className="flex w-full max-w-140 flex-col items-center rounded-[40px] bg-[#FAFAFA] p-10 pb-10 text-center shadow-2xl" style={{ animation: 'scaleIn 0.4s ease-out' }}>
        <style>{`
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
        
        <img src={instructionsImg} alt="Instructions" className="h-[160px] w-auto mb-6 object-contain" />
        
        <h2 
          className="mb-3 text-[34px] font-extrabold text-[#ED1C24] leading-tight"
          style={{ fontFamily: '"Baloo 2", system-ui, sans-serif' }}
        >
          Shout Cake
        </h2>
        
        <p className="text-[20px] font-semibold text-[#583921] leading-[1.4] mb-8 px-4" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
          In this game, you have to <span className="font-bold">yell at your phone</span> to throw the cake at the other player
        </p>

        <button
          onClick={onStart}
          className="bg-[#ED1C24] text-white font-bold text-[22px] px-12 py-3 rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
          style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}
        >
          Start Now
        </button>
      </div>
    </div>
  );
};

export default CakeInstructionsModal;
