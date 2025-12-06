import { GameState } from "../models/GameState";
import { BASE_CARDS } from "../cards/cards.base";
import type { Card } from "../cards/cardTypes";
import type { GameAction } from "../rules/actions";

export class GameEngine {
  private state: GameState;

  constructor(initialState: GameState) {
    this.state = initialState;
  }

  /**
   * Devuelve una copia inmutable del estado actual
   */
  public getState(): GameState {
    return JSON.parse(JSON.stringify(this.state));
  }

  /**
   * Punto de entrada para todas las acciones del juego
   */
  public applyAction(action: GameAction): GameState {
    if (this.state.phase === "FINISHED") {
      throw new Error("La partida ya terminó.");
    }

    switch (action.type) {
      case "DRAW_CARD":
        this.handleDrawCard(action.playerId);
        break;

      case "END_TURN":
        this.handleEndTurn(action.playerId);
        break;

      case "PLAY_CARD":
        this.handlePlayCard(
          action.playerId,
          action.payload?.cardId,
          action.payload?.targetPlayerId,
          action.payload?.targetCardId
        );
        break;

      default:
        throw new Error(`Acción no soportada: ${action.type}`);
    }

    return this.getState();
  }

  // ─────────────────────────────────────────────
  //  Acciones básicas
  // ─────────────────────────────────────────────

  private handleDrawCard(playerId: string) {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) throw new Error("Jugador no encontrado");

    const cardId = this.state.deck.shift();
    if (!cardId) {
      throw new Error("No hay más cartas en el mazo");
    }

