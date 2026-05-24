
"use server";

import { generarHorario as flujoGenerarHorario, type EntradaGenerarHorario, type SalidaGenerarHorario } from "@/ai/flows/generate-schedule";
import { refinarHorario as flujoRefinarHorario, type EntradaRefinarHorario, type SalidaRefinarHorario } from "@/ai/flows/refine-schedule";
import type { Horario, ElementoClase, DiaDeSemana } from "./types";
import { TODOS_LOS_DIAS } from "./types"; 

// Función auxiliar para convertir HH:mm a minutos desde medianoche
const tiempoAMinutos = (hora: string): number => {
  if (!hora || !hora.includes(':')) return 0; // No debería suceder con datos validados
  const [horas, minutos] = hora.split(':').map(Number);
  return horas * 60 + minutos;
};

// Función auxiliar para verificar si hay superposición de tiempo entre dos clases
function tiemposSeSuperponen(inicioA: string, finA: string, inicioB: string, finB: string): boolean {
  const inicioA_min = tiempoAMinutos(inicioA);
  const finA_min = tiempoAMinutos(finA);
  const inicioB_min = tiempoAMinutos(inicioB);
  const finB_min = tiempoAMinutos(finB);
  return Math.max(inicioA_min, inicioB_min) < Math.min(finA_min, finB_min);
}

// Función auxiliar para detectar todas las superposiciones en un horario
function detectarSuperposiciones(horario: Horario): string[] {
  const mensajesConflicto: string[] = [];
  if (!horario || typeof horario !== 'object') return mensajesConflicto;

  for (const dia of TODOS_LOS_DIAS) {
    const clasesDelDia = horario[dia];
    if (clasesDelDia && clasesDelDia.length > 1) {
      const clasesOrdenadas = [...clasesDelDia].sort((a, b) => tiempoAMinutos(a.horaInicio) - tiempoAMinutos(b.horaInicio));
      for (let i = 0; i < clasesOrdenadas.length; i++) {
        for (let j = i + 1; j < clasesOrdenadas.length; j++) {
          const claseA = clasesOrdenadas[i];
          const claseB = clasesOrdenadas[j];
          if (claseA && claseB && claseA.horaInicio && claseA.horaFin && claseB.horaInicio && claseB.horaFin) {
            if (tiemposSeSuperponen(claseA.horaInicio, claseA.horaFin, claseB.horaInicio, claseB.horaFin)) {
              mensajesConflicto.push(
                `Conflicto el ${dia}: "${claseA.asignatura || 'Clase sin nombre'}" (${claseA.horaInicio}-${claseA.horaFin}) se superpone con "${claseB.asignatura || 'Clase sin nombre'}" (${claseB.horaInicio}-${claseB.horaFin}).`
              );
            }
          }
        }
      }
    }
  }
  return mensajesConflicto;
}

// Función auxiliar para analizar la cadena del horario generada por la IA
const parsearCadenaHorarioIA = (cadenaHorario: string): Horario | { error: string; rawValue?: string } => {
  try {
    const analizado = JSON.parse(cadenaHorario);

    if (typeof analizado !== 'object' || analizado === null || Array.isArray(analizado)) {
      console.error("La cadena de horario de IA no se analizó como un mapa de objetos:", analizado, "Cadena original:", cadenaHorario);
      return { error: "La IA devolvió un formato de horario no válido (se esperaba un objeto con días como claves y listas de clases como valores).", rawValue: cadenaHorario };
    }

    const horarioValidado: Horario = {};
    let tieneAlgunDatoValido = false; 

    for (const claveDia in analizado) {
      if (TODOS_LOS_DIAS.includes(claveDia as DiaDeSemana)) {
        const dia = claveDia as DiaDeSemana;
        const clasesParaDia = analizado[claveDia];
        tieneAlgunDatoValido = true; 

        if (Array.isArray(clasesParaDia)) {
          horarioValidado[dia] = clasesParaDia.map((claseObj: any, index: number) => {
            if (typeof claseObj === 'object' && claseObj !== null &&
                typeof claseObj.asignatura === 'string' &&
                typeof claseObj.horaInicio === 'string' && 
                typeof claseObj.horaFin === 'string' &&   
                typeof claseObj.dia === 'string' && TODOS_LOS_DIAS.includes(claseObj.dia as DiaDeSemana) &&
                /^[0-2]\d:[0-5]\d$/.test(claseObj.horaInicio) &&
                /^[0-2]\d:[0-5]\d$/.test(claseObj.horaFin) &&
                claseObj.horaInicio < claseObj.horaFin 
                ) {
                  return {
                    id: typeof claseObj.id === 'string' && claseObj.id ? claseObj.id : `${claseObj.asignatura.replace(/\s+/g, '')}-${claseObj.dia}-${claseObj.horaInicio.replace(':','')}-${Math.random().toString(36).substring(2,7)}`,
                    asignatura: claseObj.asignatura,
                    profesor: typeof claseObj.profesor === 'string' ? claseObj.profesor : undefined,
                    dia: claseObj.dia as DiaDeSemana, 
                    horaInicio: claseObj.horaInicio,
                    horaFin: claseObj.horaFin,
                    ubicacion: typeof claseObj.ubicacion === 'string' ? claseObj.ubicacion : undefined,
                    color: typeof claseObj.color === 'string' ? claseObj.color : undefined,
                  };
            }
            console.warn(`Elemento de clase malformado o incompleto para ${dia} en el índice ${index}:`, claseObj);
            return null;
          }).filter(claseObj => claseObj !== null) as ElementoClase[];

          if (horarioValidado[dia]?.length === 0 && !Object.prototype.hasOwnProperty.call(analizado, claveDia)) {
             delete horarioValidado[dia]; 
          } else if (horarioValidado[dia]?.length === 0 && Object.prototype.hasOwnProperty.call(analizado, claveDia)) {
            horarioValidado[dia] = []; // Mantener día vacío si explícitamente estaba así
          }

        } else if (clasesParaDia !== undefined && clasesParaDia !== null) {
          console.warn(`Lista de clases malformada para el día '${claveDia}', se esperaba un array, se obtuvo:`, clasesParaDia);
          horarioValidado[dia] = [];
        }
      } else {
        console.warn(`Ignorando clave de día no válida en el horario de IA: ${claveDia}`);
      }
    }
    
    if (!tieneAlgunDatoValido && Object.keys(analizado).length > 0 && Object.keys(horarioValidado).length === 0) {
        return { error: "La IA devolvió un objeto de horario que no contenía días válidos o clases válidas dentro de los días.", rawValue: cadenaHorario };
    }

    return horarioValidado; 
  } catch (e: any) {
    console.error("Falló el análisis de la cadena de horario de IA:", e.message, "Cadena sin procesar:", cadenaHorario);
    return { error: `La IA devolvió un formato de horario no válido. Falló el análisis: ${e.message}`, rawValue: cadenaHorario };
  }
};

