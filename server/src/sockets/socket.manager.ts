import socketio from "socket.io";
import { Server as HttpServer } from "http"
import GameService from "../game/game.service"
import GameRepository from "../game/game.repository"
import { GameEndPayload, GameOverPayload, GameStartPayload, PlayerActionPayload, PlayerInfoPayload, PlayerJoinPayload, PlayerRole, RewardAssignedPayload, Room, RoomCreatedPayload, RoomPlayer, RoomUpdatePayload, ScreenCreateRoomPayload, SocketSession } from "../types/socket.types"

const rooms: Record<string, Room> = {}
const sessions: Record<string, SocketSession> = {}

const toPlayerInfoPayload = (player: RoomPlayer): PlayerInfoPayload => ({
    userId: player.userId,
    username: player.username,
    characterId: player.characterId,
    role: player.role,
})

const toRoomUpdatePayload = (room: Room): RoomUpdatePayload => ({
    roomId: room.roomId,
    minigameId: room.minigameId,
    status: room.status,
    players: room.players.map(toPlayerInfoPayload),
    playersInRoom: room.players.length,
})

const emitRoomUpdate = (io: socketio.Server, room: Room) => {
    io.to(room.roomId).emit("room_update", toRoomUpdatePayload(room))
}

const generateRoomId = () => {
    for (let i = 0; i < 20; i++) {
        const candidate = Math.floor(1000 + Math.random() * 9000).toString()
        if (!rooms[candidate]) return candidate
    }
    return `${Date.now()}`
}

const getRoomIdFromSocket = (socket: socketio.Socket) => {
    const direct = sessions[socket.id]?.roomId
    if (direct) return direct
    const inferred = [...socket.rooms].find(r => r !== socket.id)
    return inferred
}

