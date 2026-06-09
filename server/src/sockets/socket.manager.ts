import socketio from "socket.io";
import { Server as HttpServer } from "http"
import GameService from "../game/game.service"
import GameRepository from "../game/game.repository"
import { calculateScore, determineWinner } from "../game/scoring.service"
import { GameEndPayload, GameOverPayload, GameStartPayload, GAME_DURATION, PlayerActionPayload, PlayerInfoPayload, PlayerJoinPayload, PlayerRole, RewardAssignedPayload, Room, RoomCreatedPayload, RoomPlayer, RoomUpdatePayload, ScreenCreateRoomPayload, SocketSession } from "../types/socket.types"

const rooms: Record<string, Room> = {}
const sessions: Record<string, SocketSession> = {}
const gameTimers: Record<string, NodeJS.Timeout> = {}
const tickerIntervals: Record<string, NodeJS.Timeout> = {}

const cleanupGameTimers = (roomId: string) => {
    if (tickerIntervals[roomId]) {
        clearInterval(tickerIntervals[roomId])
        delete tickerIntervals[roomId]
    }
    if (gameTimers[roomId]) {
        clearTimeout(gameTimers[roomId])
        delete gameTimers[roomId]
    }
}

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

const calcRemainingSeconds = (gameEndTime: number) =>
    Math.max(0, Math.ceil((gameEndTime - Date.now()) / 1000))

const emitGameTimerTick = (io: socketio.Server, room: Room, target?: socketio.Socket) => {
    if (!room.gameEndTime) return
    const payload = {
        remaining: calcRemainingSeconds(room.gameEndTime),
        gameEndTime: room.gameEndTime,
    }
    if (target) target.emit("game_timer_tick", payload)
    else io.to(room.roomId).emit("game_timer_tick", payload)
}

const toGameStartPayload = (room: Room): GameStartPayload => ({
    roomId: room.roomId,
    minigameId: room.minigameId,
    players: room.players.map(toPlayerInfoPayload),
    gameEndTime: room.gameEndTime,
})

const startGameClock = (io: socketio.Server, room: Room) => {
    if (!room.gameEndTime) return

    const durationMs = Math.max(0, room.gameEndTime - Date.now())
    emitGameTimerTick(io, room)

    tickerIntervals[room.roomId] = setInterval(() => {
        emitGameTimerTick(io, room)
    }, 1000)

    gameTimers[room.roomId] = setTimeout(() => {
        for (const player of room.players) {
            if (!(player.userId in room.scores)) {
                room.scores[player.userId] = 0;
            }
        }

        if (room.minigameId !== "hammer-mole") {
            for (const player of room.players) {
                const data = room.playerData[player.userId] ?? {}
                const score = calculateScore(room.minigameId, { score: 0, payload: data })
                room.scores[player.userId] = score
            }
        }

        const { winnerId, loserId, isDraw } = determineWinner(room.scores);
        if (!winnerId || !loserId) {
            io.to(room.roomId).emit("game_error", { message: "No se pudo determinar un ganador" });
            return;
        }

        void processGameEnd(io, room.roomId, winnerId, loserId, isDraw);
    }, durationMs)
}

const processGameEnd = async (io: socketio.Server, roomId: string, winnerId: string, loserId: string, isDraw = false) => {
    const room = rooms[roomId]
    if (!room) return
    if (room.status === "RESULTS") return

    cleanupGameTimers(roomId)

    room.status = "RESULTS"
    emitRoomUpdate(io, room)

    const gameOverPayload: GameOverPayload = { roomId, winnerId, loserId, scores: room.scores, isDraw };
    io.to(roomId).emit("game_over", gameOverPayload);

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
            rewardId: result.user_reward.id,
            rewardName: result.reward.reward_name,
            rewardType: result.reward.reward_type,
            status: result.user_reward.status,
        }

                io.to(roomId).emit("reward_assigned", rewardAssignedPayload)
    } catch (error: any) {
        io.to(roomId).emit("game_error", { message: error.message ?? "Error al procesar el fin de partida :C" })
    }
}

