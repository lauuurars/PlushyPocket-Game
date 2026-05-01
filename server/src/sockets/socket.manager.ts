import socketio from "socket.io";
import { Server as HttpServer } from "http"
import { GameEndPayload, GameStartPayload, PlayerActionPayload, PlayerJoinPayload, RewardAssignedPayload } from "../types/socket.types";

const rooms: Record<string, string[]> = {};
const socketToUser: Record<string, string> = {};

export const initializeSockets = (rawServer: HttpServer) => {

    const io = new socketio.Server(rawServer, {
        path: "/real-time",
        cors: {
            origin: "*"
        }
    })

    io.on("connection", (socket) => {
        console.log(socket.id)

        // 1. player join 

        socket.on("player__join", (data: PlayerJoinPayload) => {
            const { userId, username, roomId, characterId } = data;

            socket.join(roomId);

            if (!rooms[roomId]) rooms[roomId] = [];
            rooms[roomId].push(userId);

            // avisamos que alguien ha entrado a la sala
            io.to(roomId).emit("player__joined", {
                userId,
                username,
                characterId,
                playersInRoom: rooms[roomId].length
            });

            // si hay 2 jugadores iniciamos juegoo

            if (rooms[roomId].length === 2) {
                const gameStartPayload: GameStartPayload = {
                    roomId,
                    players: rooms[roomId]
                };
                io.to(roomId).emit("game_start", gameStartPayload);
            }

            // 2. player action

            socket.on("player_action", (data: PlayerActionPayload) => {
                const { userId, characterId, action, timestamp } = data;

                const roomId = [...socket.rooms].find(r => r !== socket.id);
                if (!roomId) return;

                io.to(roomId).emit("game_action", {
                    userId,
                    characterId,
                    action,
                    timestamp
                });
            });
        });

        // 3. game end ---- test

        socket.on("game_end", async (data: GameEndPayload) => {
            const { roomId, winnerId, loserId } = data;

            try {
                // const randomReward = await rewardService.getRandomReward();
                // await rewardService.assignReward({ userId: winnerId, rewardId: randomReward.id, status: "active" });

                io.to(roomId).emit("game_over", { winnerId, loserId });

                // io.to(winnerId).emit("reward_assigned", { ... } as RewardAssignedPayload);

                delete rooms[roomId];
            } catch (error) {
                console.error("Error en game_end:", error);
                socket.emit("game_error", { message: "Error al procesar el fin de partida :C" });
            }
        });

        // 4. disconnect - cuando un jugador se desconecta 

        socket.on("disconnect", () => {
            console.log(`Jugador desconectado: ${socket.id}`);

            const disconnectedUserId = socketToUser[socket.id];

            for (const roomId in rooms) {
                rooms[roomId] = rooms[roomId].filter(id => id !== disconnectedUserId);
                
                if (rooms[roomId].length === 0) {
                    delete rooms[roomId];
                } else {
                    io.to(roomId).emit("player_disconnected", { userId: disconnectedUserId})
                }
            }
            delete socketToUser[socket.id]
        })
    })
}