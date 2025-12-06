import express from "express";
import cors from "cors";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

import { GameEngine } from "../../game-engine/dist/engine/GameEngine";
import { createInitialGameState } from "../../game-engine/dist/rules/setup";
import type { GameAction } from "../../game-engine/dist/rules/actions";
import { BASE_CARDS } from "../../game-engine/dist/cards/cards.base";

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
  },
});

// Creamos el estado inicial del juego
const state = createInitialGameState("online-game-1", [
  { id: "p1", name: "Jugador 1" },
  { id: "p2", name: "Jugador 2" },
]);

// Instancia del motor
const engine = new GameEngine(state);

// Mapeo simple: qué socket tiene qué playerId
const playerSockets: Record<string, string | null> = {
  p1: null,
  p2: null,
};

io.on("connection", (socket) => {
  console.log("Jugador conectado (socket):", socket.id);

  // Estado actual
  socket.emit("state", engine.getState());
  // Catálogo de cartas
  socket.emit("cards", BASE_CARDS);

  // El cliente dice "quiero ser p1" o "p2"
  socket.on("joinAsPlayer", ({ playerId }: { playerId: string }) => {
    const currentState = engine.getState();
    const exists = currentState.players.some((p: any) => p.id === playerId);

    if (!exists) {
      socket.emit("error", "Ese jugador no existe en esta partida.");
      return;
    }

    // Si ya alguien tenía ese playerId, lo sacamos
    const previousSocketId = playerSockets[playerId];
    if (previousSocketId && previousSocketId !== socket.id) {
      const previousSocket = io.sockets.sockets.get(previousSocketId);
      previousSocket?.emit(
        "error",
        "Otro cliente tomó este jugador. Se cerrará tu sesión."
      );
      previousSocket?.disconnect(true);
    }

    playerSockets[playerId] = socket.id;
    console.log(`Socket ${socket.id} ahora es ${playerId}`);

    socket.emit("joinedAs", { playerId });
    socket.emit("state", engine.getState());
    socket.emit("cards", BASE_CARDS);
  });

  // Acciones del juego
  socket.on("action", (action: GameAction) => {
    const { playerId } = action;
    const ownerSocketId = playerSockets[playerId];

    if (!ownerSocketId || ownerSocketId !== socket.id) {
      socket.emit(
        "error",
        "No estás autorizado a actuar como este jugador. Elige tu jugador primero."
      );
      return;
    }

    try {
      engine.applyAction(action);
      io.emit("state", engine.getState()); // broadcast a todos
    } catch (err: any) {
      socket.emit("error", err.message ?? "Error al aplicar la acción");
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket desconectado:", socket.id);
    for (const [playerId, socketId] of Object.entries(playerSockets)) {
      if (socketId === socket.id) {
        playerSockets[playerId] = null;
        console.log(`Liberado playerId ${playerId}`);
      }
    }
  });
});

app.get("/", (_req, res) => {
  res.send("Servidor Unstable Unicorns Online 🦄 activo");
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log("Servidor escuchando en http://localhost:" + PORT);
});
