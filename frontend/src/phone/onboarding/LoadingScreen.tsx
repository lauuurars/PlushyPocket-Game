import Background from "../../assets/onboarding/background.svg";
import PlushyLogo from "../../assets/welcome/Plushy-Logo.png";
import Pinguino from "../../assets/onboarding/pinguino.svg";
import Corazon from "../../assets/welcome/Corazon.svg";
import Estrella3 from "../../assets/welcome/Estrella3.svg";
import Flor from "../../assets/welcome/Flor.svg";
import Estrella2 from "../../assets/welcome/Estrella2.svg";

/**
 * Mobile onboarding loading / welcome frame (Figma node 124:198).
 * Reference artboard 393×852; content is laid out in a centered column while
 * the background covers the full viewport on any mobile aspect ratio.
 */
export default function LoadingScreen() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600&display=swap');

        @keyframes loading-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .loading-screen-viewport {
          min-height: 100svh;
          min-height: 100dvh;
        }
      `}</style>
      <div
        className="loading-screen-viewport relative isolate w-full overflow-hidden"
        style={{
          backgroundColor: "#ED1C24",
        }}
      >
        <img
          src={Background}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 h-full w-full max-h-none object-cover object-center"
        />

        <div className="loading-screen-viewport relative z-1 mx-auto w-full max-w-[393px]">
          <p
            className="absolute m-0 whitespace-nowrap text-white"
            style={{
              left: "50%",
              top: `${(204 / 852) * 100}%`,
              transform: "translateX(-50%)",
              fontFamily: "'Poppins', system-ui, sans-serif",
              fontWeight: 600,
              fontSize: "clamp(22px, 7.12vw, 28px)",
              lineHeight: 1.5,
              letterSpacing: "-0.532px",
            }}
          >
            Welcome to
          </p>

          <div
            className="absolute"
            style={{
              left: "50%",
              top: `${(255 / 852) * 100}%`,
              transform: "translateX(-50%)",
              width: `${(274.683 / 393) * 100}%`,
              maxWidth: 275,
            }}
          >
            <img src={PlushyLogo} alt="Plushy Pocket" className="block size-full max-w-none" />
          </div>

          <p
            className="absolute m-0 whitespace-nowrap"
            style={{
              left: "50%",
              top: `${(418 / 852) * 100}%`,
              transform: "translateX(-50%)",
              fontFamily: "'Cal Sans', 'Nunito', system-ui, sans-serif",
              fontWeight: 500,
              fontSize: "clamp(26px, 9.1vw, 35.79px)",
              lineHeight: 1.5,
              letterSpacing: "-0.68px",
              color: "#FFFDF6",
            }}
          >
            by MINISO
          </p>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0"
            style={{
              top: `${(520 / 852) * 100}%`,
              height: `${(120 / 852) * 100}%`,
              minHeight: 72,
              transform: "translateX(clamp(10px, 3.2vw, 22px))",
            }}
          >
            <div
              className="absolute"
              style={{
                left: "5.5%",
                top: "18%",
                animation: "loading-float 3.2s ease-in-out infinite",
              }}
            >
              <img src={Corazon} alt="" width={44} height={40} style={{ transform: "rotate(-3.34deg)" }} />
            </div>
            <div
              className="absolute"
              style={{
                left: "30%",
                top: "0%",
                animation: "loading-float 3.6s ease-in-out infinite 0.2s",
              }}
            >
              <img src={Estrella3} alt="" width={50} height={50} style={{ transform: "rotate(27.01deg)" }} />
            </div>
            <div
              className="absolute"
              style={{
                left: "52%",
                top: "4%",
                animation: "loading-float 3.4s ease-in-out infinite 0.35s",
              }}
            >
              <img src={Flor} alt="" width={40} height={42} style={{ transform: "rotate(-11.48deg)" }} />
            </div>
            <div
              className="absolute"
              style={{
                left: "76%",
                top: "22%",
                animation: "loading-float 3.3s ease-in-out infinite 0.5s",
              }}
            >
              <img src={Estrella2} alt="" width={38} height={50} style={{ transform: "rotate(26.42deg)" }} />
            </div>
          </div>

          <div
            className="absolute flex w-full items-end justify-center"
            style={{
              left: 0,
              bottom: 0,
              paddingBottom: "env(safe-area-inset-bottom, 0)",
            }}
          >
            <img
              src={Pinguino}
              alt="Plushy Pocket penguin"
              className="block max-w-none"
              style={{
                width: `${(316 / 393) * 100}%`,
                maxWidth: 316,
                height: "auto",
                transform: "translateY(6%)",
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
