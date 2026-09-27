/**
 * GRIP — Currículo de Framing.
 *
 * 5 etapas × 5 subniveles = 25 unidades. Cada unidad sigue el ciclo oficial
 * Video → Quiz (2 preguntas, se requiere 2/2 para aprobar) → Práctica (se
 * sube y queda "submitted", puede repetirse sin límite) → Feedback
 * (asíncrono, no bloquea la siguiente unidad).
 *
 * Cada unidad fue diseñada contra los 5 principios de práctica de GRIP:
 * 1. Practica lo que importa      → `habilidad`
 * 2. Haz que cada repetición cuente → `criterio`
 * 3. Hazlo representativo          → `representativo`
 * 4. Repetición sin repetición      → `variacion`
 * 5. Encuentra el desafío apropiado → `desafio`
 *
 * Los playbackId de Mux quedan en `null` hasta que se compartan los IDs
 * reales; una unidad sin video sigue visible y no bloqueada (decisión
 * confirmada). Ver v0_plans/light-solution.md.
 */

export type QuizQuestion = {
  question: string
  options: string[]
  correctIndex: number
}

export type FramingUnit = {
  etapaSlug: string
  etapaTitle: string
  etapaOrder: number
  subnivelSlug: string
  subnivelTitle: string
  order: number
  objetivo: string
  video: { playbackId: string | null; title: string }
  quiz: QuizQuestion[]
  practica: {
    habilidad: string
    representativo: string
    dosis: string
    criterio: string
    variacion: string
    desafio: string
  }
}

type EtapaSeed = {
  slug: string
  title: string
  subniveles: {
    slug: string
    title: string
    objetivo: string
    quiz: QuizQuestion[]
    practica: FramingUnit["practica"]
  }[]
}

