export type CardType =
  | "UNICORN_BABY"
  | "UNICORN_BASIC"
  | "UNICORN_MAGIC"
  | "MAGIC"
  | "UPGRADE"
  | "DOWNGRADE"
  | "INSTANT";

export type CardEffectTag =
  | "destroy"
  | "steal"
  | "protect"
  | "force_discard"
  | "draw_extra";

export interface Card {
  id: string;
  name: string;
  type: CardType;
  description: string;
  tags?: CardEffectTag[];
}
