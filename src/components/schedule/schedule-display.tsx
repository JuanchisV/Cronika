
// src/components/schedule/schedule-display.tsx
"use client";

import type { Horario, DiaDeSemana, ElementoClase } from '@/lib/types'; // Traducción
import { TODOS_LOS_DIAS } from '@/lib/types'; // Traducción
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import React, { forwardRef, useRef, useEffect } from 'react';

interface PropsVisualizadorHorario { // Traducción
  horario: Horario; // Traducción
  estaCargando?: boolean; // Traducción
}

const tiempoAMinutos = (hora: string): number => { // Traducción
  if (!hora || !hora.includes(':')) return 0;
  const [horasNum, minutosNum] = hora.split(':').map(Number); // Traducción
  return horasNum * 60 + minutosNum;
};

const coloresClase = [ // Traducción
  'bg-purple-600/30 border-purple-500',
  'bg-sky-600/30 border-sky-500',
  'bg-red-600/30 border-red-500',
  'bg-green-600/30 border-green-500',
  'bg-yellow-600/30 border-yellow-500',
  'bg-blue-600/30 border-blue-500',
  'bg-indigo-600/30 border-indigo-500',
  'bg-pink-600/30 border-pink-500',
  'bg-teal-600/30 border-teal-500',
];
let indiceColorGlobal = 0; // Traducción
const coloresAsignadosGlobal = new Map<string, string>(); // Traducción

const obtenerColorClase = (asignatura: string): string => { // Traducción
  if (!coloresAsignadosGlobal.has(asignatura)) {
    coloresAsignadosGlobal.set(asignatura, coloresClase[indiceColorGlobal % coloresClase.length]);
    indiceColorGlobal++;
  }
  return coloresAsignadosGlobal.get(asignatura)!;
};

const ALTURA_FILA_ENCABEZADO = 60; // px, altura de la fila de encabezado del día // Traducción
const ALTURA_FRANJA_HORARIA = 60; // px, altura de una franja horaria // Traducción
const ANCHO_PRIMERA_COLUMNA_CADENA = '4rem'; // 64px, ancho de la primera columna (horas) // Traducción

