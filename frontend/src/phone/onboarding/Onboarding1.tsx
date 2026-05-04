import { useNavigate } from "react-router-dom";

import Background1 from "../../assets/onboarding/background1.svg";
import Leon1 from "../../assets/onboarding/leon1.svg";
import Corazon from "../../assets/welcome/Corazon.svg";
import Estrella3 from "../../assets/welcome/Estrella3.svg";
import Flor from "../../assets/welcome/Flor.svg";
import Estrella2 from "../../assets/welcome/Estrella2.svg";
import { OnboardingConnectCard } from "../../components/OnboardingConnectCard";

/**
 * Onboarding step 1 (Figma 959:1207). Full-bleed red + pattern, lion hero,
 * floating stickers, bottom connect card.
 */
export default function Onboarding1() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+Da+2:wght@400;600;700&display=swap');

        @keyframes onboarding-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .onboarding1-viewport {
          min-height: 100svh;
          min-height: 100dvh;
        }
      `}</style>
      <div
        className="onboarding1-viewport relative isolate w-full overflow-hidden"
        style={{ backgroundColor: "#ED1C24" }}
      >
        <img
          src={Background1}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 h-full w-full max-h-none object-cover object-center"
        />

        <div className="onboarding1-viewport relative z-1 mx-auto flex w-full max-w-[393px] flex-col px-[25px] pb-[env(safe-area-inset-bottom,0)] pt-8">
          <div className="flex w-full shrink-0 justify-end">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="shrink-0 cursor-pointer rounded-[25px] border-0 bg-[#76D6FF] px-8 py-2 text-[15px] font-medium text-[#FAFAFA] shadow-[0px_2.5px_3.4px_rgba(94,94,94,0.19)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
              style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
            >
              Skip
            </button>
          </div>

          <div className="mt-6 flex w-full flex-1 flex-col items-center gap-9">
            <h1
              className="m-0 max-w-[286px] text-center text-[#FAFAFA]"
              style={{
                fontFamily: "'Baloo Da 2', 'Baloo 2', cursive, system-ui",
                fontWeight: 600,
                fontSize: "clamp(32px, 10vw, 40px)",
                lineHeight: 1.15,
                letterSpacing: "-1px",
              }}
            >
              Play Your Favorite Games
            </h1>

            <div className="relative mx-auto flex w-full max-w-[286px] justify-center">
              <div
                aria-hidden
                className="pointer-events-none absolute aspect-square w-[115%] max-w-[340px]"
                style={{
                  left: "50%",
                  top: "4%",
                  transform: "translateX(calc(-50% + clamp(10px, 3.2vw, 22px)))",
                }}
              >
                <div
                  className="absolute"
                  style={{
                    left: "8%",
                    top: "0%",
                    animation: "onboarding-float 3.2s ease-in-out infinite",
                  }}
                >
                  <img
                    src={Estrella3}
                    alt=""
                    width={46}
                    height={46}
                    style={{ transform: "rotate(-12deg)" }}
                  />
                </div>
                <div
                  className="absolute"
                  style={{
                    right: "6%",
                    top: "2%",
                    animation: "onboarding-float 3.5s ease-in-out infinite 0.15s",
                  }}
                >
                  <img
                    src={Flor}
                    alt=""
                    width={40}
                    height={42}
                    style={{ transform: "rotate(10deg)" }}
                  />
                </div>
                <div
                  className="absolute"
                  style={{
                    left: "2%",
                    top: "42%",
                    animation: "onboarding-float 3.4s ease-in-out infinite 0.3s",
                  }}
                >
                  <img
                    src={Estrella2}
                    alt=""
                    width={36}
                    height={48}
                    style={{ transform: "rotate(18deg)" }}
                  />
                </div>
                <div
                  className="absolute"
                  style={{
                    right: "4%",
                    top: "38%",
                    animation: "onboarding-float 3.3s ease-in-out infinite 0.45s",
                  }}
                >
                  <img
                    src={Corazon}
                    alt=""
                    width={42}
                    height={38}
                    style={{ transform: "rotate(-8deg)" }}
                  />
                </div>
              </div>

              <img
                src={Leon1}
                alt="Plushy lion"
                className="relative z-1 mt-2 w-full max-w-[220px] object-contain"
                style={{ width: "min(56vw, 207px)" }}
              />
            </div>
          </div>

          <OnboardingConnectCard
            className="mt-6 w-full max-w-none shrink-0"
            onContinue={() => navigate("/")}
          />
        </div>
      </div>
    </>
  );
}
