import { describe, it, expect } from '@jest/globals';
import { createInitialGameState } from './setup';
import type { PlayerState } from '../models/PlayerState';

describe('createInitialGameState', () => {
  it('crea un estado inicial con jugadores y mazo', () => {
    const players: PlayerState[] = [
      { id: 'p1', name: 'Jugador 1', hand: [], stable: [], isConnected: true, shields: 0 },
      { id: 'p2', name: 'Jugador 2', hand: [], stable: [], isConnected: true, shields: 0 }
    ];

    const state = createInitialGameState('test-game-1', players);

    expect(state.id).toBe('test-game-1');
    expect(state.players.length).toBe(2);

    // Mazo debe tener cartas
    expect(state.deck.length).toBeGreaterThan(0);

    // Fase inicial
    expect(state.phase).toBe('SETUP');

    // Jugador actual debe ser un jugador válido
    const playerIds = state.players.map((p) => p.id);
    expect(playerIds).toContain(state.currentPlayerId);
  });
});