const ETAPAS: EtapaSeed[] = [
  {
    slug: "positioning",
    title: "Positioning",
    subniveles: [
      {
        slug: "neutral-receiving-window",
        title: "Neutral receiving window",
        objetivo: "Establecer una postura base y una altura de manos que no delate la zona antes del lanzamiento.",
        quiz: [
          {
            question: "¿Qué señala una ventana de recibo neutral bien construida?",
            options: [
              "El guante está siempre a la altura de la letra del uniforme, sin importar el conteo",
              "La postura y la altura de manos no cambian según dónde crees que llegará el lanzamiento",
              "El catcher se para lo más alto posible para verse imponente",
              "El guante se abre completamente antes de que el pitcher levante la pierna",
            ],
            correctIndex: 1,
          },
          {
            question: "¿Por qué una ventana neutral ayuda al umpire a confiar en tu marco?",
            options: [
              "Porque el umpire ve movimiento agresivo hacia la zona",
              "Porque no anticipa visualmente la ubicación, así que su lectura no está contaminada por tu postura",
              "Porque el catcher se mueve más rápido que el bateador",
              "Porque el umpire ignora la postura del catcher",
            ],
            correctIndex: 1,
          },
        ],
        practica: {
          habilidad:
            "Sostener una postura y altura de manos que sirvan como punto de partida idéntico para cualquier lanzamiento real.",
          representativo:
            "Trabajar con lanzamientos reales o simulados a velocidad de bullpen, no solo posturas estáticas frente al espejo.",
          dosis: "3 series de 8 recibos manteniendo la ventana neutral antes del movimiento del brazo del pitcher.",
          criterio:
            "Éxito = la postura y la altura de guante son idénticas en los 8 recibos, sin ajuste anticipado visible.",
          variacion: "Cambiar el tipo de lanzamiento simulado (recto, quebrado, cambio) sin cambiar la ventana base.",
          desafio: "Progresar de posturas estáticas a recibos con temporizador de reacción reducido.",
        },
      },
      {
        slug: "quiet-setup",
        title: "Quiet setup",
        objetivo: "Eliminar movimiento innecesario del cuerpo y del guante antes de que salga el lanzamiento.",
        quiz: [
          {
            question: "¿Cuál es el objetivo principal de un 'quiet setup'?",
            options: [
              "Moverse lo mínimo posible para no generar ruido visual que compita con el lanzamiento",
              "Mantener las piernas completamente rígidas en todo momento",
              "Levantar el guante repetidamente para mostrar energía",
              "Cambiar de postura cada lanzamiento para confundir al pitcher",
            ],
            correctIndex: 0,
          },
          {
            question: "¿Qué tipo de movimiento SÍ es aceptable en un setup silencioso?",
            options: [
              "Ninguno, el catcher debe estar completamente congelado",
              "Micro-ajustes de balance que no cambian la altura ni la posición del guante",
              "Balanceo constante de cadera para 'calentar'",
              "Levantar el guante por encima de la cabeza entre lanzamientos",
            ],
            correctIndex: 1,
          },
        ],
        practica: {
          habilidad: "Reducir el movimiento previo al lanzamiento que puede delatar anticipación al umpire y al bateador.",
          representativo: "Practicar con el ritmo real de un pitcher (set, mirada al home, inicio del movimiento).",
          dosis: "4 series de 6 setups cronometrados desde el 'set' del pitcher hasta la liberación.",
          criterio: "Éxito = cero desplazamiento visible de manos o torso entre el set y la liberación del lanzamiento.",
          variacion: "Alternar ritmos de pitcher (lento, quick pitch, con corredores en base).",
          desafio: "Aumentar la exigencia agregando distracciones controladas (corredor, señales, cambio de ritmo).",
        },
      },
      {
        slug: "target-alignment",
        title: "Target alignment",
        objetivo: "Alinear cuerpo, guante y objetivo en una sola línea antes de cada lanzamiento.",
        quiz: [
          {
            question: "¿Qué debe estar alineado con el objetivo dado por el coach o el pitcher?",
            options: ["Solo la cabeza", "Solo el guante", "Cuerpo, guante y objetivo en una misma línea", "Solo los pies"],
            correctIndex: 2,
          },
          {
            question: "¿Qué consecuencia tiene una mala alineación de objetivo?",
            options: [
              "Ninguna, el umpire no lo nota",
              "Obliga a un recibo con más movimiento lateral para compensar, debilitando el marco",
              "Hace que el lanzamiento llegue más rápido",
              "Mejora automáticamente el pop time",
            ],
            correctIndex: 1,
          },
        ],
        practica: {
          habilidad: "Presentar un objetivo claro y alineado que el pitcher pueda leer y que minimice el ajuste del recibo.",
          representativo: "Dar el objetivo real a un pitcher lanzando a distancia y velocidad de juego.",
          dosis: "3 series de 10 objetivos con verificación de alineación cuerpo-guante-zona.",
          criterio: "Éxito = el guante llega a la zona objetivo sin cruzar el cuerpo ni requerir un segundo ajuste.",
          variacion: "Cambiar la ubicación del objetivo (adentro, afuera, arriba, abajo) cada repetición.",
          desafio: "Introducir señales cambiadas a último momento para forzar realineación rápida y controlada.",
        },
      },
      {
        slug: "glove-presentation-path",
        title: "Glove presentation path",
        objetivo: "Presentar el guante hacia la zona con una trayectoria directa, sin barrer hacia el strike.",
        quiz: [
          {
            question: "¿Qué caracteriza una mala trayectoria de presentación?",
            options: [
              "Un camino directo desde la ventana neutral hasta el punto de recibo",
              "Barrer el guante hacia la zona después de recibir el lanzamiento fuera de ella",
              "Mantener la muñeca firme durante todo el recibo",
              "Recibir con el codo relajado",
            ],
            correctIndex: 1,
          },
          {
            question: "¿Por qué 'barrer' hacia el strike suele penalizar al catcher con el umpire?",
            options: [
              "Porque es ilegal según las reglas del juego",
              "Porque el umpire ya decidió antes de ver el movimiento del guante hacia la zona",
              "Porque hace que el pitcher lance más lento",
              "Porque el guante se calienta",
            ],
            correctIndex: 1,
          },
        ],
        practica: {
          habilidad: "Construir una trayectoria de guante directa que llegue a tiempo sin necesitar corrección posterior.",
          representativo: "Practicar con lanzamientos a velocidad real en los bordes de la zona, no solo al centro.",
          dosis: "4 series de 8 recibos en el borde de la zona evaluando la línea de llegada del guante.",
          criterio: "Éxito = el guante llega en línea recta desde la ventana neutral, sin desviación lateral post-contacto.",
          variacion: "Variar la velocidad y el borde de la zona (interior/exterior) en cada serie.",
          desafio: "Aumentar la dificultad acercando el objetivo al borde exacto de la zona, donde el margen de error es menor.",
        },
      },
      {
        slug: "positioning-under-movement",
        title: "Positioning under movement",
        objetivo: "Conservar la forma de la postura y el marco al ajustar lateralmente por lanzamientos fuera de línea.",
        quiz: [
          {
            question: "¿Qué debe preservarse cuando el catcher se desplaza lateralmente para un lanzamiento?",
            options: [
              "Solo la velocidad del desplazamiento",
              "La forma de la postura y la calidad del marco, no solo llegar al lanzamiento",
              "Nada, lo único que importa es atrapar la bola",
              "El ángulo de los hombros hacia el dugout",
            ],
            correctIndex: 1,
          },
          {
            question: "¿Qué error común aparece al moverse lateralmente sin control?",
            options: [
              "El catcher gana estabilidad",
              "El torso se abre en exceso y el guante pierde la línea de presentación hacia la zona",
              "El umpire mejora su lectura",
              "El pop time se reduce automáticamente",
            ],
            correctIndex: 1,
          },
        ],
        practica: {
          habilidad: "Moverse lateralmente sin sacrificar la calidad de la postura ni la línea de presentación del guante.",
          representativo: "Recibir lanzamientos reales dirigidos deliberadamente fuera de la posición inicial.",
          dosis: "3 series de 8 desplazamientos laterales (4 a cada lado) manteniendo forma y marco.",
          criterio: "Éxito = la postura final tras el desplazamiento es tan estable como la postura de setup.",
          variacion: "Alternar la distancia y dirección del desplazamiento en cada repetición.",
          desafio: "Reducir el tiempo de reacción disponible antes del desplazamiento requerido.",
        },
      },
    ],
  },
  {
    slug: "pre-catch",
    title: "Pre-catch",
    subniveles: [
      {
        slug: "read-the-pitch",
        title: "Read the pitch",
        objetivo: "Reconocer trayectoria, altura y dirección del lanzamiento lo antes posible tras la liberación.",
        quiz: [
          {
            question: "¿Qué información debe leer primero el catcher tras la liberación del lanzamiento?",
            options: [
              "El tipo de calzado del pitcher",
              "Trayectoria, altura y dirección del lanzamiento",
              "La reacción del público",
              "La posición del árbitro de bases",
            ],
            correctIndex: 1,
          },
          {
            question: "¿Qué pasa si la lectura del lanzamiento es tardía?",
            options: [
              "Mejora automáticamente el marco",
              "El movimiento de recibo se vuelve reactivo y tardío, afectando la presentación",
              "El umpire compensa por el catcher",
              "No tiene ningún efecto",
            ],
            correctIndex: 1,
          },
        ],
        practica: {
          habilidad: "Anticipar con precisión la zona de llegada del lanzamiento en los primeros metros tras la liberación.",
          representativo: "Leer lanzamientos reales de distintos tipos (recto, quebrado, cambio) a distancia de juego.",
          dosis: "4 series de 10 lecturas verbalizadas de trayectoria antes de que el lanzamiento llegue.",
          criterio: "Éxito = la predicción verbalizada de zona coincide con la llegada real en al menos 8 de 10 repeticiones.",
          variacion: "Mezclar tipos de lanzamiento y velocidades sin previo aviso del tipo.",
          desafio: "Reducir la ventana de tiempo disponible para verbalizar la lectura.",
        },
      },
      {
        slug: "early-move-late-settle",
        title: "Early move / late settle",
        objetivo: "Iniciar el movimiento de recibo pronto pero terminar completamente estable antes del contacto.",
        quiz: [
          {
            question: "¿Qué significa 'early move, late settle'?",
            options: [
              "Moverse tarde y terminar temprano",
              "Iniciar el ajuste pronto tras leer el lanzamiento, pero llegar quieto y estable antes de recibir",
              "No moverse en absoluto",
              "Moverse solo después de recibir el lanzamiento",
            ],
            correctIndex: 1,
          },
          {
            question: "¿Por qué es un error terminar el movimiento tarde, justo al momento del contacto?",
            options: [
              "Porque el guante sigue en movimiento al recibir, lo que reduce el control del marco",
              "Porque el umpire lo prefiere así",
              "Porque hace que la bola llegue más rápido",
              "No es un error",
            ],
            correctIndex: 0,
          },
        ],
        practica: {
          habilidad: "Sincronizar el inicio temprano del ajuste con una llegada completamente quieta antes del recibo.",
          representativo: "Practicar con lanzamientos reales que exijan ajuste de posición antes del contacto.",
          dosis: "3 series de 8 recibos evaluando si el guante está quieto al menos 0.1s antes del contacto.",
          criterio: "Éxito = el guante llega a reposo antes del contacto en al menos 7 de 8 repeticiones.",
          variacion: "Variar la magnitud del ajuste necesario (pequeño, mediano, grande).",
          desafio: "Acortar el tiempo de vuelo simulado para exigir decisiones más rápidas sin perder la llegada quieta.",
        },
      },
      {
        slug: "body-to-ball-route",
        title: "Body-to-ball route",
        objetivo: "Mover el cuerpo hacia la ubicación del lanzamiento antes que el guante, no al revés.",
        quiz: [
          {
            question: "¿Qué debe moverse primero hacia la ubicación del lanzamiento?",
            options: ["El guante, solo", "El cuerpo, seguido por el guante como parte de la misma ruta", "La cabeza únicamente", "No debe moverse nada"],
            correctIndex: 1,
          },
          {
            question: "¿Qué problema genera mover solo el guante sin el cuerpo?",
            options: [
              "Ninguno, es más eficiente",
              "El brazo se extiende de forma aislada, perdiendo estabilidad y control del marco",
              "Mejora la velocidad de transferencia",
              "El umpire lo prefiere",
            ],
            correctIndex: 1,
          },
        ],
        practica: {
          habilidad: "Coordinar el desplazamiento del cuerpo y el guante como una sola ruta hacia el lanzamiento.",
          representativo: "Recibir lanzamientos reales que requieran desplazamiento moderado del cuerpo.",
          dosis: "4 series de 6 rutas cuerpo-guante evaluando si el cuerpo lidera el movimiento.",
          criterio: "Éxito = el torso inicia el desplazamiento antes de que el guante se separe de la ventana neutral.",
          variacion: "Cambiar la dirección y distancia del desplazamiento requerido en cada serie.",
          desafio: "Incrementar la velocidad del lanzamiento para reducir el tiempo disponible de coordinación.",
        },
      },
      {
        slug: "timing-the-receive",
        title: "Timing the receive",
        objetivo: "Sincronizar la llegada del guante, la quietud del cuerpo y el momento exacto del contacto.",
        quiz: [
          {
            question: "¿Qué tres elementos deben sincronizarse en el recibo?",
            options: [
              "Velocidad, dirección y sonido",
              "Llegada del guante, quietud del cuerpo y momento del contacto",
              "Respiración, mirada y postura de pies",
              "Nada necesita sincronizarse",
            ],
            correctIndex: 1,
          },
          {
            question: "¿Qué efecto tiene un mal timing en la presentación al umpire?",
            options: [
              "Ninguno",
              "El marco se ve inestable justo en el momento que el umpire evalúa la ubicación",
              "Mejora la velocidad de transferencia",
              "El lanzamiento cambia de trayectoria",
            ],
            correctIndex: 1,
          },
        ],
        practica: {
          habilidad: "Llegar con el guante quieto exactamente en el instante del contacto, ni antes ni después.",
          representativo: "Trabajar con lanzamientos reales de velocidad variable para forzar ajuste de timing.",
          dosis: "3 series de 10 recibos evaluando la sincronía entre quietud y contacto.",
          criterio: "Éxito = el guante está inmóvil en el momento exacto del contacto en al menos 8 de 10 repeticiones.",
          variacion: "Alternar velocidades de lanzamiento entre repeticiones consecutivas.",
          desafio: "Introducir cambios de velocidad no anunciados dentro de la misma serie.",
        },
      },
      {
        slug: "pre-catch-decision-reps",
        title: "Pre-catch decision reps",
        objetivo: "Elegir la ruta de recibo correcta según el tipo de lanzamiento leído, no una respuesta fija.",
        quiz: [
          {
            question: "¿Qué distingue una repetición de decisión de una repetición mecánica simple?",
            options: [
              "Ninguna diferencia real",
              "La decisión de ruta depende de la lectura del lanzamiento, no de un patrón memorizado",
              "La repetición de decisión es siempre más lenta",
              "La repetición mecánica no requiere lectura",
            ],
            correctIndex: 1,
          },
          {
            question: "¿Por qué las 'decision reps' preparan mejor para el juego real?",
            options: [
              "Porque reducen la necesidad de practicar",
              "Porque el catcher enfrenta variabilidad real y debe decidir, igual que en un juego",
              "Porque eliminan la necesidad de leer el lanzamiento",
              "Porque solo se usan lanzamientos rectos",
            ],
            correctIndex: 1,
          },
        ],
        practica: {
          habilidad: "Seleccionar y ejecutar la ruta de recibo correcta según distintos tipos de lanzamiento sin patrón fijo.",
          representativo: "Recibir una secuencia mixta de lanzamientos sin conocer el orden de antemano.",
          dosis: "3 series de 9 recibos con tipo de lanzamiento aleatorio dentro de cada serie.",
          criterio: "Éxito = la ruta elegida coincide con el tipo de lanzamiento real en al menos 7 de 9 repeticiones.",
          variacion: "Cambiar el orden y la mezcla de tipos de lanzamiento en cada serie.",
          desafio: "Aumentar el número de tipos distintos de lanzamiento dentro de la misma serie.",
        },
      },
    ],
  },
  {
    slug: "catch",
    title: "Catch",
    subniveles: [
      {
        slug: "middle-zone-receive",
        title: "Middle-zone receive",
        objetivo: "Recibir lanzamientos centrados en la zona con máxima precisión y mínimo movimiento.",
        quiz: [
          {
            question: "¿Qué caracteriza un buen recibo en la zona media?",
            options: [
              "Movimiento amplio para 'vender' el strike",
              "Precisión y mínimo movimiento, dejando que el marco hable por sí solo",
              "Recibir con el brazo completamente extendido",
              "Cerrar los ojos al contacto",
            ],
            correctIndex: 1,
          },
          {
            question: "¿Por qué la zona media es el punto de referencia para las demás unidades?",
            options: [
              "Porque es la más difícil técnicamente",
              "Porque establece la línea base de calidad de recibo antes de añadir variables de borde",
              "Porque no requiere ninguna técnica",
              "Porque no se usa en juegos reales",
            ],
            correctIndex: 1,
          },
        ],
        practica: {
          habilidad: "Ejecutar el recibo de máxima calidad posible cuando el lanzamiento no exige ajuste de zona.",
          representativo: "Recibir lanzamientos reales centrados en la zona a velocidad de juego.",
          dosis: "3 series de 10 recibos centrados evaluando precisión y quietud post-contacto.",
          criterio: "Éxito = cero movimiento adicional del guante después del contacto en al menos 9 de 10.",
          variacion: "Variar levemente la velocidad del lanzamiento entre series.",
          desafio: "Aumentar la velocidad hasta el límite superior que el catcher puede controlar con precisión.",
        },
      },
      {
        slug: "low-zone-receive",
        title: "Low-zone receive",
        objetivo: "Trabajar el borde bajo de la zona sin colapsar la postura ni perder el marco.",
        quiz: [
          {
            question: "¿Qué error es común al recibir lanzamientos bajos?",
            options: [
              "Mantener el pecho erguido",
              "Colapsar los hombros y dejar caer el marco por debajo de la zona",
              "Mover solo la muñeca",
              "No cambiar nada respecto a la zona media",
            ],
            correctIndex: 1,
          },
          {
            question: "¿Qué debe mantenerse estable al recibir en el borde bajo?",
            options: [
              "La altura de los hombros y la postura del torso",
              "Nada, todo el cuerpo puede colapsar",
              "Solo la cabeza",
              "El brazo libre",
            ],
            correctIndex: 0,
          },
        ],
        practica: {
          habilidad: "Recibir en el borde bajo de la zona conservando una postura de torso estable.",
          representativo: "Recibir lanzamientos reales dirigidos deliberadamente al borde bajo de la zona.",
          dosis: "4 series de 8 recibos bajos evaluando la altura del torso antes y después del contacto.",
          criterio: "Éxito = la altura de hombros no cae más de un margen mínimo definido por el coach en 7 de 8.",
          variacion: "Alternar velocidad y ligera variación horizontal dentro del borde bajo.",
          desafio: "Acercar el objetivo al límite inferior real de la zona de strike.",
        },
      },
      {
        slug: "glove-side-receive",
        title: "Glove-side receive",
        objetivo: "Ganar presentación y control en los lanzamientos hacia el lado del guante.",
        quiz: [
          {
            question: "¿Qué ventaja mecánica existe en el lado del guante?",
            options: [
              "Ninguna, es igual de difícil que el lado del brazo",
              "La muñeca y el guante pueden rotar naturalmente hacia la zona sin cruzar el cuerpo",
              "El catcher no necesita moverse",
              "El umpire ve mejor este lado",
            ],
            correctIndex: 1,
          },
          {
            question: "¿Qué error reduce la calidad del marco en el lado del guante?",
            options: [
              "Rotar la muñeca hacia la zona con control",
              "Dejar que el guante se abra hacia afuera de la zona en lugar de rotar hacia adentro",
              "Mantener el codo relajado",
              "Leer el lanzamiento temprano",
            ],
            correctIndex: 1,
          },
        ],
        practica: {
          habilidad: "Aprovechar la rotación natural de muñeca en el lado del guante para presentar hacia la zona.",
          representativo: "Recibir lanzamientos reales dirigidos al lado del guante en distintos conteos.",
          dosis: "3 series de 8 recibos evaluando la rotación de muñeca hacia la zona, no hacia afuera.",
          criterio: "Éxito = el guante termina orientado hacia la zona en al menos 7 de 8 repeticiones.",
          variacion: "Variar la distancia del lanzamiento respecto al borde de la zona.",
          desafio: "Acercar el objetivo al borde extremo del lado del guante.",
        },
      },
      {
        slug: "arm-side-receive",
        title: "Arm-side receive",
        objetivo: "Controlar los lanzamientos hacia el lado del brazo sin que el guante se arrastre fuera de la zona.",
        quiz: [
          {
            question: "¿Qué riesgo mecánico aparece en el lado del brazo?",
            options: [
              "El guante se arrastra hacia afuera de la zona por la rotación natural del brazo",
              "El catcher no necesita ajustar nada",
              "La muñeca rota automáticamente hacia adentro",
              "No existe ningún riesgo distinto al lado del guante",
            ],
            correctIndex: 0,
          },
          {
            question: "¿Cómo se controla el arrastre en el lado del brazo?",
            options: [
              "Dejando que el brazo se extienda por completo",
              "Con control activo de muñeca y codo para frenar el recibo dentro de la zona",
              "Cerrando los ojos antes del contacto",
              "Girando todo el torso hacia el otro lado",
            ],
            correctIndex: 1,
          },
        ],
        practica: {
          habilidad: "Frenar activamente el recibo en el lado del brazo para evitar que el guante salga de la zona.",
          representativo: "Recibir lanzamientos reales dirigidos al lado del brazo en distintos conteos.",
          dosis: "4 series de 8 recibos evaluando si el guante se detiene dentro del límite de la zona.",
          criterio: "Éxito = el guante no cruza el borde de la zona hacia afuera en al menos 7 de 8 repeticiones.",
          variacion: "Variar la velocidad del lanzamiento y la distancia al borde de la zona.",
          desafio: "Acercar el objetivo al borde extremo del lado del brazo.",
        },
      },
      {
        slug: "catch-consistency",
        title: "Catch consistency",
        objetivo: "Repetir la mecánica de recibo con calidad constante bajo variación de velocidad y ubicación.",
        quiz: [
          {
            question: "¿Qué mide esta unidad principalmente?",
            options: [
              "La velocidad máxima del lanzamiento",
              "La consistencia del recibo cuando velocidad y ubicación cambian sin previo aviso",
              "El tamaño del guante",
              "La altura del catcher",
            ],
            correctIndex: 1,
          },
          {
            question: "¿Por qué la consistencia bajo variación es más valiosa que la perfección en una sola condición?",
            options: [
              "Porque el juego real presenta variabilidad constante de velocidad y ubicación",
              "Porque no lo es, la perfección en una condición es suficiente",
              "Porque los jueces solo evalúan una condición",
              "Porque reduce el tiempo de práctica",
            ],
            correctIndex: 0,
          },
        ],
        practica: {
          habilidad: "Mantener la calidad de recibo aprendida en las unidades anteriores bajo condiciones mixtas.",
          representativo: "Recibir una secuencia mixta de velocidades y ubicaciones dentro de la zona.",
          dosis: "3 series de 12 recibos con velocidad y ubicación aleatorias dentro de cada serie.",
          criterio: "Éxito = al menos 9 de 12 recibos cumplen el criterio de calidad de su zona correspondiente.",
          variacion: "Randomizar el orden de velocidad/ubicación en cada serie, sin patrón repetible.",
          desafio: "Reducir el tiempo de reacción disponible entre lanzamientos consecutivos.",
        },
      },
    ],
  },
  {
    slug: "post-catch",
    title: "Post-catch",
    subniveles: [
      {
        slug: "stick-the-pitch",
        title: "Stick the pitch",
        objetivo: "Mantener la presentación del guante inmóvil un instante después del contacto.",
        quiz: [
          {
            question: "¿Qué significa 'stick the pitch'?",
            options: [
              "Mover el guante inmediatamente después del contacto",
              "Mantener el guante quieto en el punto de recibo un instante después del contacto",
              "Lanzar la bola de vuelta al pitcher rápido",
              "Cerrar el guante con fuerza excesiva",
            ],
            correctIndex: 1,
          },
          {
            question: "¿Qué transmite al umpire un buen 'stick'?",
            options: [
              "Que el catcher tiene dudas sobre la ubicación",
              "Confianza y estabilidad sobre dónde llegó realmente el lanzamiento",
              "Que el lanzamiento fue muy rápido",
              "Nada, el umpire no lo percibe",
            ],
            correctIndex: 1,
          },
        ],
        practica: {
          habilidad: "Sostener la posición de recibo el tiempo justo para que el umpire confirme la ubicación.",
          representativo: "Recibir lanzamientos reales y mantener el 'stick' antes de cualquier otro movimiento.",
          dosis: "3 series de 10 recibos midiendo el tiempo de quietud posterior al contacto.",
          criterio: "Éxito = al menos 0.5s de quietud post-contacto en 8 de 10 repeticiones.",
          variacion: "Variar la ubicación del lanzamiento (centro, borde) manteniendo el mismo estándar de stick.",
          desafio: "Aumentar el tiempo mínimo de quietud exigido conforme mejora la consistencia.",
        },
      },
      {
        slug: "quiet-finish",
        title: "Quiet finish",
        objetivo: "Evitar recoil, pull-off o cualquier movimiento posterior que reste presentación al recibo.",
        quiz: [
          {
            question: "¿Qué es un 'pull-off'?",
            options: [
              "Un tipo de lanzamiento",
              "El movimiento del guante hacia afuera de la zona inmediatamente después de recibir",
              "Una señal del catcher al pitcher",
              "Un ajuste de postura antes del lanzamiento",
            ],
            correctIndex: 1,
          },
          {
            question: "¿Qué efecto tiene el 'recoil' en la percepción del umpire?",
            options: [
              "Ninguno, el umpire ya decidió",
              "Puede sugerir que el catcher no confía en la ubicación, debilitando la llamada",
              "Mejora la llamada del umpire",
              "Acelera la transferencia",
            ],
            correctIndex: 1,
          },
        ],
        practica: {
          habilidad: "Eliminar movimientos de retroceso o salida del guante inmediatamente después del recibo.",
          representativo: "Recibir lanzamientos reales en los bordes, donde el recoil es más probable.",
          dosis: "4 series de 8 recibos evaluando ausencia de recoil o pull-off visible.",
          criterio: "Éxito = cero movimiento de retroceso detectable en al menos 7 de 8 repeticiones.",
          variacion: "Variar la ubicación del lanzamiento hacia los bordes donde el recoil tiende a aparecer.",
          desafio: "Introducir lanzamientos en el límite exacto de la zona, donde la tentación de recoil es mayor.",
        },
      },
      {
        slug: "transfer-without-leak",
        title: "Transfer without leak",
        objetivo: "Transferir la bola a la mano de tiro sin perder la forma del recibo previo.",
        quiz: [
          {
            question: "¿Qué debe ocurrir antes de iniciar la transferencia?",
            options: [
              "El 'stick' del recibo debe completarse primero",
              "La transferencia debe empezar antes del contacto",
              "El catcher debe pararse",
              "No hay ningún orden requerido",
            ],
            correctIndex: 0,
          },
          {
            question: "¿Qué significa 'leak' en este contexto?",
            options: [
              "Un tipo de lanzamiento quebrado",
              "Pérdida de forma o control durante la transferencia que compromete la presentación previa",
              "Un error de comunicación con el pitcher",
              "La velocidad de la bola",
            ],
            correctIndex: 1,
          },
        ],
        practica: {
          habilidad: "Ejecutar la transferencia a la mano de tiro sin sacrificar la calidad del recibo que la precede.",
          representativo: "Practicar la secuencia completa: recibo real, stick breve, transferencia.",
          dosis: "3 series de 8 secuencias completas evaluando la forma del recibo previo a la transferencia.",
          criterio: "Éxito = la forma del recibo se mantiene intacta hasta iniciar la transferencia en 7 de 8.",
          variacion: "Variar la ubicación del recibo antes de la transferencia (centro, bordes).",
          desafio: "Reducir progresivamente el tiempo permitido entre stick y transferencia.",
        },
      },
      {
        slug: "reset-for-the-next-pitch",
        title: "Reset for the next pitch",
        objetivo: "Volver a la posición neutral de forma eficiente después de cada lanzamiento.",
        quiz: [
          {
            question: "¿Por qué es importante el reset eficiente entre lanzamientos?",
            options: [
              "Porque prepara la ventana neutral para el siguiente lanzamiento sin gastar tiempo ni energía",
              "Porque impresiona al público",
              "Porque acelera el reloj de lanzamiento",
              "No tiene ninguna importancia real",
            ],
            correctIndex: 0,
          },
          {
            question: "¿Qué caracteriza un reset ineficiente?",
            options: [
              "Movimientos mínimos y directos hacia la ventana neutral",
              "Movimientos excesivos o lentos que retrasan la preparación para el siguiente lanzamiento",
              "Volver exactamente a la misma postura de antes",
              "Mantener la calma",
            ],
            correctIndex: 1,
          },
        ],
        practica: {
          habilidad: "Recuperar la ventana neutral de forma rápida y directa tras cada recibo.",
          representativo: "Practicar secuencias de varios lanzamientos consecutivos con reset entre cada uno.",
          dosis: "3 series de 10 lanzamientos consecutivos evaluando el tiempo y la calidad del reset.",
          criterio: "Éxito = la ventana neutral se recupera completamente en menos del tiempo objetivo definido por el coach en 8 de 10.",
          variacion: "Variar el ritmo entre lanzamientos consecutivos dentro de la misma serie.",
          desafio: "Reducir el tiempo disponible entre lanzamientos consecutivos.",
        },
      },
      {
        slug: "post-catch-under-time",
        title: "Post-catch under time",
        objetivo: "Conservar la calidad de stick, finish y transferencia bajo presión de tiempo real de juego.",
        quiz: [
          {
            question: "¿Qué evalúa esta unidad respecto a las anteriores del módulo?",
            options: [
              "Una habilidad completamente nueva sin relación con las anteriores",
              "Si el stick, el finish limpio y la transferencia se mantienen cuando se reduce el tiempo disponible",
              "Solo la velocidad de lanzamiento del pitcher",
              "La opinión del umpire sobre el catcher",
            ],
            correctIndex: 1,
          },
          {
            question: "¿Qué ocurre típicamente cuando la presión de tiempo es alta y la técnica no está consolidada?",
            options: [
              "La técnica mejora automáticamente",
              "El stick se acorta, aparece recoil o la transferencia se apresura perdiendo forma",
              "No hay ningún cambio observable",
              "El umpire ajusta sus llamadas",
            ],
            correctIndex: 1,
          },
        ],
        practica: {
          habilidad: "Sostener los estándares de stick, finish y transferencia cuando el tiempo disponible se reduce.",
          representativo: "Simular situaciones de juego con corredores en base y presión de tiempo real.",
          dosis: "3 series de 8 secuencias completas bajo un límite de tiempo definido por el coach.",
          criterio: "Éxito = se mantienen los criterios de stick/finish/transferencia en al menos 6 de 8 bajo presión.",
          variacion: "Variar el tipo de presión (corredor robando, conteo de dos strikes, quick pitch).",
          desafio: "Reducir progresivamente el margen de tiempo disponible en cada serie sucesiva.",
        },
      },
    ],
  },
  {
    slug: "skill-blending",
    title: "Skill blending",
    subniveles: [
      {
        slug: "full-sequence-reps",
        title: "Full-sequence reps",
        objetivo: "Unir posicionamiento, pre-catch, catch y post-catch en una sola secuencia fluida.",
        quiz: [
          {
            question: "¿Qué integra una 'full-sequence rep'?",
            options: [
              "Solo la fase de catch",
              "Positioning, pre-catch, catch y post-catch en una sola repetición continua",
              "Únicamente el quiz de cada unidad",
              "Solo la transferencia",
            ],
            correctIndex: 1,
          },
          {
            question: "¿Por qué es necesario practicar la secuencia completa y no solo las fases aisladas?",
            options: [
              "Porque el juego real exige ejecutar todas las fases enlazadas, no una por separado",
              "Porque las fases aisladas ya no son útiles",
              "Porque es más corto de practicar",
              "No es necesario, las fases aisladas bastan",
            ],
            correctIndex: 0,
          },
        ],
        practica: {
          habilidad: "Ejecutar la secuencia completa de framing sin fracturas entre fases.",
          representativo: "Recibir lanzamientos reales completos de principio a fin, sin pausas entre fases.",
          dosis: "3 series de 8 secuencias completas evaluando fluidez entre las cuatro fases.",
          criterio: "Éxito = no hay pausas ni correcciones visibles entre fases en al menos 6 de 8 repeticiones.",
          variacion: "Variar tipo, velocidad y ubicación del lanzamiento en cada repetición.",
          desafio: "Incrementar la exigencia técnica de cada fase individual dentro de la secuencia completa.",
        },
      },
      {
        slug: "variable-locations",
        title: "Variable locations",
        objetivo: "Responder con calidad constante a ubicaciones impredecibles dentro y en el borde de la zona.",
        quiz: [
          {
            question: "¿Qué hace impredecible esta unidad respecto a las anteriores?",
            options: [
              "El catcher conoce la ubicación exacta de cada lanzamiento antes de que salga",
              "La ubicación de cada lanzamiento se decide sin aviso previo al catcher",
              "Todos los lanzamientos van al centro",
              "No hay ninguna diferencia con 'catch consistency'",
            ],
            correctIndex: 1,
          },
          {
            question: "¿Qué habilidad de unidades previas se pone a prueba directamente aquí?",
            options: ["Solo la lectura del lanzamiento (pre-catch)", "Ninguna, es una habilidad nueva", "La combinación de lectura, recibo por zona y post-catch", "Solo el reset"],
            correctIndex: 2,
          },
        ],
        practica: {
          habilidad: "Adaptar la ejecución completa del framing a ubicaciones que el catcher no conoce de antemano.",
          representativo: "Recibir lanzamientos reales con ubicación decidida por el coach sin avisar al catcher.",
          dosis: "3 series de 10 recibos con ubicación aleatoria en cada repetición.",
          criterio: "Éxito = al menos 8 de 10 recibos cumplen el estándar de calidad de su zona correspondiente.",
          variacion: "Randomizar completamente el orden y la combinación de ubicaciones en cada serie.",
          desafio: "Reducir el margen de zona considerado 'aceptable', exigiendo mayor precisión.",
        },
      },
      {
        slug: "game-speed-framing",
        title: "Game-speed framing",
        objetivo: "Ejecutar la secuencia completa de framing a la velocidad real de un juego competitivo.",
        quiz: [
          {
            question: "¿Qué diferencia principal introduce 'game-speed framing'?",
            options: [
              "Un guante distinto",
              "La velocidad y el ritmo se acercan a las condiciones reales de un juego competitivo",
              "Se elimina el post-catch",
              "Se practica sin lanzamientos reales",
            ],
            correctIndex: 1,
          },
          {
            question: "¿Qué riesgo existe si se salta esta unidad y se pasa directo al juego?",
            options: [
              "Ninguno, la velocidad no afecta la técnica",
              "La técnica aprendida a ritmo controlado puede degradarse bajo la velocidad real del juego",
              "El catcher lanza más rápido automáticamente",
              "El umpire ajusta su lectura",
            ],
            correctIndex: 1,
          },
        ],
        practica: {
          habilidad: "Sostener la calidad técnica de la secuencia completa a velocidad de juego competitivo.",
          representativo: "Recibir lanzamientos a velocidad de juego real, con pitcher a distancia y ritmo real.",
          dosis: "3 series de 10 secuencias completas a velocidad de juego evaluando degradación técnica.",
          criterio: "Éxito = la calidad técnica no se degrada respecto al ritmo controlado en al menos 7 de 10.",
          variacion: "Variar tipo de lanzamiento, ubicación y ritmo del pitcher entre repeticiones.",
          desafio: "Incrementar progresivamente la velocidad hasta el límite competitivo real del jugador.",
        },
      },
      {
        slug: "count-and-context",
        title: "Count and context",
        objetivo: "Adaptar la decisión de recibo al conteo, la situación de corredores y el momento del juego.",
        quiz: [
          {
            question: "¿Qué factor añade esta unidad respecto a 'game-speed framing'?",
            options: [
              "Ninguno, es idéntica",
              "El contexto del juego (conteo, corredores, situación) que puede cambiar la decisión del catcher",
              "Solo la velocidad del lanzamiento",
              "El tamaño del guante",
            ],
            correctIndex: 1,
          },
          {
            question: "¿Por qué el conteo puede cambiar la prioridad del catcher en un lanzamiento límite?",
            options: [
              "No debería cambiar nunca la prioridad",
              "Porque el riesgo de una llamada equivocada varía según el conteo y la situación del juego",
              "Porque el conteo no tiene relación con el framing",
              "Porque el umpire cambia las reglas según el conteo",
            ],
            correctIndex: 1,
          },
        ],
        practica: {
          habilidad: "Ajustar la ejecución del framing considerando el conteo y la situación de juego, no solo la mecánica.",
          representativo: "Simular situaciones con conteo y corredores anunciados antes de cada lanzamiento.",
          dosis: "3 series de 8 secuencias completas con contexto de juego variable en cada repetición.",
          criterio: "Éxito = la ejecución respeta la prioridad situacional definida por el coach en al menos 6 de 8.",
          variacion: "Variar conteo, número de outs y situación de corredores en cada repetición.",
          desafio: "Añadir situaciones de alta presión (dos strikes, corredor en tercera) con menor margen de error.",
        },
      },
      {
        slug: "evaluation-circuit",
        title: "Evaluation circuit",
        objetivo: "Cerrar la etapa con un circuito final evaluado mediante una rúbrica objetiva y repetible.",
        quiz: [
          {
            question: "¿Qué distingue al 'evaluation circuit' de las prácticas anteriores?",
            options: [
              "Es idéntico a cualquier otra práctica",
              "Se evalúa formalmente contra una rúbrica objetiva que resume las 24 unidades previas",
              "No incluye ningún lanzamiento real",
              "Solo se evalúa el quiz, no la práctica",
            ],
            correctIndex: 1,
          },
          {
            question: "¿Por qué la rúbrica debe ser objetiva y repetible?",
            options: [
              "Para que dependa únicamente de la opinión subjetiva del coach en ese momento",
              "Para que el resultado sea comparable entre catchers y a lo largo del tiempo",
              "Porque no importa la consistencia de la evaluación",
              "Para que cada evaluación use criterios distintos",
            ],
            correctIndex: 1,
          },
        ],
        practica: {
          habilidad: "Demostrar el dominio integrado de las cinco etapas de Framing en un solo circuito evaluado.",
          representativo: "Ejecutar un circuito de juego real que combine ubicación, velocidad, conteo y contexto variables.",
          dosis: "1 circuito de 20 lanzamientos evaluado con la rúbrica de las 4-5 criterios observables definidos por GRIP.",
          criterio: "Éxito = alcanzar el puntaje mínimo de la rúbrica definido por el coach para considerar la etapa dominada.",
          variacion: "El circuito combina de forma aleatoria todas las variables trabajadas en las unidades anteriores.",
          desafio: "Repetir el circuito con un puntaje mínimo más exigente conforme el catcher avanza de nivel.",
        },
      },
    ],
  },
]

