import { describe, it, expect } from '@jest/globals';
import { GameEngine } from './GameEngine';
import { createInitialGameState } from '../rules/setup';
import type { PlayerState } from '../models/PlayerState';

describe('GameEngine - flujo básico de turno', () => {
  it('permite robar carta y pasar turno', () => {
    const players: PlayerState[] = [
      { id: 'p1', name: 'Jugador 1', hand: [], stable: [], isConnected: true, shields: 0 },
      { id: 'p2', name: 'Jugador 2', hand: [], stable: [], isConnected: true, shields: 0 }
    ];

    const initialState = createInitialGameState('game-1', players);
    const engine = new GameEngine(initialState);

    const stateBefore = engine.getState();
    const beforeDeck = stateBefore.deck.length;
    const beforeHandP1 = stateBefore.players.find((p) => p.id === 'p1')?.hand.length ?? 0;
    const currentPlayer = stateBefore.currentPlayerId;

    // Acción: robar carta
    engine.applyAction({
      type: 'DRAW_CARD',
      playerId: currentPlayer
    } as any);

    const stateAfterDraw = engine.getState();
    const afterDeck = stateAfterDraw.deck.length;
    const afterHandP1 = stateAfterDraw.players.find((p) => p.id === 'p1')?.hand.length ?? 0;

    // El mazo debe tener una carta menos
    expect(afterDeck).toBeLessThan(beforeDeck);

    // Si el jugador actual era p1, su mano debe crecer
    if (currentPlayer === 'p1') {
      expect(afterHandP1).toBeGreaterThan(beforeHandP1);
    }

    const previousPlayer = stateAfterDraw.currentPlayerId;

    // Acción: pasar turno
    engine.applyAction({
      type: 'END_TURN',
      playerId: previousPlayer
    } as any);

    const stateAfterEndTurn = engine.getState();
    const newCurrent = stateAfterEndTurn.currentPlayerId;

    // El turno debe cambiar
    expect(newCurrent).not.toBe(previousPlayer);
  });
});
