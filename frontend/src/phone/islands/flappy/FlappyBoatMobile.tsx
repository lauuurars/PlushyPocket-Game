import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Socket } from "socket.io-client";
import { createRealtimeSocket, fetchPartyRoomUserProfile } from "../../../lib/api";
import { getRoomState, updateRoomState } from "../../../lib/roomStore";
import bigBoat from "../../../assets/flappybird/bigBoat.png";

export default function FlappyGame() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");

  const [score, setScore] = useState(0);
  const [tapFeedback, setTapFeedback] = useState(false);

  // Gyroscope
  const [gyroPermission, setGyroPermission] = useState<boolean | null>(null);
  const motionInitialYRef = useRef<number | null>(null);
  const canGyroJumpRef = useRef(true);

  const socketRef = useRef<Socket | null>(null);
  const userIdRef = useRef<string>("");
  const characterIdRef = useRef<string>("mochi");
  const touchFiredRef = useRef(false);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!roomId) return;

    let cancelled = false;
    const existing = getRoomState();
    const socket = existing.socket?.connected
      ? (existing.socket as unknown as Socket)
      : (() => {
        const s = createRealtimeSocket() as unknown as Socket;
        updateRoomState({ socket: s, roomId });
        return s;
      })();

    socketRef.current = socket;

    void (async () => {
      const profile = await fetchPartyRoomUserProfile();
      if (cancelled) return;

      const userId = profile?.id ?? localStorage.getItem("plushyPocket_dbUserId") ?? "";
      const username = profile?.displayName ?? "Player";
      const flappyCharacter = sessionStorage.getItem("flappyCharacter");
      const characterId = flappyCharacter ?? profile?.character_selected ?? localStorage.getItem("character") ?? "mochi";

      userIdRef.current = userId;
      characterIdRef.current = characterId;
      socket.emit("player__join", { userId, username, roomId, characterId });
    })();



    socket.on("game_over", (payload: { winnerId: string; scores: Record<string, number> }) => {
      if (cancelled) return;
      sessionStorage.removeItem("flappyCharacter");
      const isWinner = payload.winnerId === userIdRef.current;
      navigate(isWinner ? '/winner' : '/loser', { replace: true });
    });

    socket.on("game_action", (data: { userId: string; action: string; payload?: { currentScore?: number; score?: number } }) => {
      if (cancelled) return;
      if (data.action === "score_update") {
        const newScore = data.payload?.currentScore ?? data.payload?.score ?? 0;
        if (data.userId === userIdRef.current) {
          setScore(newScore);
        }
      }
    });

    return () => {
      cancelled = true;
      socketRef.current = null;
    };
  }, [roomId]);

  useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    };
  }, []);

  // Auto-detect gyro support
  useEffect(() => {
    const hasDeviceOrientation = typeof DeviceOrientationEvent !== 'undefined';
    const hasDeviceMotion = typeof DeviceMotionEvent !== 'undefined';
    const orientNeedsPermission = hasDeviceOrientation &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function';
    const motionNeedsPermission = hasDeviceMotion &&
      typeof (DeviceMotionEvent as any).requestPermission === 'function';

    if (orientNeedsPermission || motionNeedsPermission) {
      // iOS or Android — need user gesture for permission
      return;
    }

    // No permission required — auto-enable if any sensor API exists
    if (hasDeviceOrientation || hasDeviceMotion) {
      setGyroPermission(true);
    } else {
      setGyroPermission(false);
    }
  }, []);

  const requestGyroPermission = async () => {
    // Try DeviceOrientation first (iOS), fall back to DeviceMotion (Android)
    if (typeof (DeviceOrientationEvent as any)?.requestPermission === 'function') {
      const result = await (DeviceOrientationEvent as any).requestPermission();
      if (result === 'granted') {
        setGyroPermission(true);
        return;
      }
    }
    if (typeof (DeviceMotionEvent as any)?.requestPermission === 'function') {
      const result = await (DeviceMotionEvent as any).requestPermission();
      if (result === 'granted') {
        setGyroPermission(true);
        return;
      }
    }
    setGyroPermission(false);
  };

  const jump = () => {
    const socket = socketRef.current;
    if (socket && roomId && userIdRef.current) {
      socket.emit("player_action", {
        userId: userIdRef.current,
        characterId: characterIdRef.current,
        action: "jump",
        timestamp: Date.now(),
        roomId,
      });
    }
    setTapFeedback(true);
    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    tapTimeoutRef.current = setTimeout(() => setTapFeedback(false), 120);
  };

  // Tilt control via devicemotion (works on both iOS and Android)
  useEffect(() => {
    if (!gyroPermission) return;

    const handler = (event: DeviceMotionEvent) => {
      const y = event.accelerationIncludingGravity?.y;
      if (y == null) return;

      const referenceY = motionInitialYRef.current;

      if (referenceY === null) {
        motionInitialYRef.current = y;
        return;
      }

      // When phone is vertical: y ≈ -9.8
      // Tilt forward (top away from you): y → 0 (higher)
      // Tilt backward (top toward you): y becomes more negative (lower)
      const delta = y - referenceY; // positive = forward tilt

      if (Math.abs(delta) > 2.5 && canGyroJumpRef.current) {
        canGyroJumpRef.current = false;
        jump();
      }

      if (Math.abs(delta) < 1) {
        canGyroJumpRef.current = true;
      }
    };

    window.addEventListener('devicemotion', handler);
    return () => window.removeEventListener('devicemotion', handler);
  }, [gyroPermission]);

  const handleTouchStart: React.TouchEventHandler = (e) => {
    e.preventDefault();
    touchFiredRef.current = true;
    jump();
  };

  const handleClick: React.MouseEventHandler = () => {
    if (touchFiredRef.current) {
      touchFiredRef.current = false;
      return;
    }
    jump();
  };

  return (
    <div
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      className="relative h-svh w-screen overflow-hidden bg-[#FAFAFA] select-none"
      style={{ touchAction: "manipulation" }}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div
        className="absolute left-1/2 -top-95 h-155 w-155 -translate-x-1/2 rounded-full bg-[#ED1C24]"
      />

      <div className="relative z-10 flex h-full w-full flex-col items-center px-8 pb-14 pt-18">
        <h1
          className="text-center text-[40px] font-extrabold leading-10 tracking-[-1px] text-[#FAFAFA]"
          style={{ fontFamily: "'Baloo 2', system-ui, sans-serif" }}
        >
          Fly as high as<br />you can!
        </h1>

        <div
          className="mt-6 flex w-full flex-1 items-center justify-center relative z-10"
        >
          <img
            src={bigBoat}
            alt="Boat"
            className={`w-[320px] max-w-[88vw] select-none pointer-events-none transition-transform duration-75 ${tapFeedback ? "scale-90" : "scale-100"}`}
            draggable={false}
          />
        </div>

        <div className="flex flex-col items-center mt-auto z-20 mb-2">
          <h2
            className="text-center text-[54px] font-extrabold leading-12 tracking-[-1px] text-[#ED1C24]"
            style={{ fontFamily: "'Baloo 2', system-ui, sans-serif" }}
          >
            Game Points
          </h2>
          <p
            className="mt-2 text-center text-[40px] font-extrabold leading-9 tracking-[-1px] text-[#583921]"
            style={{ fontFamily: "'Baloo 2', system-ui, sans-serif" }}
          >
            {score} pts
          </p>
          {gyroPermission === null && (
            <button
              onClick={requestGyroPermission}
              className="mt-4 rounded-full bg-white px-6 py-2 text-sm font-bold text-[#ED1C24] shadow-md"
            >
              Enable Tilt Control
            </button>
          )}
          {gyroPermission === true && (
            <p className="mt-3 text-xs text-gray-500">
              Tap or tilt to jump
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
