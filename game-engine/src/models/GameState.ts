import { PlayerState } from "./PlayerState";

export type GamePhase = "SETUP" | "MAIN" | "FINISHED";

export interface GameState {
  id: string;
  players: PlayerState[];
  deck: string[];
  discardPile: string[];
  currentPlayerId: string;
  phase: GamePhase;
  winnerId?: string;
}