export const FRAMING_UNITS: FramingUnit[] = ETAPAS.flatMap((etapa, etapaIdx) =>
  etapa.subniveles.map((s, sIdx) => ({
    etapaSlug: etapa.slug,
    etapaTitle: etapa.title,
    etapaOrder: etapaIdx + 1,
    subnivelSlug: s.slug,
    subnivelTitle: s.title,
    order: sIdx + 1,
    objetivo: s.objetivo,
    // Playback IDs pendientes: se conectan cuando se comparta el mapa etapa/subnivel → playbackId.
    video: { playbackId: null, title: s.title },
    quiz: s.quiz,
    practica: s.practica,
  })),
)

export function getFramingEtapas() {
  return ETAPAS.map((e, i) => ({ slug: e.slug, title: e.title, order: i + 1 }))
}

export function getFramingUnit(etapaSlug: string, subnivelSlug: string): FramingUnit | null {
  return FRAMING_UNITS.find((u) => u.etapaSlug === etapaSlug && u.subnivelSlug === subnivelSlug) ?? null
}

export function unitKey(u: Pick<FramingUnit, "etapaSlug" | "subnivelSlug">) {
  return `${u.etapaSlug}/${u.subnivelSlug}`
}

export function unitHref(u: Pick<FramingUnit, "etapaSlug" | "subnivelSlug">) {
  return `/cursos/framing/${u.etapaSlug}/${u.subnivelSlug}`
}

export function nextUnit(current: Pick<FramingUnit, "etapaSlug" | "subnivelSlug">): FramingUnit | null {
  const idx = FRAMING_UNITS.findIndex((u) => u.etapaSlug === current.etapaSlug && u.subnivelSlug === current.subnivelSlug)
  if (idx === -1) return null
  return FRAMING_UNITS[idx + 1] ?? null
}

export const FRAMING_TOTAL_UNITS = FRAMING_UNITS.length
