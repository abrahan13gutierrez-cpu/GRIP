import type { LessonQuestion } from "@/components/dashboard/quiz-card"

export type DailyPuzzle = LessonQuestion & { id: string; topic: string }

export const DAILY_PUZZLES: DailyPuzzle[] = [
  {
    id: "dp-blk-1",
    topic: "Blocking",
    prompt: "Corredor en tercera, slider en la tierra a tu derecha. ¿Cuál es tu prioridad?",
    options: [
      "Atrapar la bola con el guante",
      "Cortar el ángulo y mantener la bola enfrente",
      "Pararte para tener mejor visión",
    ],
    correct: 1,
    explanation:
      "Con corredor en tercera no buscas atrapar: buscas que la bola muera frente a ti. Cortar el ángulo te deja el pecho hacia home.",
  },
  {
    id: "dp-frm-1",
    topic: "Framing",
    prompt: "Lanzamiento en la esquina baja. ¿Qué hace tu guante al recibir?",
    options: ["Jala la bola hacia el centro", "Recibe firme y sostiene la posición", "Cae con la bola"],
    correct: 1,
    explanation: "Jalar la bola delata el lanzamiento. Recibir firme y sostener le vende el strike al umpire.",
  },
  {
    id: "dp-blk-2",
    topic: "Blocking",
    prompt: "Al bloquear, ¿dónde debe ir el guante?",
    options: ["Abierto hacia la bola", "Tapando el hueco entre las rodillas", "Detrás de la espalda"],
    correct: 1,
    explanation: "El guante sella el hueco entre las piernas; el cuerpo hace el resto del trabajo.",
  },
  {
    id: "dp-frm-2",
    topic: "Framing",
    prompt: "¿Cuándo debe iniciar el movimiento del guante hacia la bola?",
    options: ["Antes de que salga de la mano", "Tarde y corto, ya cerca de la zona", "Nunca, esperas inmóvil"],
    correct: 1,
    explanation: "Un movimiento tardío y corto mantiene el guante silencioso y preciso en la zona.",
  },
  {
    id: "dp-blk-3",
    topic: "Blocking",
    prompt: "¿Qué postura del torso amortigua mejor el rebote?",
    options: ["Erguido y rígido", "Inclinado hacia adelante, hombros redondeados", "Inclinado hacia atrás"],
    correct: 1,
    explanation: "Hombros redondeados y torso hacia adelante absorben el impacto y dejan la bola cerca.",
  },
  {
    id: "dp-frm-3",
    topic: "Framing",
    prompt: "¿Qué parte del cuerpo controla el giro del guante en el framing?",
    options: ["El hombro", "La muñeca", "La cadera"],
    correct: 1,
    explanation: "La muñeca da el giro fino; el hombro y el brazo deben quedar quietos.",
  },
]

const DAY_MS = 86_400_000

/** Índice del rompecabezas de hoy: rota uno por día calendario local. */
export function todayPuzzleIndex(now = new Date()) {
  const localDay = Math.floor((now.getTime() - now.getTimezoneOffset() * 60_000) / DAY_MS)
  return localDay % DAILY_PUZZLES.length
}
