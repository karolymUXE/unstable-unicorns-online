import { Card } from "./cardTypes";

export const BASE_CARDS: Card[] = [
  {
    id: "baby-1",
    name: "Unicornio Bebé",
    type: "UNICORN_BABY",
    description: "Un unicornio bebé adorable."
  },
  {
    id: "u-basic-1",
    name: "Unicornio Básico",
    type: "UNICORN_BASIC",
    description: "Un unicornio simple."
  },
  {
    id: "m-destroy-1",
    name: "Llamas del Caos",
    type: "MAGIC",
    description: "Destruye un unicornio enemigo.",
    tags: ["destroy"]
  },
  {
    id: "m-steal-1",
    name: "Robo Brillante",
    type: "MAGIC",
    description: "Roba un unicornio a otro jugador.",
    tags: ["steal"]
  },
  {
    id: "m-protect-1",
    name: "Escudo de Luz",
    type: "MAGIC",
    description: "Ganas un escudo que bloquea robos o destrucciones.",
    tags: ["protect"]
  }
];
