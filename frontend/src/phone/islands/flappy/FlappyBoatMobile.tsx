import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Socket } from "socket.io-client";
import { createRealtimeSocket, fetchPartyRoomUserProfile } from "../../../lib/api";
import { getRoomState, updateRoomState } from "../../../lib/roomStore";
import Background from "../../../assets/moleAssets/HammerBg.jpg";
import bigBoat from "../../../assets/flappybird/bigBoat.png";

export default function FlappyGame() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");

  const [score, setScore] = useState(0);
  const [tapFeedback, setTapFeedback] = useState(false);

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
      const characterId = profile?.character_selected ?? localStorage.getItem("character") ?? "mochi";

      userIdRef.current = userId;
      characterIdRef.current = characterId;
      socket.emit("player__join", { userId, username, roomId, characterId });
    })();



    socket.on("game_over", (payload: { winnerId: string; scores: Record<string, number> }) => {
      if (cancelled) return;
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
          backgroundImage: `url("${Background}")`,
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
          className="text-center text-[44px] font-extrabold leading-10 tracking-[-1px] text-[#FAFAFA]"
          style={{ fontFamily: "'Baloo 2', system-ui, sans-serif" }}
        >
          Flappy Boat
        </h1>

        <div
          className="mt-14 flex w-full flex-1 items-center justify-center"
        >
          <img
            src={bigBoat}
            alt="Boat"
            className={`w-[320px] max-w-[88vw] select-none pointer-events-none transition-transform duration-75 ${tapFeedback ? "scale-90" : "scale-100"}`}
            draggable={false}
          />
        </div>

        <div className="flex flex-col items-center">
          <h2
            className="text-center text-[54px] font-extrabold leading-12 tracking-[-1px] text-[#ED1C24]"
            style={{ fontFamily: "'Baloo 2', system-ui, sans-serif" }}
          >
            Game Points
          </h2>
          <p
            className="mt-2 text-center text-[34px] font-extrabold leading-9 tracking-[-1px] text-[#583921]"
            style={{ fontFamily: "'Baloo 2', system-ui, sans-serif" }}
          >
            {score} pts
          </p>
        </div>
      </div>
    </div>
  );
}
