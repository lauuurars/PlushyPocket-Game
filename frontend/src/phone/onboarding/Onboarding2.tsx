import { useNavigate } from "react-router-dom";

import Background2 from "../../assets/onboarding/Bg2.svg";
import WinMisu from "../../assets/onboarding/WinMisu.svg";
import Corazon from "../../assets/welcome/Corazon.svg";
import Corona from "../../assets/welcome/Corona.svg";
import RayoRosa from "../../assets/join/RayoRosa.svg";
import Estrella1 from "../../assets/welcome/Estrella1.svg";
import { OnboardingConnectCard } from "../../components/OnboardingConnectCard";
import { SkipButton } from "../../components/SkipButton";

export default function Onboarding2() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+Da+2:wght@400;600;700&display=swap');

        @keyframes onboarding-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .onboarding2-viewport {
          min-height: 100svh;
          min-height: 100dvh;
        }
      `}</style>
      <div
        className="onboarding2-viewport relative isolate w-full overflow-hidden"
        style={{ backgroundColor: "#ED1C24" }}
      >
        <img
          src={Background2}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 h-full w-full max-h-none object-cover object-center"
        />

        <div className="onboarding2-viewport relative z-1 mx-auto flex w-full max-w-98.25 flex-col px-6.25 pb-[env(safe-area-inset-bottom,0)] pt-8">
          <div className="flex w-full shrink-0 justify-end">
            <SkipButton navigateTo="/home-phone" />
          </div>

          <div className="mt-6 flex w-full flex-1 flex-col items-center gap-9">
            <h1
              className="m-0 max-w-71.5 text-center text-[#FAFAFA]"
              style={{
                fontFamily: "'Baloo Da', 'Baloo 2', system-ui",
                fontWeight: 800,
                fontSize: "40px",
                lineHeight: 1.15,
                letterSpacing: "-1px",
              }}
            >
              Win amazing rewards
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
                    left: "-2%",
                    top: "0%",
                    animation: "onboarding-float 3.2s ease-in-out infinite",
                  }}
                >
                  <img
                    src={Estrella1}
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
                    src={Corona}
                    alt=""
                    width={46}
                    style={{ transform: "rotate(10deg)" }}
                  />
                </div>
                <div
                  className="absolute"
                  style={{
                    left: "2%",
                    top: "50%",
                    animation: "onboarding-float 3.4s ease-in-out infinite 0.3s",
                  }}
                >
                  <img
                    src={RayoRosa}
                    alt=""
                    width={32}
                    height={64}
                    style={{ transform: "rotate(-40deg)" }}
                  />
                </div>
                <div
                  className="absolute"
                  style={{
                    right: "4%",
                    top: "48%",
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
                src={WinMisu}
                alt="Plushy Misu with trophy"
                className="relative z-1 mt-1 mb-2 w-full max-w-55 object-contain"
                style={{ width: "max(100vw, 207px)" }}
              />
            </div>
          </div>

          <OnboardingConnectCard
            className="mt-6 mb-8 w-full max-w-none shrink-0"
            onContinue={() => navigate("/onboarding3")}
            text="Connect your gaming accounts and track your playtime across all platforms"
            dotsVariant="second"
          />
        </div>
      </div>
    </>
  );
}
