import { useNavigate } from "react-router-dom";

import Background1 from "../../assets/onboarding/background1.svg";
import Leon1 from "../../assets/onboarding/leon1.svg";
import Corazon from "../../assets/welcome/Corazon.svg";
import Estrella3 from "../../assets/welcome/Estrella3.svg";
import Flor from "../../assets/welcome/Flor.svg";
import Estrella2 from "../../assets/welcome/Estrella2.svg";
import { OnboardingConnectCard } from "../../components/OnboardingConnectCard";
import { SkipButton } from "../../components/SkipButton";

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

        <div className="onboarding1-viewport relative z-1 mx-auto flex w-full max-w-98.25 flex-col px-6.25 pb-[env(safe-area-inset-bottom,0)] pt-8">
          <div className="flex w-full shrink-0 justify-end">
            <SkipButton navigateTo="/home-phone" />
          </div>

          <div className="mt-6 flex w-full flex-1 flex-col items-center gap-9">
            <h1
              className="m-0 max-w-71.5 text-center text-[#FAFAFA]"
              style={{
                fontFamily: "'Baloo Da', 'Baloo 2', cursive, system-ui",
                fontWeight: 800,
                fontSize: "40px",
                lineHeight: 1.15,
                letterSpacing: "-1px",
              }}
            >
              Play Your Favorite Games
            </h1>

            <div className="relative mx-auto flex w-full max-w-71.5 justify-center">
              <div
                aria-hidden
                className="pointer-events-none absolute aspect-square w-[115%] max-w-85"
                style={{
                  left: "50%",
                  top: "4%",
                  transform: "translateX(calc(-50% + clamp(10px, 3.2vw, 22px)))",
                }}
              >
                <div
                  className="absolute"
                  style={{
                    left: "1%",
                    top: "-5%",
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
                    left: "1%",
                    top: "45%",
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
                className="relative z-1 mt-2 w-full max-w-55 object-contain"
                style={{ width: "min(56vw, 207px)" }}
              />
            </div>
          </div>

          <OnboardingConnectCard
            className="mt-6 mb-8 w-full max-w-none shrink-0"
            onContinue={() => navigate("/onboarding2")}
          />
          <div className="hidden">
            <SkipButton navigateTo="/home-phone" />
          </div>
        </div>
      </div>
    </>
  );
}
