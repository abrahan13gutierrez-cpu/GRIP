import type { LucideIcon } from 'lucide-react'
import { Eye, Flag, ShieldHalf, Target, Trophy, Zap } from 'lucide-react'

export interface Course {
  id: string
  title: string
  description: string
  icon: LucideIcon
  /** 0-100 */
  progress: number
  modules: number
  lessons: number
}

export const COURSES: Course[] = [
  {
    id: 'empieza-aqui',
    title: 'Empieza aquí: ¿Qué es GRIP?',
    description: 'Descubre cómo vas a convertirte en el catcher que todo pitcher quiere tener detrás del plato.',
    icon: Flag,
    progress: 100,
    modules: 1,
    lessons: 3,
  },
  {
    id: 'fundamentos-del-catcher',
    title: 'Fundamentos del Catcher',
    description: 'Recepción, bloqueo y lanzamiento: las tres bases que separan a un catcher promedio de uno élite.',
    icon: Target,
    progress: 40,
    modules: 3,
    lessons: 6,
  },
  {
    id: 'bloqueo-avanzado',
    title: 'Bloqueo avanzado',
    description: 'Domina las bolas en el suelo y aprende a leer el rebote antes de que ocurra.',
    icon: ShieldHalf,
    progress: 0,
    modules: 2,
    lessons: 5,
  },
  {
    id: 'pop-time',
    title: 'Pop time y lanzamiento',
    description: 'Footwork, transferencia y brazo para sacar out al corredor en segunda.',
    icon: Zap,
    progress: 18,
    modules: 2,
    lessons: 6,
  },
  {
    id: 'lectura-del-juego',
    title: 'Lectura del juego',
    description: 'Llama pitcheos con intención: lee al bateador, la cuenta y la situación.',
    icon: Eye,
    progress: 0,
    modules: 3,
    lessons: 8,
  },
  {
    id: 'mentalidad-elite',
    title: 'Mentalidad élite',
    description: 'Liderazgo, comunicación con el pitcher y control emocional en el plato.',
    icon: Trophy,
    progress: 75,
    modules: 2,
    lessons: 4,
  },
]
