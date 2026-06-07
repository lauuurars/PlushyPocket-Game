import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Background from "../../assets/onboarding/background.svg";
import PlushyLogo from "../../assets/welcome/Plushy-Logo.png";
import Pinguino from "../../assets/onboarding/pinguino.svg";
import Corazon from "../../assets/welcome/Corazon.svg";
import Estrella3 from "../../assets/welcome/Estrella3.svg";
import Flor from "../../assets/welcome/Flor.svg";
import Estrella2 from "../../assets/welcome/Estrella2.svg";
import { supabase } from "../../lib/supabaseClient";
import { fetchAuthMe, isRecordedAgeComplete, isCharacterSelectionComplete } from "../../lib/api";

export default function LoadingScreen() {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsExiting(true);
      setTimeout(async () => {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          navigate("/signup", { replace: true });
          return;
        }

        try {
                const me = await fetchAuthMe(session.access_token);

                if (!isRecordedAgeComplete(me.age)) {
                    navigate("/age", { replace: true });
                    return;
                }

                if (!isCharacterSelectionComplete(me.character_selected)) {
                    navigate("/choose-character", { replace: true });
                    return;
                }

                navigate("/home-phone", { replace: true });
            } catch {
                navigate("/signup", { replace: true });
            }
      }, 500);
    }, 2300);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600&display=swap');

        @keyframes loading-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9) translateY(-10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes fade-out {
          from { opacity: 1; }
          to   { opacity: 0; }
        }

        @keyframes scatter-in {
          0%   { transform: scale(0) rotate(-30deg); opacity: 0; }
          70%  { transform: scale(1.2) rotate(5deg);  opacity: 1; }
          100% { transform: scale(1)   rotate(0deg);  opacity: 1; }
        }

        .loading-screen-viewport {
          min-height: 100svh;
          min-height: 100dvh;
        }

        .loading-exit {
          animation: fade-out 0.5s ease-in-out forwards;
        }

        .animate-welcome-text {
          animation: fade-in-up 0.8s ease-out 0.2s both;
        }

        .animate-logo {
          animation: scale-in 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s both;
        }

        .animate-by-miniso {
          animation: fade-in-up 0.8s ease-out 0.6s both;
        }

        .animate-pinguino {
          animation: fade-in-up 0.8s ease-out 0.8s both;
        }
      `}</style>

      <div
        className={`loading-screen-viewport relative isolate w-full overflow-hidden ${isExiting ? 'loading-exit' : ''}`}
        style={{ backgroundColor: "#ED1C24" }}
      >
        {/* Fondo */}
        <img
          src={Background}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 h-full w-full max-h-none object-cover object-center"
        />

        <div className="loading-screen-viewport relative z-1 mx-auto w-full max-w-98.25">

          {/* ── Bloque central: Welcome to + Logo + by MINISO ── */}
          <div
            className="absolute left-1/2 top-1/2 pb-10"
            style={{ transform: "translate(-50%, -60%)" }}
          >
            <div className="flex flex-col items-center gap-2">
              <p
                className="m-0 whitespace-nowrap text-white animate-welcome-text"
                style={{
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
                className="animate-logo"
                style={{ width: "clamp(200px, 70vw, 275px)" }}
              >
                <img src={PlushyLogo} alt="Plushy Pocket" className="block w-full" />
              </div>

              <p
                className="m-0 whitespace-nowrap animate-by-miniso"
                style={{
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
            </div>
          </div>

          {/* ── Elementos decorativos flotantes ── */}
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
                animation: "loading-float 3.2s ease-in-out infinite, scatter-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.9s both",
              }}
            >
              <img src={Corazon} alt="" width={44} height={40} style={{ transform: "rotate(-3.34deg)" }} />
            </div>
            <div
              className="absolute"
              style={{
                left: "30%",
                top: "0%",
                animation: "loading-float 3.6s ease-in-out infinite 0.2s, scatter-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 1s both",
              }}
            >
              <img src={Estrella3} alt="" width={50} height={50} style={{ transform: "rotate(27.01deg)" }} />
            </div>
            <div
              className="absolute"
              style={{
                left: "52%",
                top: "4%",
                animation: "loading-float 3.4s ease-in-out infinite 0.35s, scatter-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 1.1s both",
              }}
            >
              <img src={Flor} alt="" width={40} height={42} style={{ transform: "rotate(-11.48deg)" }} />
            </div>
            <div
              className="absolute"
              style={{
                left: "76%",
                top: "22%",
                animation: "loading-float 3.3s ease-in-out infinite 0.5s, scatter-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 1.2s both",
              }}
            >
              <img src={Estrella2} alt="" width={38} height={50} style={{ transform: "rotate(26.42deg)" }} />
            </div>
          </div>

          {/* ── Pingüino ── */}
          <div
            className="absolute flex w-full items-end justify-center animate-pinguino"
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
                maxWidth: 270,
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