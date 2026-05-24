// src/ai/flows/generate-schedule.ts
'use server';

/**
 * @fileOverview Flujo de generación de horarios potenciado por IA.
 *
 * - generarHorario - Una función que genera un horario de clases a partir de una instrucción.
 * - EntradaGenerarHorario - El tipo de entrada para la función generarHorario.
 * - SalidaGenerarHorario - El tipo de retorno para la función generarHorario.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { DiaDeSemana } from '@/lib/types'; // Asegurarse de importar el tipo correcto

const EntradaGenerarHorarioSchema = z.object({
  instruccion: z.string().describe('Una instrucción detallada describiendo al estudiante, su carrera, asignaturas, disponibilidad y cualquier otro dato académico relevante.'),
});
export type EntradaGenerarHorario = z.infer<typeof EntradaGenerarHorarioSchema>;

const SalidaGenerarHorarioSchema = z.object({
  horario: z.string().describe('Un horario de clases semanal detallado como una cadena JSON. La cadena JSON debe representar un objeto donde las claves son los días de la semana (p.ej., "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo") y cada valor es un array de objetos de clase. Cada objeto de clase debe incluir: "id" (un identificador de cadena único), "asignatura" (cadena), "dia" (cadena, debe ser uno de los valores de DiaDeSemana p.ej. "Lunes"), "horaInicio" (cadena, formato "HH:mm"), "horaFin" (cadena, formato "HH:mm"). Campos opcionales por objeto de clase son "profesor" (cadena) y "ubicacion" (cadena). Asegúrate de que horaInicio sea anterior a horaFin. Asegúrate de que los nombres de los días coincidan estrictamente con los valores permitidos de DiaDeSemana: "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo".'),
  preguntaAclaratoria: z.string().optional().describe("Si la instrucción del usuario fue ambigua o se hicieron suposiciones importantes (ej. duración de clases no especificada, asignación a días específicos si la disponibilidad es amplia), proporciona aquí una pregunta de clarificación o una lista de las suposiciones hechas para que el usuario las revise. El contenido de esta pregunta o lista debe estar en español. Si la instrucción fue clara, este campo puede omitirse.")
});
export type SalidaGenerarHorario = z.infer<typeof SalidaGenerarHorarioSchema>;

export async function generarHorario(input: EntradaGenerarHorario): Promise<SalidaGenerarHorario> {
  return flujoGenerarHorario(input);
}

const promptGenerarHorario = ai.definePrompt({
  name: 'promptGenerarHorario', // El nombre del prompt para Genkit puede quedar en inglés o camelCase.
  input: {schema: EntradaGenerarHorarioSchema},
  output: {schema: SalidaGenerarHorarioSchema},
  prompt: `Eres un asistente de IA especializado en generar horarios de clases semanales para estudiantes universitarios.

  Basándote en la información proporcionada en la instrucción (prompt), crea un horario semanal detallado y optimizado. El horario debe considerar la carrera del estudiante, las asignaturas matriculadas, los horarios preferidos, las preferencias de profesores y cualquier otro dato académico relevante.

  Devuelve el horario como una cadena JSON. La cadena JSON debe representar un objeto donde las claves son los días de la semana (p.ej., "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo") y cada valor es un array de objetos de clase.
  Cada objeto de clase debe incluir los siguientes campos:
  - "id": Un identificador de cadena único para la clase (p.ej., generado usando un UUID o una cadena única descriptiva como "MAT101-Lunes-0900").
  - "asignatura": El nombre de la asignatura o curso (cadena).
  - "dia": El día de la semana para esta sesión de clase (cadena, debe ser uno de "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo").
  - "horaInicio": La hora de inicio de la clase en formato "HH:mm" (cadena).
  - "horaFin": La hora de fin de la clase en formato "HH:mm" (cadena).
  Campos opcionales para cada objeto de clase:
  - "profesor": El nombre del profesor (cadena, opcional).
  - "ubicacion": La ubicación de la clase (cadena, opcional).

  Asegúrate de que el horario generado sea realista, factible y bien estructurado. Específicamente, asegúrate de que para cada clase, horaInicio sea anterior a horaFin.
  Los nombres de los días en las claves JSON y en el campo "dia" de los objetos de clase deben coincidir estrictamente con uno de los valores permitidos para DiaDeSemana: "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo".

  **Crucial: Evitar Superposiciones:** NO DEBES programar múltiples clases que se superpongan en tiempo en el mismo día. Asegúrate de que todas las sesiones de clase sean distintas y no entren en conflicto. Si encuentras una situación donde evitar una superposición requiere una suposición significativa o una desviación de la solicitud del usuario, por favor detállalo en el campo 'preguntaAclaratoria'.

  **Importante sobre Clarificaciones**: Si la instrucción del usuario es ambigua o requiere que hagas suposiciones significativas (por ejemplo, sobre la duración de las clases si no se especifica, los horarios exactos de disponibilidad si solo se dan rangos amplios, o la asignación a días específicos si la disponibilidad es amplia), utiliza el campo 'preguntaAclaratoria' en tu respuesta. En este campo, debes:
    1. Listar las suposiciones clave que hiciste para generar el horario.
    2. O, hacer preguntas específicas al usuario para ayudar a refinar la próxima solicitud.
  **El texto de este campo 'preguntaAclaratoria' debe estar en español.**
  Si la instrucción es clara y no requiere suposiciones mayores que afecten significativamente la estructura del horario, puedes omitir el campo 'preguntaAclaratoria'. El objetivo es generar un horario útil, pero también guiar al usuario si su petición necesita más detalle para un resultado óptimo.

  Instrucción: {{{instruccion}}}
  `,
});

const flujoGenerarHorario = ai.defineFlow(
  {
    name: 'flujoGenerarHorario', // El nombre del flujo para Genkit
    inputSchema: EntradaGenerarHorarioSchema,
    outputSchema: SalidaGenerarHorarioSchema,
  },
  async input => {
    const {output} = await promptGenerarHorario(input);
    return output!;
  }
);
