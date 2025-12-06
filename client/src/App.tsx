import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface PlayerState {
  id: string;
  name: string;
  hand: string[];
  stable: string[];
  isConnected: boolean;
  shields: number;
}

type GamePhase = "SETUP" | "MAIN" | "FINISHED";

interface GameState {
  id: string;
  players: PlayerState[];
  deck: string[];
  discardPile: string[];
  currentPlayerId: string;
  phase: GamePhase;
  winnerId?: string;
}

type CardType =
  | "UNICORN_BABY"
  | "UNICORN_BASIC"
  | "UNICORN_MAGIC"
  | "MAGIC"
  | "UPGRADE"
  | "DOWNGRADE"
  | "INSTANT";

interface CardMeta {
  id: string;
  name: string;
  type: CardType;
  description: string;
  tags?: string[];
}

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [pendingMagicCard, setPendingMagicCard] = useState<string | null>(null);
  const [targetPlayer, setTargetPlayer] = useState<string | null>(null);
  const [cards, setCards] = useState<CardMeta[]>([]);

  useEffect(() => {
    const s = io("http://localhost:4000");
    setSocket(s);

    s.on("state", (gameState: GameState) => {
      setState(gameState);
    });

    s.on("joinedAs", ({ playerId }: { playerId: string }) => {
      setMyPlayerId(playerId);
      setJoining(false);
    });

    s.on("error", (msg: string) => {
      console.error("Error desde el servidor:", msg);
      alert("Error: " + msg);
      setJoining(false);
    });

    s.on("cards", (cardsFromServer: CardMeta[]) => {
      console.log("Catálogo de cartas recibido:", cardsFromServer);
      setCards(cardsFromServer);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  const handleJoin = (playerId: string) => {
    if (!socket) return;
    setJoining(true);
    socket.emit("joinAsPlayer", { playerId });
  };

  const handleDrawCard = () => {
    if (!socket || !myPlayerId) return;
    socket.emit("action", {
      type: "DRAW_CARD",
      playerId: myPlayerId,
    });
  };

  const handleEndTurn = () => {
    if (!socket || !myPlayerId) return;
    socket.emit("action", {
      type: "END_TURN",
      playerId: myPlayerId,
    });
  };

  const handlePlayCard = (cardId: string) => {
    if (!socket || !myPlayerId || !state) return;

    // Detectamos cartas mágicas por prefijo "m-" (m-destroy-1, m-steal-1, m-protect-1)
    if (cardId.startsWith("m-")) {
      setPendingMagicCard(cardId);
      setTargetPlayer(null);
      return;
    }

    // Unicornio u otra carta simple
    socket.emit("action", {
      type: "PLAY_CARD",
      playerId: myPlayerId,
      payload: { cardId },
    });
  };

  const cardById = (id: string): CardMeta | undefined =>
    cards.find((c) => c.id === id);

  const currentPlayerName =
    state?.players.find((p) => p.id === state.currentPlayerId)?.name ?? "-";

  const myPlayer =
    myPlayerId && state
      ? state.players.find((p) => p.id === myPlayerId) ?? null
      : null;

  const isFinished = state?.phase === "FINISHED";

  return (
    <div
      style={{
        padding: 24,
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      <h1>Unstable Unicorns Online 🦄</h1>

      <p>
        Servidor:{" "}
        <strong>
          {socket && socket.connected ? "Conectado ✅" : "Desconectado ❌"}
        </strong>
      </p>

      <p>
        Catálogo de cartas recibido: <strong>{cards.length}</strong>
      </p>

      <section
        style={{
          marginTop: 16,
          padding: 16,
          borderRadius: 12,
          border: "1px solid #444",
          background: "#111",
          color: "#eee",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Elige tu jugador</h2>
        <p style={{ marginBottom: 8 }}>
          Abre esta misma URL en otra ventana o navegador y que cada uno tome
          un jugador distinto.
        </p>
        <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
          <button
            onClick={() => handleJoin("p1")}
            disabled={joining}
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Ser Jugador 1 (p1)
          </button>
          <button
            onClick={() => handleJoin("p2")}
            disabled={joining}
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Ser Jugador 2 (p2)
          </button>
        </div>
        <p>
          Tú eres:{" "}
          <strong>{myPlayerId ? myPlayerId : "Nadie (elige un jugador)"}</strong>
        </p>
      </section>

      {!state && <p style={{ marginTop: 16 }}>Cargando estado del juego...</p>}

      {state && (
        <>
          <section
            style={{
              marginTop: 16,
              padding: 16,
              borderRadius: 12,
              border: "1px solid #333",
              background: "#181818",
              color: "#eee",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Estado de la partida</h2>
            <p>
              <strong>ID:</strong> {state.id}
            </p>
            <p>
              <strong>Fase:</strong> {state.phase}
            </p>
            <p>
              <strong>Turno de:</strong> {currentPlayerName} (
              {state.currentPlayerId})
            </p>

            {state.winnerId && (
              <p>
                <strong>Ganador:</strong>{" "}
                {state.players.find((p) => p.id === state.winnerId)?.name ??
                  state.winnerId}{" "}
                🏆
              </p>
            )}

            <p>
              <strong>Mazo:</strong> {state.deck.length} cartas
            </p>
            <p>
              <strong>Descarte:</strong> {state.discardPile.length} cartas
            </p>
          </section>

          <section
            style={{
              marginTop: 16,
              padding: 16,
              borderRadius: 12,
              border: "1px solid #333",
              background: "#202020",
              color: "#eee",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Jugadores</h2>
            <ul>
              {state.players.map((p) => (
                <li key={p.id}>
                  <strong>{p.name}</strong> ({p.id}) — mano: {p.hand.length} |
                  establo: {p.stable.length} | escudos: {p.shields ?? 0}{" "}
                  {p.id === state.currentPlayerId && "👑 Turno actual"}{" "}
                  {p.id === myPlayerId && " ⭐ Tú"}
                </li>
              ))}
            </ul>
          </section>

          <section
            style={{
              marginTop: 16,
              padding: 16,
              borderRadius: 12,
              border: "1px solid #333",
              background: "#282828",
              color: "#eee",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Tus acciones</h2>

            {!myPlayerId && (
              <p>Primero elige un jugador arriba para poder jugar.</p>
            )}

            {myPlayer && (
              <>
                <p>
                  <strong>Tú:</strong> {myPlayer.name} ({myPlayer.id})
                </p>
                <p>
                  <strong>Cartas en mano:</strong> {myPlayer.hand.length}
                </p>

                <div style={{ marginTop: 8 }}>
                  <strong>Mano:</strong>
                  {myPlayer.hand.length === 0 && <span> (sin cartas)</span>}
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      marginTop: 4,
                    }}
                  >
                    {myPlayer.hand.map((cardId) => {
                      const meta = cardById(cardId);
                      const label = meta
                        ? `${meta.name} (${meta.type})`
                        : cardId;

                      return (
                        <button
                          key={cardId}
                          onClick={() => handlePlayCard(cardId)}
                          disabled={isFinished}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 999,
                            border: "1px solid #555",
                            background: "#333",
                            color: "#fff",
                            cursor: isFinished ? "not-allowed" : "pointer",
                            fontSize: 12,
                          }}
                        >
                          Jugar {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ marginTop: 8 }}>
                  <strong>Establo:</strong>
                  {myPlayer.stable.length === 0 && <span> (vacío)</span>}
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      marginTop: 4,
                    }}
                  >
                    {myPlayer.stable.map((cardId) => {
                      const meta = cardById(cardId);
                      const label = meta
                        ? `${meta.name} (${meta.type})`
                        : cardId;

                      return (
                        <span
                          key={cardId}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 999,
                            border: "1px solid #888",
                            background: "#222",
                            color: "#0f0",
                            fontSize: 12,
                          }}
                        >
                          {label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
              <button
                onClick={handleDrawCard}
                disabled={!myPlayerId || isFinished}
                style={{
                  padding: "8px 16px",
                  borderRadius: 999,
                  border: "none",
                  cursor: myPlayerId && !isFinished ? "pointer" : "not-allowed",
                  fontWeight: 600,
                }}
              >
                Robar carta 🃏
              </button>
              <button
                onClick={handleEndTurn}
                disabled={!myPlayerId || isFinished}
                style={{
                  padding: "8px 16px",
                  borderRadius: 999,
                  border: "none",
                  cursor: myPlayerId && !isFinished ? "pointer" : "not-allowed",
                  fontWeight: 600,
                }}
              >
                Pasar turno 🔁
              </button>
            </div>
          </section>

          {pendingMagicCard && (
            <section
              style={{
                marginTop: 16,
                padding: 16,
                borderRadius: 12,
                border: "1px solid #555",
                background: "#181818",
                color: "#eee",
              }}
            >
              <h3>Selecciona objetivo para {pendingMagicCard}</h3>

              {!targetPlayer && (
                <>
                  <p>Elige un jugador objetivo:</p>
                  {state.players
                    .filter((p) => p.id !== myPlayerId)
                    .map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setTargetPlayer(p.id)}
                        style={{ marginRight: 8 }}
                      >
                        {p.name}
                      </button>
                    ))}
                </>
              )}

              {targetPlayer && (
                <>
                  <p>Elige qué unicornio afectar:</p>
                  {state.players
                    .find((p) => p.id === targetPlayer)
                    ?.stable.map((cardId) => {
                      const meta = cardById(cardId);
                      const label = meta
                        ? `${meta.name} (${meta.type})`
                        : cardId;

                      return (
                        <button
                          key={cardId}
                          onClick={() => {
                            if (!socket || !myPlayerId || !targetPlayer) return;
                            socket.emit("action", {
                              type: "PLAY_CARD",
                              playerId: myPlayerId,
                              payload: {
                                cardId: pendingMagicCard,
                                targetPlayerId: targetPlayer,
                                targetCardId: cardId,
                              },
                            });
                            setPendingMagicCard(null);
                            setTargetPlayer(null);
                          }}
                          style={{ marginRight: 8 }}
                        >
                          {label}
                        </button>
                      );
                    })}
                </>
              )}
            </section>
          )}

          <section style={{ marginTop: 24 }}>
            <h3>Estado bruto (debug)</h3>
            <pre
              style={{
                background: "#050505",
                color: "#0f0",
                padding: 16,
                borderRadius: 8,
                maxWidth: "100%",
                overflowX: "auto",
                fontSize: 12,
              }}
            >
              {JSON.stringify(state, null, 2)}
            </pre>
          </section>
        </>
      )}
    </div>
  );
}

export default App;
