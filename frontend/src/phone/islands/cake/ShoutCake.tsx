import { useCallback, useEffect, useRef, useState } from "react";

import backgroundSvg from "../../../assets/cake/background.svg";
import koala1Svg from "../../../assets/cake/koala1.svg";
import koala2Svg from "../../../assets/cake/koala2.svg";
import koala3Svg from "../../../assets/cake/koala3.svg";

/** Top → bottom: red (high) through yellow, pink, blue (low). Matches Figma node 303:5864. */
const SEGMENT_COLORS = [
  "#ed1c24",
  "#ed1c24",
  "#ed1c24",
  "#ffe23f",
  "#ffe23f",
  "#ffe23f",
  "#ff7be2",
  "#ff7be2",
  "#ff7be2",
  "#76d6ff",
  "#76d6ff",
] as const;

const KOALA_BY_TIER = [koala1Svg, koala2Svg, koala3Svg] as const;

const TOTAL_SEGMENTS = SEGMENT_COLORS.length;

const POINTS_MAX = 250;

/** RMS (~0–1) where yelling roughly peaks; tuned for getFloatTimeDomainData. */
const RMS_SENSITIVITY = 0.12;

/** Faster rise when loud, slower fall when quiet (VU-style). */
const LEVEL_ATTACK = 0.45;
const LEVEL_RELEASE = 0.12;

function tierFromFilled(filled: number): 0 | 1 | 2 {
  // KOALA_BY_TIER = [koala1, koala2, koala3]: 0–3 → koala3, 4–7 → koala2, 8–11 → koala1
  if (filled <= 3) return 2;
  if (filled <= 7) return 1;
  return 0;
}