const beginGame = async (io: socketio.Server, room: Room, requestSocket?: socketio.Socket) => {
    const p1 = room.players.find(p => p.role === "P1")
    const p2 = room.players.find(p => p.role === "P2")
    if (!p1 || !p2) {
        const errorMsg = "Error al asignar roles de jugadores"
        if (requestSocket) requestSocket.emit("game_error", { message: errorMsg })
        else io.to(room.roomId).emit("game_error", { message: errorMsg })
        return
    }

    try {
        room.scores = {}
        room.playerData = {}
        room.rematchReady = []

        await GameService.startGame({ player1_id: p1.userId, player2_id: p2.userId })
        room.status = "IN_GAME"

        if (room.minigameId === "hammer-mole") {
            // El clock lo arranca la pantalla con start_game_clock
            io.to(room.roomId).emit("game_start", toGameStartPayload(room))
            emitRoomUpdate(io, room)
        } else {
            const durationMs = (GAME_DURATION[room.minigameId] ?? 60) * 1000
            room.gameEndTime = Date.now() + durationMs
            io.to(room.roomId).emit("game_start", toGameStartPayload(room))
            emitRoomUpdate(io, room)
            startGameClock(io, room)
        }
    } catch (error: any) {
        io.to(room.roomId).emit("game_error", { message: error.message ?? "Error al iniciar partida" })
    }
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
                scores: {},
                playerData: {},
                rematchReady: [],
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

            if (room.status === "IN_GAME" || room.status === "READY") {
                socket.emit("game_start", toGameStartPayload(room))
                if (room.status === "IN_GAME") emitGameTimerTick(io, room, socket)
            }
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

                /* If game is already in progress, re-emit game_start so the new socket doesn't miss it */
                if (room.status === "IN_GAME") {
                    socket.emit("game_start", toGameStartPayload(room))
                    emitGameTimerTick(io, room, socket)
                }
            } else {
                role = room.players.some(p => p.role === "P1") ? "P2" : "P1"
                room.players.push({ userId, username, characterId, role, socketId: socket.id })
            }

            if (room.status === "CREATED") room.status = "WAITING_PLAYERS"
            if (room.players.length === 2 && room.status !== "IN_GAME" && room.status !== "RESULTS") room.status = "READY"

            io.to(roomId).emit("player__joined", {
                userId,
                username,
                characterId,
                role,
                playersInRoom: room.players.length,
            })

            emitRoomUpdate(io, room)

            if (room.players.length === 2 && room.status === "READY") {
                await beginGame(io, room, socket)
            }
        })

        // 4. player action
        socket.on("player_action", (data: PlayerActionPayload) => {
            const roomId = data.roomId ?? getRoomIdFromSocket(socket)
            if (!roomId) return
            const room = rooms[roomId]
            if (!room) return
            if (room.status !== "IN_GAME") return

            // Track score updates in real-time (hammer-mole scores only on hit_confirmed)
            if (data.action === "score_update" && data.payload) {
                room.playerData[data.userId] = data.payload as Record<string, unknown>
                if (room.minigameId !== "hammer-mole") {
                    const score = calculateScore(room.minigameId, { score: 0, payload: data.payload })
                    room.scores[data.userId] = score
                }
            }

            io.to(roomId).emit("game_action", {
                roomId,
                userId: data.userId,
                characterId: data.characterId,
                action: data.action,
                payload: data.payload,
                timestamp: data.timestamp,
            })
        })

        // 5. hit confirmed (screen validates mole hits, relay to players)
        socket.on("hit_confirmed", (data: { userId: string; points: number; characterName?: string }) => {
            const session = sessions[socket.id]
            if (!session || session.clientType !== "screen") return

            const roomId = session.roomId
            if (!roomId) return

            const room = rooms[roomId]
            if (!room || room.status !== "IN_GAME") return

            room.scores[data.userId] = (room.scores[data.userId] ?? 0) + data.points

            // ✅ Inicializar score del otro jugador si no existe
            for (const player of room.players) {
                if (!(player.userId in room.scores)) {
                    room.scores[player.userId] = 0
                }
            }

            io.to(roomId).emit("hit_confirmed", data)
        })

        // 6. player leave
        socket.on("player__leave", (data: { roomId?: string; userId?: string }) => {
            const roomId = data.roomId ?? getRoomIdFromSocket(socket)
            const userId = data.userId ?? sessions[socket.id]?.userId
            if (!roomId || !userId) return

            const room = rooms[roomId]
            if (!room) return

            room.players = room.players.filter(p => p.userId !== userId)
            room.rematchReady = room.rematchReady.filter(id => id !== userId)
            if (room.status !== "RESULTS") room.status = room.players.length === 2 ? "READY" : "WAITING_PLAYERS"

            socket.leave(roomId)
            io.to(roomId).emit("player_left", { userId })
            emitRoomUpdate(io, room)
        })

        // 7. room close
        socket.on("room__close", (data: { roomId: string }) => {
            const session = sessions[socket.id]
            if (!session || session.clientType !== "screen") return
            const room = rooms[data.roomId]
            if (!room) return

            io.to(room.roomId).emit("room_closed", { roomId: room.roomId })

            // Disconnect both players in the room
            for (const player of room.players) {
                const playerSocket = io.sockets.sockets.get(player.socketId)
                if (playerSocket) {
                    playerSocket.disconnect(true)
                }
            }

            delete rooms[room.roomId]
        })

        // start game clock for games that don't start automatically (like hammer-mole)
        socket.on("start_game_clock", (data: { roomId: string }) => {
            const room = rooms[data.roomId]
            if (!room) return
            if (room.status !== "IN_GAME" || room.gameEndTime) return

            const durationMs = (GAME_DURATION[room.minigameId] ?? 60) * 1000
            room.gameEndTime = Date.now() + durationMs

            io.to(room.roomId).emit("game_start", toGameStartPayload(room))
            emitRoomUpdate(io, room)
            startGameClock(io, room)
        })

        // 8. game end
        socket.on("game_end", async (data: GameEndPayload) => {
            const { roomId, winnerId, loserId } = data
            const room = rooms[roomId]
            if (!room) {
                socket.emit("room_not_found", { message: "Sala no encontrada" })
                return
            }

            await processGameEnd(io, roomId, winnerId, loserId)
        })

        // 8. player rematch ready
        socket.on("player__rematch_ready", (data: { roomId: string }) => {
            const session = sessions[socket.id]
            if (!session || session.clientType !== "player") return

            const userId = session.userId
            if (!userId) return

            const roomId = data.roomId ?? session.roomId
            if (!roomId) return

            const room = rooms[roomId]
            if (!room) return
            if (room.status !== "RESULTS") return

            if (!room.rematchReady.includes(userId)) {
                room.rematchReady.push(userId)
            }

            const allPlayersReady = room.players.length === 2 &&
                room.players.every(p => room.rematchReady.includes(p.userId))

            if (allPlayersReady) {
                void beginGame(io, room)
            }
        })

        // 9. disconnect
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
                cleanupGameTimers(roomId)
                io.to(roomId).emit("screen_disconnected", { roomId })
                if (room.players.length === 0) delete rooms[roomId]
                delete sessions[socket.id]
                return
            }

            const disconnectedUserId = session.userId
            if (disconnectedUserId) {
                const currentEntry = room.players.find(p => p.userId === disconnectedUserId)
                // Si el jugador ya se reconectó con otro socket (room.players tiene socketId diferente),
                // no lo removemos del room — solo limpiamos la sesión vieja.
                if (!currentEntry || currentEntry.socketId === socket.id) {
                    room.players = room.players.filter(p => p.userId !== disconnectedUserId)
                    room.rematchReady = room.rematchReady.filter(id => id !== disconnectedUserId)
                    if (room.status !== "RESULTS") room.status = room.players.length === 2 ? "READY" : "WAITING_PLAYERS"
                    io.to(roomId).emit("player_disconnected", { userId: disconnectedUserId })
                    emitRoomUpdate(io, room)
                }
            }

            if (room.players.length === 0 && !room.screenSocketId) delete rooms[roomId]
            delete sessions[socket.id]
        })
    })
}
