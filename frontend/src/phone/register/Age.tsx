import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useNavigate } from "react-router-dom";

import { PinkButton } from "../../components/PinkButton";
import Lion from "../../assets/register/lion.svg";
import { updatePlayerAge } from "../../lib/api";

/** Slot width (px) for horizontal snap — fits the 93px selected circle. */
const CAROUSEL_SLOT_PX = 88;

const AGES = Array.from({ length: 100 }, (_, i) => i + 1);

const INITIAL_AGE = 20;

function ageFromScrollLeft(scrollEl: HTMLDivElement): number {
  const idx = Math.round(scrollEl.scrollLeft / CAROUSEL_SLOT_PX) + 1;
  return Math.min(100, Math.max(1, idx));
}

/**
 * Age selection screen (Figma 138:1150). Red + pattern header, age carousel row, pink CTA, lion peek at bottom.
 */
export default function Age() {
  const navigate = useNavigate();
  const [selectedAge, setSelectedAge] = useState<number>(INITIAL_AGE);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const scrollRaf = useRef<number>(0);

  const scrollToAge = useCallback((age: number, behavior: ScrollBehavior) => {
    const el = carouselRef.current;
    if (!el) return;
    const left = (age - 1) * CAROUSEL_SLOT_PX;
    el.scrollTo({ left: Math.max(0, left), behavior });
  }, []);

  useLayoutEffect(() => {
    scrollToAge(INITIAL_AGE, "instant");
  }, [scrollToAge]);

  function onCarouselKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = Math.min(100, selectedAge + 1);
      setSelectedAge(next);
      scrollToAge(next, "smooth");
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = Math.max(1, selectedAge - 1);
      setSelectedAge(prev);
      scrollToAge(prev, "smooth");
    }
  }

  function onCarouselScroll() {
    const el = carouselRef.current;
    if (!el) return;
    if (scrollRaf.current) cancelAnimationFrame(scrollRaf.current);
    scrollRaf.current = requestAnimationFrame(() => {
      scrollRaf.current = 0;
      setSelectedAge(ageFromScrollLeft(el));
    });
  }

  async function handleAccept() {
    setError(null);
    setLoading(true);
    try {
      await updatePlayerAge(selectedAge);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+Da+2:wght@400;600;700&family=Nunito:wght@400;500;600;700&display=swap');

        .age-viewport {
          min-height: 100svh;
          min-height: 100dvh;
        }

        .age-carousel {
          scrollbar-width: none;
          -ms-overflow-style: none;
          touch-action: pan-x;
          overscroll-behavior-x: contain;
          box-sizing: border-box;
          width: 100%;
          scroll-snap-type: x mandatory;
          padding-inline: calc(50% - ${CAROUSEL_SLOT_PX / 2}px);
        }
        .age-carousel::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div
        className="age-viewport relative isolate flex w-full flex-col overflow-hidden bg-[#fafafa]"
        data-name="Edad"
      >
        <header
          className="relative left-1/2 isolate w-[min(165vw,100rem)] max-w-none shrink-0 -translate-x-1/2 overflow-hidden px-6 pb-[clamp(4rem,28vw,9rem)] pt-[clamp(3rem,14vw,5.75rem)] text-center shadow-[0_12px_40px_rgba(213,16,23,0.15)]"
          style={{
            backgroundColor: "#ED1C24",
            borderBottomLeftRadius: "50% min(55vw, 420px)",
            borderBottomRightRadius: "50% min(55vw, 420px)",
          }}
        >
          <div className="relative z-10 mx-auto mt-10 max-w-[320px]">
            <h1
              className="text-[40px] font-normal leading-[37px] tracking-[-1px] text-[#fafafa]"
              style={{
                fontFamily: "'Baloo Da 2', 'Baloo 2', cursive, system-ui",
              }}
            >
              Choose your Age
            </h1>
            <p
              className="mx-auto mt-4 max-w-[220px] text-base font-normal leading-6 text-[#fafafa]"
              style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
            >
              We want to get to know you better, how old are you?
            </p>
          </div>
        </header>

        <section
          className="relative z-10 flex min-h-0 flex-1 flex-col px-5 pb-[200px] pt-12"
          aria-label="Age selection"
        >
          <div
            className="pointer-events-none absolute left-1/2 top-[8%] h-[200px] w-[200px] -translate-x-1/2 rounded-full bg-[#76d6ff]/[0.07] blur-3xl"
            aria-hidden
          />

          <div className="-mx-5 mt-8 w-[calc(100%+2.5rem)] shrink-0">
            <div
              ref={carouselRef}
              role="listbox"
              aria-label="Choose age"
              aria-activedescendant={`age-option-${selectedAge}`}
              tabIndex={0}
              onScroll={onCarouselScroll}
              onKeyDown={onCarouselKeyDown}
              className="age-carousel flex touch-pan-x overflow-x-auto py-2 outline-none focus-visible:ring-2 focus-visible:ring-[#76d6ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fafafa]"
            >
              {AGES.map((age) => {
                const selected = age === selectedAge;
                return (
                  <div
                    key={age}
                    className="flex h-[93px] shrink-0 snap-center items-center justify-center"
                    style={{ width: CAROUSEL_SLOT_PX }}
                  >
                    <button
                      id={`age-option-${age}`}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      tabIndex={-1}
                      onClick={() => {
                        setSelectedAge(age);
                        scrollToAge(age, "smooth");
                      }}
                      className={[
                        "flex select-none items-center justify-center rounded-full border-2 border-transparent font-bold text-[#fafafa] shadow-sm",
                        "motion-safe:transition-[box-shadow,transform] motion-safe:duration-150",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#76d6ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fafafa]",
                        "[@media(hover:hover)]:hover:shadow-md",
                        selected
                          ? "h-[93px] w-[93px] bg-[#76d6ff] text-[42px] tracking-[-1.4px] shadow-[0_8px_24px_rgba(118,214,255,0.45)]"
                          : "h-[66px] w-[66px] bg-[#d9d9d9] text-[30px] tracking-[-1px]",
                      ].join(" ")}
                      style={{
                        fontFamily: "'Baloo Da 2', 'Baloo 2', cursive, system-ui",
                      }}
                      aria-label={`Age ${age}`}
                    >
                      {age}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {error && (
            <p
              className="relative z-10 mx-auto mt-6 max-w-[280px] text-center text-sm text-[#d51017]"
              role="alert"
              style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
            >
              {error}
            </p>
          )}

          <div className="relative z-10 mx-auto mt-14 flex justify-center">
            <PinkButton
              text={loading ? "Saving…" : "Accept"}
              onClick={handleAccept}
              disabled={loading}
            />
          </div>
        </section>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center"
          aria-hidden
        >
          <img
            src={Lion}
            alt=""
            className="w-[min(247px,70vw)] max-w-[247px] translate-y-[2px] object-contain object-bottom"
          />
        </div>
      </div>
    </>
  );
}