export async function generarHorarioAccion(input: EntradaGenerarHorario): Promise<{ horario?: Horario; preguntaAclaratoria?: string; salidaCruda?: string; error?: string }> {
  try {
    console.log("Iniciando generarHorarioAccion con entrada:", input);
    const resultado: SalidaGenerarHorario = await flujoGenerarHorario(input);
    console.log("Respuesta de flujoGenerarHorario:", resultado);
    
    if (!resultado || typeof resultado.horario !== 'string') {
      console.error("La respuesta del flujo de IA (flujoGenerarHorario) no contiene una propiedad 'horario' de tipo string o el resultado es nulo/indefinido:", resultado);
      return { 
        error: "La IA no devolvió un horario estructurado como se esperaba. Revisa los logs del servidor para más detalles. Respuesta recibida: " + JSON.stringify(resultado),
        preguntaAclaratoria: resultado?.preguntaAclaratoria
      };
    }

    const resultadoHorarioParseado = parsearCadenaHorarioIA(resultado.horario);
    if ("error" in resultadoHorarioParseado) {
      return { error: resultadoHorarioParseado.error, preguntaAclaratoria: resultado.preguntaAclaratoria, salidaCruda: resultadoHorarioParseado.rawValue ?? resultado.horario };
    }
    const horarioParseado = resultadoHorarioParseado as Horario;

    let preguntaAclaratoriaFinal = resultado.preguntaAclaratoria;
    const advertenciasSuperposicion = detectarSuperposiciones(horarioParseado);

    if (advertenciasSuperposicion.length > 0) {
      const mensajeSuperposicion = "ADVERTENCIA: Se detectaron clases superpuestas en el horario generado:\n- " + advertenciasSuperposicion.join("\n- ");
      if (preguntaAclaratoriaFinal) {
        preguntaAclaratoriaFinal = `${mensajeSuperposicion}\n\nPregunta/información adicional de la IA:\n${preguntaAclaratoriaFinal}`;
      } else {
        preguntaAclaratoriaFinal = mensajeSuperposicion;
      }
    }

    return { horario: horarioParseado, preguntaAclaratoria: preguntaAclaratoriaFinal, salidaCruda: resultado.horario };
  } catch (error: any) {
    console.error("Error detallado en la acción generarHorarioAccion:", error);
    const mensajeCausa = (error as any).cause instanceof Error ? (error as any).cause.message : undefined;
    let mensajeError = error.message || "Ocurrió un error desconocido.";
    if (mensajeCausa) {
      mensajeError += ` Causa subyacente: ${mensajeCausa}`;
    }
    
    const mensajeErrorMinusculas = mensajeError.toLowerCase();
    if (mensajeErrorMinusculas.includes("api key") || mensajeErrorMinusculas.includes("permission denied") || mensajeErrorMinusculas.includes("billing") || mensajeErrorMinusculas.includes("quota") || mensajeErrorMinusculas.includes("denied") || mensajeErrorMinusculas.includes("enable the api")) {
        mensajeError = `Error relacionado con la configuración de Google AI: "${mensajeError}". Por favor, verifica tu GOOGLE_API_KEY en el archivo .env. Asegúrate también de que la API "Generative Language" (o Vertex AI) esté habilitada y la facturación configurada correctamente en tu proyecto de Google Cloud.`;
    } else {
        mensajeError = `Falló la generación del horario. Error interno: ${mensajeError}. Por favor, revisa los logs del servidor para más detalles.`;
    }
    return { error: mensajeError };
  }
}

