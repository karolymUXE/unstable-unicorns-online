import { GameState } from "../models/GameState";
import { PlayerState } from "../models/PlayerState";
import { BASE_CARDS } from "../cards/cards.base";
import type { Card } from "../cards/cardTypes";

interface InitialPlayerConfig {
  id: string;
  name: string;
}

const INITIAL_BABY_PER_PLAYER = 1;

// Crear estado inicial del juego
export function createInitialGameState(
  gameId: string,
  playersConfig: InitialPlayerConfig[]
): GameState {
  const players: PlayerState[] = playersConfig.map((p) => ({
    id: p.id,
    name: p.name,
    hand: [],
    stable: [],
    isConnected: true,
    shields: 0
  }));

  // 1️⃣ Separar unicornios bebé del resto
  const babyCards = BASE_CARDS.filter((c) => c.type === "UNICORN_BABY");
  const nonBabyCards = BASE_CARDS.filter((c) => c.type !== "UNICORN_BABY");

  // 2️⃣ Construir y barajar el mazo
  let deck: string[] = buildDeck(nonBabyCards, players.length);
  shuffle(deck);

  // 3️⃣ Dar unicornio bebé inicial a cada jugador
  players.forEach((player, index) => {
    for (let i = 0; i < INITIAL_BABY_PER_PLAYER; i++) {
      const baby = babyCards[index % babyCards.length];
      if (baby) {
        player.stable.push(baby.id);
      }
    }
  });

  // 4️⃣ Determinar tamaño de mano inicial
  const handSize = getInitialHandSize(players.length);

  players.forEach((player) => {
    for (let i = 0; i < handSize; i++) {
      const cardId = deck.shift();
      if (!cardId) break;
      player.hand.push(cardId);
    }
  });

  // 5️⃣ Ensamblar el estado del juego
  const state: GameState = {
    id: gameId,
    players,
    deck,
    discardPile: [],
    currentPlayerId: players[0]?.id ?? "",
    phase: "SETUP"
  };

  return state;
}

// Tamaño de mano según número de jugadores
function getInitialHandSize(playerCount: number): number {
  return 5; // Unstable Unicorns usa 5 para 2–8 jugadores
}

// Construir mazo repitiendo cartas suficientes
function buildDeck(nonBabyCards: Card[], playerCount: number): string[] {
  const baseIds = nonBabyCards.map((c) => c.id);
  const repetitions = Math.max(2, playerCount + 1);

  let deck: string[] = [];
  for (let i = 0; i < repetitions; i++) {
    deck = deck.concat(baseIds);
  }

  return deck;
}

// Mezclar (Fisher–Yates)
function shuffle<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = temp;
  }
}
