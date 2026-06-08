import type { Socket } from "socket.io-client";
import type { PlayerInfoPayload, GameOverPayload, RewardAssignedPayload } from "./api";

export interface RoomState {
  socket: Socket | null;
  roomId: string | null;
  minigameId: string | null;
  playerRole: "P1" | "P2" | null;
  players: PlayerInfoPayload[];
  scores: Record<string, number>;
  timeRemaining: number;
}

export interface RoomCallbacks {
  onGameOver?: (payload: GameOverPayload) => void;
  onRewardAssigned?: (payload: RewardAssignedPayload) => void;
  onScoreUpdate?: (userId: string, score: number) => void;
  onTimerTick?: (remaining: number) => void;
  onGameAction?: (data: { userId: string; action: string; payload?: Record<string, unknown> }) => void;
}

const state: RoomState = {
  socket: null,
  roomId: null,
  minigameId: null,
  playerRole: null,
  players: [],
  scores: {},
  timeRemaining: 0,
};

let callbacks: RoomCallbacks = {};

export function setRoomCallbacks(cbs: RoomCallbacks) {
  callbacks = cbs;
}

export function clearRoomCallbacks() {
  callbacks = {};
}

export function updateRoomState(partial: Partial<RoomState>) {
  Object.assign(state, partial);
  if (partial.socket) {
    attachRoomListeners(partial.socket);
  }
}

export function getRoomState(): RoomState {
  return state;
}

export function resetRoomState() {
  state.socket = null;
  state.roomId = null;
  state.minigameId = null;
  state.playerRole = null;
  state.players = [];
  state.scores = {};
  state.timeRemaining = 0;
  callbacks = {};
}

export function attachRoomListeners(socket: Socket) {
  // Prevent duplicate listeners
  detachRoomListeners(socket);

  socket.on("game_action", (data: { userId: string; action: string; payload?: Record<string, unknown> }) => {
    if (data.action === "score_update" && data.payload?.score != null) {
      const score = Number(data.payload.score);
      state.scores[data.userId] = score;
      callbacks.onScoreUpdate?.(data.userId, score);
    }
    callbacks.onGameAction?.(data);
  });

  socket.on("game_timer_tick", (data: { remaining: number }) => {
    state.timeRemaining = data.remaining;
    callbacks.onTimerTick?.(data.remaining);
  });

  socket.on("game_over", (payload: GameOverPayload) => {
    state.scores = payload.scores;
    callbacks.onGameOver?.(payload);
  });

  socket.on("reward_assigned", (payload: RewardAssignedPayload) => {
    callbacks.onRewardAssigned?.(payload);
  });

  socket.on("room_closed", () => {
    resetRoomState();
    if (typeof window !== "undefined") {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        window.location.href = "/home-phone";
      } else {
        window.location.href = "/welcome";
      }
    }
  });
}

export function detachRoomListeners(socket: Socket) {
  socket.off("game_action");
  socket.off("game_timer_tick");
  socket.off("game_over");
  socket.off("reward_assigned");
  socket.off("room_closed");
}
