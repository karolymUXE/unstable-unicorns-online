export type GameActionType = "DRAW_CARD" | "END_TURN" | "PLAY_CARD";

export interface GameAction {
  type: GameActionType;
  playerId: string;
  payload?: {
    cardId?: string;
    targetPlayerId?: string;
    targetCardId?: string;
  };
}