    player.hand.push(cardId);
  }

  private handleEndTurn(playerId: string) {
    if (this.state.currentPlayerId !== playerId) {
      throw new Error("No es tu turno");
    }

    const currentIndex = this.state.players.findIndex(
      (p) => p.id === this.state.currentPlayerId
    );

    if (currentIndex === -1) {
      throw new Error("Jugador actual no encontrado en la lista de jugadores");
    }

    const nextIndex = (currentIndex + 1) % this.state.players.length;
    const nextPlayer = this.state.players[nextIndex];

    if (!nextPlayer) {
      throw new Error("No hay siguiente jugador en la partida");
    }

    this.state.currentPlayerId = nextPlayer.id;
  }

  /**
   * Jugar una carta desde la mano
   * Puede ser:
   * - Unicornio (va al establo)
   * - Carta mágica (destroy / steal / protect)
   * - En el futuro: upgrades, downgrades, instant, etc.
   */
  private handlePlayCard(
    playerId: string,
    cardId?: string,
    targetPlayerId?: string,
    targetCardId?: string
  ) {
    if (!cardId) throw new Error("Falta cardId en PLAY_CARD");

    if (this.state.currentPlayerId !== playerId) {
      throw new Error("No es tu turno");
    }

    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) throw new Error("Jugador no encontrado");

    const handIndex = player.hand.indexOf(cardId);
    if (handIndex === -1) {
      throw new Error("La carta no está en tu mano");
    }

    const card = this.getCardById(cardId);
    if (!card) {
      throw new Error("Carta no encontrada en el catálogo");
    }

    // ── Si es unicornio → al establo ─────────────────────
    if (this.isUnicorn(card)) {
      player.hand.splice(handIndex, 1);
      player.stable.push(cardId);
      this.checkWinCondition();
      return;
    }

    // ── Si es carta mágica → aplicar efecto ──────────────
    if (card.type === "MAGIC") {
      if (card.tags?.includes("destroy")) {
        this.applyMagicDestroy(playerId, targetPlayerId, targetCardId);
      } else if (card.tags?.includes("steal")) {
        this.applyMagicSteal(playerId, targetPlayerId, targetCardId);
      } else if (card.tags?.includes("protect")) {
        this.applyMagicProtect(playerId);
      }

      // Después de resolver la magia, la carta se descarta
      player.hand.splice(handIndex, 1);
      this.state.discardPile.push(cardId);
      return;
    }

    // ── FUTURO: UPGRADE, DOWNGRADE, INSTANT, etc. ────────
    // Por ahora, si llega aquí, simplemente descartamos
    player.hand.splice(handIndex, 1);
    this.state.discardPile.push(cardId);
  }

  // ─────────────────────────────────────────────
  //  Helpers de cartas y unicornios
  // ─────────────────────────────────────────────

  private getCardById(cardId: string): Card | undefined {
    return BASE_CARDS.find((c) => c.id === cardId);
  }

  private isUnicorn(card: Card): boolean {
    return (
      card.type === "UNICORN_BABY" ||
      card.type === "UNICORN_BASIC" ||
      card.type === "UNICORN_MAGIC"
    );
  }

  // ─────────────────────────────────────────────
  //  Condición de victoria (simple)
  // ─────────────────────────────────────────────

  /**
   * Regla simple de victoria:
   * el primero que llegue a N unicornios en su establo gana.
   */
  private checkWinCondition() {
    const WIN_UNICORNS = 3; // puedes subir esto después (ej: 7)

    for (const player of this.state.players) {
      const unicornCount = player.stable.reduce((acc, cardId) => {
        const card = this.getCardById(cardId);
        if (card && this.isUnicorn(card)) {
          return acc + 1;
        }
        return acc;
      }, 0);

      if (unicornCount >= WIN_UNICORNS) {
        this.state.phase = "FINISHED";
        this.state.winnerId = player.id;
        break;
      }
    }
  }

  // ─────────────────────────────────────────────
  //  Efectos mágicos: destroy / steal / protect
  // ─────────────────────────────────────────────

  private applyMagicDestroy(
    _playerId: string,
    targetPlayerId?: string,
    targetCardId?: string
  ) {
    if (!targetPlayerId || !targetCardId) {
      throw new Error("Esta carta requiere seleccionar objetivo.");
    }

    const target = this.state.players.find((p) => p.id === targetPlayerId);
    if (!target) throw new Error("Jugador objetivo no encontrado");

    // Si el objetivo tiene escudos, bloquea el efecto
    if ((target.shields ?? 0) > 0) {
      target.shields -= 1;
      return; // no destruimos nada
    }

    const stableIndex = target.stable.indexOf(targetCardId);
    if (stableIndex === -1) {
      throw new Error(
        "La carta objetivo no está en el establo del jugador objetivo"
      );
    }

    const [removed] = target.stable.splice(stableIndex, 1);
    if (!removed) {
      return; // por seguridad, aunque no debería pasar
    }
    this.state.discardPile.push(removed);

    this.checkWinCondition();
  }

  private applyMagicSteal(
    playerId: string,
    targetPlayerId?: string,
    targetCardId?: string
  ) {
    if (!targetPlayerId || !targetCardId) {
      throw new Error("Esta carta requiere seleccionar objetivo.");
    }

    const currentPlayer = this.state.players.find((p) => p.id === playerId);
    if (!currentPlayer) throw new Error("Jugador actual no encontrado");

    const target = this.state.players.find((p) => p.id === targetPlayerId);
    if (!target) throw new Error("Jugador objetivo no encontrado");

    // Escudo del objetivo bloquea el robo
    if ((target.shields ?? 0) > 0) {
      target.shields -= 1;
      return; // no robamos nada
    }

    const stableIndex = target.stable.indexOf(targetCardId);
    if (stableIndex === -1) {
      throw new Error(
        "La carta objetivo no está en el establo del jugador objetivo"
      );
    }

    const [stolenCardId] = target.stable.splice(stableIndex, 1);
    if (!stolenCardId) {
      return; // por seguridad
    }
    currentPlayer.stable.push(stolenCardId);

    this.checkWinCondition();
  }

  private applyMagicProtect(playerId: string) {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) throw new Error("Jugador no encontrado");

    player.shields = (player.shields ?? 0) + 1;
  }
}
