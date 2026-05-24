
'use server';
/**
 * @fileOverview Agente de IA para refinar un horario.
 *
 * - refinarHorario - Una función que toma un horario y lo refina basándose en recomendaciones de IA.
 * - EntradaRefinarHorario - El tipo de entrada para la función refinarHorario.
 * - SalidaRefinarHorario - El tipo de retorno para la función refinarHorario.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { DiaDeSemana } from '@/lib/types'; // Asegurarse de importar el tipo correcto


const EntradaRefinarHorarioSchema = z.object({
  horario: z
    .string()
    .describe('El horario actual como un objeto JSON en formato de cadena. La cadena JSON representa un objeto donde las claves son los días de la semana (p.ej., "Lunes") y los valores son arrays de objetos de clase. Cada objeto de clase tiene "id", "asignatura", "dia", "horaInicio", "horaFin", y opcionalmente "profesor", "ubicacion".'),
  restriccionesHorario: z
    .string()
    .describe('La instrucción principal del usuario sobre qué refinar. Esto puede incluir detalles del estudiante (nombre, carrera, semestre, disponibilidad) si son relevantes para el refinamiento, además de las restricciones para el horario, como horarios de clase o profesores preferidos.'),
});
export type EntradaRefinarHorario = z.infer<typeof EntradaRefinarHorarioSchema>;

const SalidaRefinarHorarioSchema = z.object({
  horarioRefinado: z.string().describe('El horario refinado como una cadena JSON. La cadena JSON debe representar un objeto donde las claves son los días de la semana (p.ej., "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo") y cada valor es un array de objetos de clase. Cada objeto de clase debe incluir: "id" (un identificador de cadena único, puede ser preservado de la entrada o regenerado si es necesario), "asignatura" (cadena), "dia" (cadena, debe ser uno de los valores de DiaDeSemana), "horaInicio" (cadena, formato "HH:mm"), "horaFin" (cadena, formato "HH:mm"). Campos opcionales por objeto de clase son "profesor" (cadena) y "ubicacion" (cadena). Asegúrate de que horaInicio sea anterior a horaFin. Asegúrate de que los nombres de los días coincidan estrictamente con los valores permitidos de DiaDeSemana: "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo".'),
  recomendaciones: z
    .string()
    .describe('Una lista de recomendaciones para refinar el horario.'),
  preguntaAclaratoria: z.string().optional().describe("Si las restricciones o detalles del usuario para el refinamiento fueron ambiguos, se hicieron suposiciones importantes, o si una solicitud de adición de clase crea un conflicto con una clase existente y no hay instrucción explícita de reemplazo, proporciona aquí una pregunta de clarificación, una lista de las suposiciones hechas, o la descripción del conflicto para que el usuario las revise. El contenido de esta pregunta o lista debe estar en español. Si la instrucción fue clara y no hay conflictos no resueltos por el usuario, este campo puede omitirse.")
});
export type SalidaRefinarHorario = z.infer<typeof SalidaRefinarHorarioSchema>;

export async function refinarHorario(input: EntradaRefinarHorario): Promise<SalidaRefinarHorario> {
  return flujoRefinarHorario(input);
}

const promptRefinarHorario = ai.definePrompt({
  name: 'promptRefinarHorario',
  input: {schema: EntradaRefinarHorarioSchema},
  output: {schema: SalidaRefinarHorarioSchema},
  prompt: `Eres un asistente de horarios IA que ayuda a los estudiantes a refinar sus horarios.

  Considera el horario actual y la instrucción proporcionada en 'restriccionesHorario' para refinar el horario.
  La instrucción en 'restriccionesHorario' es la fuente principal de información. Puede contener detalles del estudiante (nombre, carrera, disponibilidad, etc.) si el usuario los proporciona y son relevantes para la tarea de refinamiento, además de las restricciones o cambios deseados.
  
  Horario Actual (cadena JSON): {{{horario}}}
  Instrucción Principal del Usuario (Restricciones y Detalles): {{{restriccionesHorario}}}

  Devuelve el horario refinado como una cadena JSON. La cadena JSON debe representar un objeto donde las claves son los días de la semana (p.ej., "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo") y cada valor es un array de objetos de clase.
  Cada objeto de clase debe incluir los siguientes campos:
  - "id": Un identificador de cadena único para la clase (cadena, intenta preservar el de la entrada si la clase es similar, de lo contrario genera uno nuevo como "ASIGNATURA-DIA-HORA").
  - "asignatura": El nombre de la asignatura o curso (cadena).
  - "dia": El día de la semana para esta sesión de clase (cadena, debe ser uno de "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo").
  - "horaInicio": La hora de inicio de la clase en formato "HH:mm" (cadena).
  - "horaFin": La hora de fin de la clase en formato "HH:mm" (cadena).
  Campos opcionales para cada objeto de clase:
  - "profesor": El nombre del profesor (cadena, opcional).
  - "ubicacion": La ubicación de la clase (cadena, opcional).

  Asegúrate de que el horario refinado sea realista, factible y bien estructurado. Específicamente, asegúrate de que para cada clase, horaInicio sea anterior a horaFin.
  Los nombres de los días en las claves JSON y en el campo "dia" de los objetos de clase deben coincidir estrictamente con uno de los valores DiaDeSemana permitidos.

  **Crucial: Manejo de Superposiciones y Modificaciones:**
  1. NO DEBES programar múltiples clases que se superpoken en tiempo en el mismo día en el horario final.
  2. Si la instrucción del usuario pide añadir una nueva clase que entraría en conflicto con una clase existente en el horario actual, NO debes eliminar la clase existente para hacer espacio para la nueva, a menos que la instrucción del usuario pida explícitamente modificar o reemplazar la clase existente.
  3. En caso de un conflicto potencial al añadir una clase (según el punto 2), y si la instrucción no es explícita sobre reemplazar, DEBES:
     a. Devolver el horario original sin modificaciones en el campo 'horarioRefinado'.
     b. Usar el campo 'preguntaAclaratoria' para informar al usuario sobre el conflicto específico (mencionando las clases en conflicto) y preguntarle cómo desea proceder (por ejemplo, "¿La clase [Nueva Clase] debe reemplazar a [Clase Existente]?"). El texto de este campo 'preguntaAclaratoria' debe estar en español.
  4. Si la instrucción del usuario es explícita sobre modificar una clase existente (ej., "cambia la hora de la clase de matemáticas de 8 AM a 9 AM") o eliminar una clase existente (ej., "elimina la clase de historia"), entonces puedes proceder con esa modificación o eliminación, asegurándote de que no se creen nuevas superposiciones.
  5. Asegúrate de que todas las sesiones de clase en el horario final que devuelvas sean distintas y no entren en conflicto. Si, después de seguir estas reglas, evitar una superposición requiere una suposición significativa o una desviación de la solicitud (ej. cambiar otra clase no mencionada), detállalo también en 'preguntaAclaratoria'.

  También proporciona recomendaciones textuales concisas y útiles para el horario refinado en el campo 'recomendaciones', si corresponde.

  **Importante sobre Clarificaciones (General)**: Si la instrucción en 'restriccionesHorario' es ambigua para el refinamiento (más allá de los conflictos de superposición), o si necesitas hacer suposiciones significativas para cumplir con la petición de refinamiento, utiliza el campo 'preguntaAclaratoria' en tu respuesta. En este campo, debes:
    1. Listar las suposiciones clave que hiciste para refinar el horario.
    2. O, hacer preguntas específicas al usuario para ayudar a clarificar su petición de refinamiento.
  **El texto de este campo 'preguntaAclaratoria' debe estar en español.**
  Si la petición de refinamiento es clara y no requiere suposiciones mayores (y no hay conflictos de superposición que requieran clarificación según las reglas anteriores), puedes omitir el campo 'preguntaAclaratoria'. El objetivo es mejorar el horario, pero también guiar al usuario si su petición necesita más detalle.
  `,
});

const flujoRefinarHorario = ai.defineFlow(
  {
    name: 'flujoRefinarHorario',
    inputSchema: EntradaRefinarHorarioSchema,
    outputSchema: SalidaRefinarHorarioSchema,
  },
  async input => {
    const {output} = await promptRefinarHorario(input);
    return output!;
  }
);