const VisualizadorHorario = forwardRef<HTMLDivElement, PropsVisualizadorHorario>(({ horario, estaCargando }, ref) => { // Traducción
  const refHorarioAnterior = useRef<string | null>(null); // Traducción

  useEffect(() => {
    const jsonHorarioActual = JSON.stringify(horario); // Traducción
    if (Object.keys(horario).length === 0 || refHorarioAnterior.current !== jsonHorarioActual) {
      indiceColorGlobal = 0;
      coloresAsignadosGlobal.clear();
      refHorarioAnterior.current = jsonHorarioActual;
    }
  }, [horario]);

  if (estaCargando) {
    return (
      <div className="space-y-4 p-4">
        {TODOS_LOS_DIAS.map(dia => (
          <div key={dia} className="space-y-2">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>
    );
  }

  const horaInicioVisualizacion = 6; // Empezar a las 6 AM // Traducción
  const horaFinVisualizacion = 20; // Terminar a las 8 PM (20:00) // Traducción

  const franjasHorarias: string[] = []; // Traducción
  for (let hora = horaInicioVisualizacion; hora < horaFinVisualizacion; hora++) {
    franjasHorarias.push(`${String(hora).padStart(2, '0')}:00`);
  }
  
  const horarioEstaVacio = Object.values(horario).every(clasesDia => !clasesDia || clasesDia.length === 0); // Traducción

  if (horarioEstaVacio && !estaCargando) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/20">
        <p className="text-muted-foreground">Tu horario está actualmente vacío.</p>
        <p className="text-sm text-muted-foreground/80">Añade clases manualmente o usa el generador IA.</p>
      </div>
    );
  }

  const minutosHoraInicioCuadricula = horaInicioVisualizacion * 60; // Traducción
  const duracionFranjaMinutos = 60; // Traducción

  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md border">
      <div
        ref={ref}
        className="relative grid bg-card" 
        style={{
          gridTemplateColumns: `${ANCHO_PRIMERA_COLUMNA_CADENA} repeat(7, 1fr)`,
        }}
      >
        {/* Celda de Esquina */}
        <div className="sticky left-0 top-0 z-20 bg-card p-2 border-b border-r flex items-center justify-center" style={{ height: `${ALTURA_FILA_ENCABEZADO}px`, minWidth: ANCHO_PRIMERA_COLUMNA_CADENA, width: ANCHO_PRIMERA_COLUMNA_CADENA }}>
          <span className="text-xs font-semibold text-muted-foreground">Hora</span>
        </div>

        {/* Encabezados de Día */}
        {TODOS_LOS_DIAS.map(dia => (
          <div key={dia} className="sticky top-0 z-10 bg-card p-2 border-b text-center flex items-center justify-center" style={{ height: `${ALTURA_FILA_ENCABEZADO}px` }}>
            <span className="text-sm font-semibold">{dia}</span>
          </div>
        ))}

        {/* Franjas Horarias y Líneas de Cuadrícula */}
        {franjasHorarias.map((horaFranja) => ( // Traducción
          <React.Fragment key={horaFranja}>
            <div className="sticky left-0 z-10 bg-card p-2 border-r flex items-center justify-center" style={{ height: `${ALTURA_FRANJA_HORARIA}px`, minWidth: ANCHO_PRIMERA_COLUMNA_CADENA, width: ANCHO_PRIMERA_COLUMNA_CADENA }}>
              <span className="text-xs text-muted-foreground">{horaFranja}</span>
            </div>
            {TODOS_LOS_DIAS.map(dia => (
              <div key={`${dia}-${horaFranja}`} className="border-b border-r relative" style={{ height: `${ALTURA_FRANJA_HORARIA}px`}}>
                {/* Esta es solo la celda de la cuadrícula, las clases se posicionan absolutamente sobre esto */}
              </div>
            ))}
          </React.Fragment>
        ))}

        {/* Elementos de Clase Posicionados Absolutamente */}
        {TODOS_LOS_DIAS.map((dia, indiceDia) => { // Traducción
          const clasesDelDia = horario[dia] || []; // Traducción
          return clasesDelDia.map((elementoClase) => { // Traducción
            if (!elementoClase || !elementoClase.horaInicio || !elementoClase.horaFin) return null;

            const minutosInicioClase = tiempoAMinutos(elementoClase.horaInicio); // Traducción
            const minutosFinClase = tiempoAMinutos(elementoClase.horaFin); // Traducción

            if (minutosFinClase <= minutosHoraInicioCuadricula || minutosInicioClase >= horaFinVisualizacion * 60) {
              return null; 
            }

            const desplazamientoDesdeInicioCuadriculaMinutos = minutosInicioClase - minutosHoraInicioCuadricula; // Traducción
            let desplazamientoSuperiorPx = (desplazamientoDesdeInicioCuadriculaMinutos / duracionFranjaMinutos) * ALTURA_FRANJA_HORARIA; // Traducción

            let duracionMinutos = minutosFinClase - minutosInicioClase; // Traducción
            let alturaPx = (duracionMinutos / duracionFranjaMinutos) * ALTURA_FRANJA_HORARIA; // Traducción

            let desplazamientoSuperiorSeguro = Math.max(0, desplazamientoSuperiorPx); // Traducción

            if (minutosInicioClase < minutosHoraInicioCuadricula) {
                const minutosInicioVisible = minutosHoraInicioCuadricula; // Traducción
                const minutosDuracionVisible = minutosFinClase - minutosInicioVisible; // Traducción
                alturaPx = (minutosDuracionVisible / duracionFranjaMinutos) * ALTURA_FRANJA_HORARIA;
                desplazamientoSuperiorSeguro = 0; 
            }

            if (minutosFinClase > horaFinVisualizacion * 60) {
                const minutosFinVisible = horaFinVisualizacion * 60; // Traducción
                const minutosDuracionVisible = minutosFinVisible - Math.max(minutosHoraInicioCuadricula, minutosInicioClase); // Traducción
                alturaPx = (minutosDuracionVisible / duracionFranjaMinutos) * ALTURA_FRANJA_HORARIA;
            }
            alturaPx = Math.max(0, alturaPx); 

            const posicionSuperiorFinal = ALTURA_FILA_ENCABEZADO + desplazamientoSuperiorSeguro; // Traducción
            const clasesColor = elementoClase.color || obtenerColorClase(elementoClase.asignatura); // Traducción
            
            const izquierdaClase = `calc(${ANCHO_PRIMERA_COLUMNA_CADENA} + (${indiceDia} * (100% - ${ANCHO_PRIMERA_COLUMNA_CADENA}) / 7))`; // Traducción
            const anchoClase = `calc((100% - ${ANCHO_PRIMERA_COLUMNA_CADENA}) / 7)`; // Traducción

            const textoProfesor = elementoClase.profesor?.trim(); // Traducción
            const textoUbicacion = elementoClase.ubicacion?.trim(); // Traducción
            const duracionClaseHoras = (tiempoAMinutos(elementoClase.horaFin) - tiempoAMinutos(elementoClase.horaInicio)) / 60; // Traducción

            return (
              <div
                key={elementoClase.id}
                className={cn(
                  "absolute flex flex-col p-2 rounded-md shadow-md text-xs border break-words", 
                  clasesColor
                )}
                style={{
                  top: `${posicionSuperiorFinal}px`,
                  height: `${alturaPx}px`,
                  left: izquierdaClase,
                  width: anchoClase,
                  boxSizing: 'border-box', 
                }}
                title={`${elementoClase.asignatura} (${elementoClase.horaInicio} - ${elementoClase.horaFin})`}
              >
                <strong className="block w-full font-semibold text-primary-foreground whitespace-normal break-words leading-tight">{elementoClase.asignatura}</strong>
                <span className="block w-full text-primary-foreground/80 whitespace-normal break-words leading-tight">{elementoClase.horaInicio} - {elementoClase.horaFin}</span>
                {(() => {
                  if (duracionClaseHoras >= 2 && textoProfesor && textoUbicacion) {
                    return (
                      <>
                        <span className="block w-full text-primary-foreground/80 whitespace-normal break-words leading-tight">{textoProfesor}</span>
                        <span className="block w-full text-primary-foreground/80 font-semibold whitespace-normal break-words leading-tight">@{textoUbicacion}</span>
                      </>
                    );
                  } else if (textoUbicacion) {
                    return <span className="block w-full text-primary-foreground/80 font-semibold whitespace-normal break-words leading-tight">@{textoUbicacion}</span>;
                  } else if (textoProfesor) {
                    return <span className="block w-full text-primary-foreground/80 whitespace-normal break-words leading-tight">{textoProfesor}</span>;
                  }
                  return null;
                })()}
              </div>
            );
          });
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
});

VisualizadorHorario.displayName = "VisualizadorHorario";
export { VisualizadorHorario };
