import { useNavigate } from "react-router-dom";

import Background3 from "../../assets/onboarding/Bg3.svg";
import YukiMochi from "../../assets/onboarding/Yuki-Mochi.svg";
import Corazon from "../../assets/welcome/Corazon.svg";
import Estrella2 from "../../assets/welcome/Estrella2.svg";
import Flor from "../../assets/welcome/Flor.svg";
import Rayo from "../../assets/error404/rayo.svg";
import { OnboardingConnectCard } from "../../components/OnboardingConnectCard";
import { SkipButton } from "../../components/SkipButton";

export default function Onboarding3() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+Da+2:wght@400;600;700&display=swap');

        @keyframes onboarding-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .onboarding3-viewport {
          min-height: 100svh;
          min-height: 100dvh;
        }
      `}</style>
      <div
        className="onboarding3-viewport relative isolate w-full overflow-hidden"
        style={{ backgroundColor: "#ED1C24" }}
      >
        <img
          src={Background3}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 h-full w-full max-h-none object-cover object-center"
        />

        <div className="onboarding3-viewport relative z-1 mx-auto flex w-full max-w-98.25 flex-col px-6.25 pb-[env(safe-area-inset-bottom,0)] pt-8">
          <div className="flex w-full shrink-0 justify-end">
            <SkipButton navigateTo="/signup" />
          </div>

          <div className="mt-6 flex w-full flex-1 flex-col items-center gap-9">
            <h1
              className="m-0 max-w-71.5 text-center text-[#FAFAFA]"
              style={{
                fontFamily: "'Baloo Da', 'Baloo 2', system-ui",
                fontWeight: 800,
                fontSize: "45px",
                lineHeight: 1.15,
                letterSpacing: "-1px",
              }}
            >
              Play as a <br /> couple
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
                    top: "-12%",
                    animation: "onboarding-float 3.2s ease-in-out infinite",
                  }}
                >
                  <img
                    src={Flor}
                    alt=""
                    width={43}
                    height={44}
                    style={{ transform: "rotate(-14deg)" }}
                  />
                </div>
                <div
                  className="absolute"
                  style={{
                    right: "9%",
                    top: "-13%",
                    animation: "onboarding-float 3.5s ease-in-out infinite 0.15s",
                  }}
                >
                  <img
                    src={Rayo}
                    alt=""
                    width={44}
                    height={72}
                    style={{ transform: "rotate(17deg)" }}
                  />
                </div>
                <div
                  className="absolute"
                  style={{
                    left: "-4%",
                    top: "48%",
                    animation: "onboarding-float 3.4s ease-in-out infinite 0.3s",
                  }}
                >
                  <img
                    src={Estrella2}
                    alt=""
                    width={35}
                    height={60}
                    style={{ transform: "rotate(-32deg)" }}
                  />
                </div>
                <div
                  className="absolute"
                  style={{
                    right: "-1%",
                    top: "55%",
                    animation: "onboarding-float 3.3s ease-in-out infinite 0.45s",
                  }}
                >
                  <img
                    src={Corazon}
                    alt=""
                    width={40}
                    height={40}
                    style={{ transform: "rotate(18deg)" }}
                  />
                </div>
              </div>

              <img
                src={YukiMochi}
                alt="Yuki and Mochi plushies"
                className="relative z-1 mt-1 mb-2 object-contain"
                style={{ 
                        width: "280px",
                        height: "auto",
                }}
              />
            </div>
          </div>

          <OnboardingConnectCard
            className="mt-6 mb-8 w-full max-w-none shrink-0"
            onContinue={() => navigate("/")}
            text="Our games are designed to be played in pairs, so you can enjoy and share the experience with your favorite people."
            dotsVariant="third"
          />
        </div>
      </div>
    </>
  );
}