export const initializeSockets = (rawServer: HttpServer) => {
    const io = new socketio.Server(rawServer, {
        path: "/real-time",
        cors: {
            origin: "*"
        }
    })

    io.on("connection", (socket) => {
        console.log(socket.id)

        // 1. create room
        socket.on("screen__create_room", (data: ScreenCreateRoomPayload) => {
            const roomId = generateRoomId()
            const minigameId = data?.minigameId ?? "unknown"

            const room: Room = {
                roomId,
                minigameId,
                status: "CREATED",
                screenSocketId: socket.id,
                players: [],
            }

            rooms[roomId] = room
            sessions[socket.id] = { clientType: "screen", roomId }
            socket.join(roomId)

            const payload: RoomCreatedPayload = { roomId, minigameId, status: room.status }
            socket.emit("room_created", payload)
            emitRoomUpdate(io, room)
        })

        // 2. join room
        socket.on("screen__join_room", (data: { roomId: string }) => {
            const room = rooms[data.roomId]
            if (!room) {
                socket.emit("room_not_found", { message: "Sala no encontrada" })
                return
            }

            room.screenSocketId = socket.id
            sessions[socket.id] = { clientType: "screen", roomId: room.roomId }
            socket.join(room.roomId)
            emitRoomUpdate(io, room)
        })

        // 3. player join 
        socket.on("player__join", async (data: PlayerJoinPayload) => {
            const { userId, username, roomId, characterId } = data
            const room = rooms[roomId]

            if (!room) {
                socket.emit("room_not_found", { message: "Sala no encontrada" })
                return
            }

            const existingPlayer = room.players.find(p => p.userId === userId)
            if (!existingPlayer && room.players.length >= 2) {
                socket.emit("room_full", { message: "La sala ya está llena :P" })
                return
            }

            socket.join(roomId)
            sessions[socket.id] = { clientType: "player", roomId, userId }

            let role: PlayerRole
            if (existingPlayer) {
                existingPlayer.socketId = socket.id
                existingPlayer.username = username
                existingPlayer.characterId = characterId
                role = existingPlayer.role
            } else {
                role = room.players.some(p => p.role === "P1") ? "P2" : "P1"
                room.players.push({ userId, username, characterId, role, socketId: socket.id })
            }

            if (room.status === "CREATED") room.status = "WAITING_PLAYERS"
            if (room.players.length === 2 && room.status !== "IN_GAME") room.status = "READY"

            io.to(roomId).emit("player__joined", {
                userId,
                username,
                characterId,
                role,
                playersInRoom: room.players.length,
            })

            emitRoomUpdate(io, room)

            if (room.players.length === 2 && room.status === "READY") {
                const p1 = room.players.find(p => p.role === "P1")
                const p2 = room.players.find(p => p.role === "P2")
                if (!p1 || !p2) {
                    socket.emit("game_error", { message: "Error al asignar roles de jugadores" })
                    return
                }

                try {
                    await GameService.startGame({ player1_id: p1.userId, player2_id: p2.userId })
                    room.status = "IN_GAME"
                    const gameStartPayload: GameStartPayload = {
                        roomId: room.roomId,
                        minigameId: room.minigameId,
                        players: room.players.map(toPlayerInfoPayload),
                    }
                    io.to(room.roomId).emit("game_start", gameStartPayload)
                    emitRoomUpdate(io, room)
                } catch (error: any) {
                    io.to(room.roomId).emit("game_error", { message: error.message ?? "Error al iniciar partida" })
                }
            }
        })

        // 4. player action
        socket.on("player_action", (data: PlayerActionPayload) => {
            const roomId = data.roomId ?? getRoomIdFromSocket(socket)
            if (!roomId) return
            const room = rooms[roomId]
            if (!room) return
            if (room.status !== "IN_GAME") return

            io.to(roomId).emit("game_action", {
                roomId,
                userId: data.userId,
                characterId: data.characterId,
                action: data.action,
                payload: data.payload,
                timestamp: data.timestamp,
            })
        })

        // 5. player leave
        socket.on("player__leave", (data: { roomId?: string; userId?: string }) => {
            const roomId = data.roomId ?? getRoomIdFromSocket(socket)
            const userId = data.userId ?? sessions[socket.id]?.userId
            if (!roomId || !userId) return

            const room = rooms[roomId]
            if (!room) return

            room.players = room.players.filter(p => p.userId !== userId)
            if (room.status !== "RESULTS") room.status = room.players.length === 2 ? "READY" : "WAITING_PLAYERS"

            socket.leave(roomId)
            io.to(roomId).emit("player_left", { userId })
            emitRoomUpdate(io, room)
        })

        // 6. room close
        socket.on("room__close", (data: { roomId: string }) => {
            const session = sessions[socket.id]
            if (!session || session.clientType !== "screen") return
            const room = rooms[data.roomId]
            if (!room) return

            io.to(room.roomId).emit("room_closed", { roomId: room.roomId })
            delete rooms[room.roomId]
        })

        // 7. game end
        socket.on("game_end", async (data: GameEndPayload) => {
            const { roomId, winnerId, loserId } = data
            const room = rooms[roomId]
            if (!room) {
                socket.emit("room_not_found", { message: "Sala no encontrada" })
                return
            }

            room.status = "RESULTS"
            emitRoomUpdate(io, room)

            const gameOverPayload: GameOverPayload = { roomId, winnerId, loserId }
            io.to(roomId).emit("game_over", gameOverPayload)

            try {
                const rewards = await GameRepository.listGameRewards()
                if (rewards.length === 0) {
                    io.to(roomId).emit("game_error", { message: "No hay recompensas disponibles" })
                    return
                }

                const randomReward = rewards[Math.floor(Math.random() * rewards.length)]
                const result = await GameService.finishGame({ winner_id: winnerId, reward_id: randomReward.id })

                const winnerSocketId = room.players.find(p => p.userId === winnerId)?.socketId
                if (!winnerSocketId) return

                const rewardAssignedPayload: RewardAssignedPayload = {
                    userId: result.winner.id,
                    rewardId: result.reward.id,
                    rewardName: result.reward.reward_name,
                    rewardType: result.reward.reward_type,
                    status: result.user_reward.status,
                }

                io.to(winnerSocketId).emit("reward_assigned", rewardAssignedPayload)
            } catch (error: any) {
                io.to(roomId).emit("game_error", { message: error.message ?? "Error al procesar el fin de partida :C" })
            }
        })

        // 8. disconnect
        socket.on("disconnect", () => {
            console.log(`Jugador desconectado: ${socket.id}`)

            const session = sessions[socket.id]
            if (!session) return

            const roomId = session.roomId
            if (!roomId) {
                delete sessions[socket.id]
                return
            }

            const room = rooms[roomId]
            if (!room) {
                delete sessions[socket.id]
                return
            }

            if (session.clientType === "screen") {
                room.screenSocketId = null
                io.to(roomId).emit("screen_disconnected", { roomId })
                if (room.players.length === 0) delete rooms[roomId]
                delete sessions[socket.id]
                return
            }

            const disconnectedUserId = session.userId
            if (disconnectedUserId) {
                room.players = room.players.filter(p => p.userId !== disconnectedUserId)
                if (room.status !== "RESULTS") room.status = room.players.length === 2 ? "READY" : "WAITING_PLAYERS"
                io.to(roomId).emit("player_disconnected", { userId: disconnectedUserId })
                emitRoomUpdate(io, room)
            }

            if (room.players.length === 0 && !room.screenSocketId) delete rooms[roomId]
            delete sessions[socket.id]
        })
    })
}