export async function refinarHorarioAccion(input: EntradaRefinarHorario): Promise<{ horarioRefinado?: Horario; recomendaciones?: string; preguntaAclaratoria?: string; salidaCruda?: string; error?: string; errorSuperposicion?: string }> {
  try {
    console.log("Iniciando refinarHorarioAccion con entrada:", input);
    const entradaFlujo: EntradaRefinarHorario = {
      horario: input.horario,
      restriccionesHorario: input.restriccionesHorario,
    };

    const resultado: SalidaRefinarHorario = await flujoRefinarHorario(entradaFlujo);
    console.log("Respuesta de flujoRefinarHorario:", resultado);
    
    if (!resultado || typeof resultado.horarioRefinado !== 'string') {
      console.error("La respuesta del flujo de IA (flujoRefinarHorario) no contiene una propiedad 'horarioRefinado' de tipo string o el resultado es nulo/indefinido:", resultado);
      return { 
        error: "La IA no devolvió un horario refinado estructurado como se esperaba. Revisa los logs del servidor para más detalles. Respuesta recibida: " + JSON.stringify(resultado), 
        recomendaciones: resultado?.recomendaciones,
        preguntaAclaratoria: resultado?.preguntaAclaratoria
      };
    }
    
    const resultadoHorarioParseado = parsearCadenaHorarioIA(resultado.horarioRefinado);
    if ("error" in resultadoHorarioParseado) {
         return { error: resultadoHorarioParseado.error, recomendaciones: resultado.recomendaciones, preguntaAclaratoria: resultado.preguntaAclaratoria, salidaCruda: resultadoHorarioParseado.rawValue ?? resultado.horarioRefinado };
    }
    const horarioParseado = resultadoHorarioParseado as Horario;

    const advertenciasSuperposicion = detectarSuperposiciones(horarioParseado);
    if (advertenciasSuperposicion.length > 0) {
      // Si el prompt de refinamiento pide explícitamente no modificar el horario original en caso de conflicto,
      // no deberíamos devolver el `horarioParseado` que tiene superposiciones.
      // En su lugar, devolvemos un error de superposición y el `preguntaAclaratoria` original.
      const mensajeSuperposicion = "Conflicto de horario: La IA propuso cambios que resultan en clases superpuestas:\n- " + advertenciasSuperposicion.join("\n- ") + "\nPor favor, ajusta tu instrucción.";
      return { 
        errorSuperposicion: mensajeSuperposicion, 
        recomendaciones: resultado.recomendaciones, 
        preguntaAclaratoria: resultado.preguntaAclaratoria || "Hay un conflicto de superposición en el horario propuesto.",
        salidaCruda: resultado.horarioRefinado 
      };
    }
    
    return { horarioRefinado: horarioParseado, recomendaciones: resultado.recomendaciones, preguntaAclaratoria: resultado.preguntaAclaratoria, salidaCruda: resultado.horarioRefinado };

  } catch (error: any) {
    console.error("Error detallado en la acción refinarHorarioAccion:", error);
    const mensajeCausa = (error as any).cause instanceof Error ? (error as any).cause.message : undefined;
    let mensajeError = error.message || "Ocurrió un error desconocido.";
    if (mensajeCausa) {
      mensajeError += ` Causa subyacente: ${mensajeCausa}`;
    }

    const mensajeErrorMinusculas = mensajeError.toLowerCase();
    if (mensajeErrorMinusculas.includes("api key") || mensajeErrorMinusculas.includes("permission denied") || mensajeErrorMinusculas.includes("billing") || mensajeErrorMinusculas.includes("quota") || mensajeErrorMinusculas.includes("denied") || mensajeErrorMinusculas.includes("enable the api")) {
        mensajeError = `Error relacionado con la configuración de Google AI: "${mensajeError}". Por favor, verifica tu GOOGLE_API_KEY en el archivo .env. Asegúrate también de que la API "Generative Language" (o Vertex AI) esté habilitada y la facturación configurada correctamente en tu proyecto de Google Cloud.`;
    } else {
        mensajeError = `Falló el refinamiento del horario. Error interno: ${mensajeError}. Por favor, revisa los logs del servidor para más detalles.`;
    }
    return { error: mensajeError };
  }
}
