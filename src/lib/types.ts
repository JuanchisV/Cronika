export interface DatosUsuario {
  nombre: string;
  carrera: string;
  semestre: string;
  asignaturas: string; // Podría estar separado por comas o saltos de línea
  profesores: string; // Podría estar separado por comas o saltos de línea
  disponibilidad: string; // Texto libre para la disponibilidad
  restricciones?: string; // Restricciones adicionales para la IA
}

export type DiaDeSemana = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';

export const TODOS_LOS_DIAS: DiaDeSemana[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export interface ElementoClase {
  id: string; // Identificador único para las claves de React, etc.
  asignatura: string;
  profesor?: string;
  dia: DiaDeSemana;
  horaInicio: string; // Formato: "HH:mm" ej: "09:00"
  horaFin: string;   // Formato: "HH:mm" ej: "10:30"
  ubicacion?: string;
  color?: string; // Opcional: para distinción visual en el horario
}

export type Horario = {
  // Usando un Record para flexibilidad, mapeando DiaDeSemana a un array de ElementoClase
  [key in DiaDeSemana]?: ElementoClase[];
};

// Representa la estructura que podría esperarse de la generación de horarios de la IA,
// especialmente si es una lista de objetos tipo clase.
// Este es un ejemplo genérico; la lógica de análisis necesitará adaptarse a la salida real de la IA.
export interface PosibleSalidaClaseIA {
  asignatura: string;
  profesor?: string;
  dia: string; // La IA podría devolver el día como cadena, ej: "Lunes", "Mar"
  hora: string; // La IA podría devolver la hora como un rango, ej: "9:00 AM - 10:30 AM" o "0900-1030"
  ubicacion?: string;
  [key: string]: any; // Permitir otras propiedades que la IA podría devolver
}

// Para la salida del horario refinado por la IA
export interface ResultadoHorarioRefinadoIA {
  horarioRefinado: string; // Objeto JSON del horario en formato de cadena
  recomendaciones: string; // Recomendaciones textuales
}