export default function ShoutCake() {
  const [filledSegments, setFilledSegments] = useState(0);
  const [koalaTier, setKoalaTier] = useState<0 | 1 | 2>(2);
  const [micHint, setMicHint] = useState<string | null>(null);
  const [needsTap, setNeedsTap] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const levelRef = useRef(0);
  const rafRef = useRef(0);
  const dataRef = useRef<Float32Array | null>(null);

  const resumeAudio = useCallback(async () => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    try {
      await ctx.resume();
      setNeedsTap(false);
      setMicHint(null);
    } catch {
      setMicHint("Could not start audio. Try again.");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loop = () => {
      const analyser = analyserRef.current;
      if (!analyser || cancelled) return;

      let data = dataRef.current;
      if (!data || data.length !== analyser.fftSize) {
        data = new Float32Array(analyser.fftSize);
        dataRef.current = data;
      }
      analyser.getFloatTimeDomainData(
        data as Parameters<AnalyserNode["getFloatTimeDomainData"]>[0],
      );

      let sumSq = 0;
      for (let i = 0; i < data.length; i++) {
        const v = data[i];
        sumSq += v * v;
      }
      const rms = Math.sqrt(sumSq / data.length);
      let target = rms / RMS_SENSITIVITY;
      target = Math.min(1, Math.max(0, target));

      const prev = levelRef.current;
      const k = target > prev ? LEVEL_ATTACK : LEVEL_RELEASE;
      levelRef.current = prev + (target - prev) * k;

      const filled = Math.round(levelRef.current * TOTAL_SEGMENTS);
      const clamped = Math.min(TOTAL_SEGMENTS, Math.max(0, filled));

      setFilledSegments((p) => (p !== clamped ? clamped : p));

      const tier = tierFromFilled(clamped);
      setKoalaTier((t) => (t !== tier ? tier : t));

      rafRef.current = requestAnimationFrame(loop);
    };

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: false,
            autoGainControl: false,
          },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        const ctx = new AudioContext();
        audioCtxRef.current = ctx;

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.55;
        source.connect(analyser);
        analyserRef.current = analyser;

        if (ctx.state === "suspended") {
          setNeedsTap(true);
        }

        rafRef.current = requestAnimationFrame(loop);
      } catch {
        if (!cancelled) {
          setMicHint("Microphone access denied or unavailable.");
          setFilledSegments(0);
          setKoalaTier(2);
        }
      }
    };

    void start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      void audioCtxRef.current?.close();
      audioCtxRef.current = null;
      analyserRef.current = null;
      levelRef.current = 0;
    };
  }, []);

  const fillFromIndex = TOTAL_SEGMENTS - filledSegments;
  const koalaSrc = KOALA_BY_TIER[koalaTier];
  const displayPoints = Math.round(
    (filledSegments / TOTAL_SEGMENTS) * POINTS_MAX,
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+Da+2:wght@400;600;700&display=swap');
      `}</style>
      <div
        className="relative isolate mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[#fafafa]"
        data-name="Shout Cake"
      >
        <img
          src={backgroundSvg}
          alt=""
          className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-center select-none"
          draggable={false}
          aria-hidden
        />

        {/* Red header dome */}
        <header className="relative z-10 shrink-0 px-6 pb-14 pt-[max(3rem,env(safe-area-inset-top))] text-center">
          <div
            className="pointer-events-none absolute left-1/2 top-0 -z-10 aspect-square w-[min(125vw,520px)] max-w-none -translate-x-1/2 translate-y-[-46%] rounded-full bg-[#ed1c24]"
            aria-hidden
          />
          <div className="relative mx-auto max-w-[260px] pt-2">
            <p
              className="text-[40px] leading-[37px] tracking-[-1px] text-[#fafafa]"
              style={{ fontFamily: "'Baloo Da 2', system-ui, sans-serif" }}
            >
              Yell as loud as you can!
            </p>
          </div>
          {needsTap ? (
            <div className="relative mt-4">
              <button
                type="button"
                onClick={() => void resumeAudio()}
                className="rounded-full bg-[#fafafa] px-5 py-2 text-sm font-semibold text-[#ed1c24] shadow-md active:scale-[0.98]"
                style={{ fontFamily: "'Baloo Da 2', system-ui, sans-serif" }}
              >
                Enable microphone
              </button>
            </div>
          ) : null}
          {micHint && !needsTap ? (
            <p
              className="relative mt-3 text-sm text-[#583921]/90"
              style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
            >
              {micHint}
            </p>
          ) : null}
        </header>

        {/* Koala + meter */}
        <div className="relative z-10 flex flex-1 flex-row items-end justify-center gap-5 px-5 pb-8 pt-4">
          <div className="flex max-w-[58%] flex-1 justify-end pb-2">
            <img
              src={koalaSrc}
              alt=""
              className="w-full max-w-[220px] rotate-[-5.5deg] select-none drop-shadow-[0_6px_0_rgba(0,0,0,0.06)]"
              draggable={false}
            />
          </div>

          <div
            className="mb-6 flex h-[min(52vh,346px)] w-11 shrink-0 flex-col overflow-hidden rounded-[13px] border-[3px] border-solid border-[#3e2512] bg-[#3e2512]"
            aria-hidden
          >
            {SEGMENT_COLORS.map((color, index) => {
              const isLit = index >= fillFromIndex;
              return (
                <div
                  key={index}
                  className="min-h-0 flex-1"
                  style={{
                    backgroundColor: isLit ? color : "#d4cfc9",
                  }}
                />
              );
            })}
          </div>
        </div>

        <footer className="relative z-10 shrink-0 pb-[max(2rem,env(safe-area-inset-bottom))] text-center">
          <p
            className="text-[50px] leading-[37px] tracking-[-1px] text-[#ed1c24]"
            style={{ fontFamily: "'Baloo Da 2', system-ui, sans-serif" }}
          >
            Game Points
          </p>
          <p
            className="mt-3 text-[35px] leading-[37px] tracking-[-1px] text-[#583921]"
            style={{ fontFamily: "'Baloo Da 2', system-ui, sans-serif" }}
          >
            {displayPoints} pts
          </p>
        </footer>
      </div>
    </>
  );
}
