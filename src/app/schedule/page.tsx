
"use client";

import { useState, useRef } from 'react';
import type { Horario, ElementoClase } from '@/lib/types';
import { AppLayout } from '@/components/layout/app-layout';
import { FormularioClaseManual } from '@/components/schedule/manual-schedule-form';
import { VisualizadorHorario } from '@/components/schedule/schedule-display';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function PaginaHorario() {
  const [horario, establecerHorario] = useState<Horario>({});
  const [estaExportando, establecerEstaExportando] = useState(false);
  const { toast } = useToast();
  const refVisualizadorHorario = useRef<HTMLDivElement>(null);

  const manejarAnadirClaseManual = (nuevaClase: ElementoClase) => {
    const clasesExistentesEnDia = horario[nuevaClase.dia] || [];
    let conflictoDetectado = false;

    for (const claseExistente of clasesExistentesEnDia) {
      const inicioA_arr = claseExistente.horaInicio.split(':').map(Number);
      const finA_arr = claseExistente.horaFin.split(':').map(Number);
      const inicioB_arr = nuevaClase.horaInicio.split(':').map(Number);
      const finB_arr = nuevaClase.horaFin.split(':').map(Number);

      const minutosInicioExistente = inicioA_arr[0] * 60 + inicioA_arr[1];
      const minutosFinExistente = finA_arr[0] * 60 + finA_arr[1];
      const minutosInicioNueva = inicioB_arr[0] * 60 + inicioB_arr[1];
      const minutosFinNueva = finB_arr[0] * 60 + finB_arr[1];

      if (Math.max(minutosInicioExistente, minutosInicioNueva) < Math.min(minutosFinExistente, minutosFinNueva)) {
        toast({
          title: "Conflicto de horario",
          description: `La clase "${nuevaClase.asignatura}" se superpone con "${claseExistente.asignatura}" el ${nuevaClase.dia}.`,
          variant: "destructive",
        });
        conflictoDetectado = true;
        break; 
      }
    }

    if (conflictoDetectado) return;
    
    establecerHorario(horarioAnterior => {
      const clasesDiaActualizadas = [...(horarioAnterior[nuevaClase.dia] || []), nuevaClase];
      clasesDiaActualizadas.sort((a, b) => {
        const hA = a.horaInicio.split(':').map(Number);
        const hB = b.horaInicio.split(':').map(Number);
        return (hA[0] * 60 + hA[1]) - (hB[0] * 60 + hB[1]);
      });
      return {
        ...horarioAnterior,
        [nuevaClase.dia]: clasesDiaActualizadas,
      };
    });

    toast({
      title: "Clase añadida",
      description: "Tu horario ha sido actualizado.",
    });
  };
  
  const manejarLimpiarHorario = () => {
    establecerHorario({});
    toast({
      title: "Horario eliminado",
      description: "Tu horario está ahora vacío.",
    });
  };

  const manejarExportarPNG = async () => {
    if (refVisualizadorHorario.current) {
      establecerEstaExportando(true);
      try {
        const elementosClase = refVisualizadorHorario.current.querySelectorAll<HTMLElement>('[class*="absolute"]');
        elementosClase.forEach(item => item.style.boxShadow = 'none');

        const lienzo = await html2canvas(refVisualizadorHorario.current, {
          logging: false, 
          useCORS: true,
          scale: 2, 
          backgroundColor: '#121212',
        });

        elementosClase.forEach(item => item.style.boxShadow = ''); 
        
        const imagen = lienzo.toDataURL('image/png', 1.0);
        const enlace = document.createElement('a');
        enlace.download = 'cronika-horario.png';
        enlace.href = imagen;
        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);
        toast({
          title: "Exportación exitosa",
          description: "Tu horario ha sido exportado como PNG.",
        });
      } catch (error) {
        toast({
          title: "Error de exportación",
          description: "No se pudo exportar el horario.",
          variant: "destructive",
        });
      } finally {
        establecerEstaExportando(false);
      }
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Horario</h1>
          <p className="text-muted-foreground">Construye tu semestre paso a paso.</p>
        </header>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Añadir Materia</CardTitle>
                <CardDescription>Ingresa los detalles de la clase.</CardDescription>
              </CardHeader>
              <CardContent>
                <FormularioClaseManual alAnadirClase={manejarAnadirClaseManual} /> 
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-xl">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Tu Horario Semanal</CardTitle>
                  <CardDescription>Visualiza tu organización actual.</CardDescription>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={manejarExportarPNG} 
                    disabled={estaExportando || Object.keys(horario).length === 0}
                    className="flex-1 sm:flex-none"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {estaExportando ? "Exportando..." : "Exportar PNG"}
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={manejarLimpiarHorario} 
                    disabled={Object.keys(horario).length === 0}
                    className="flex-1 sm:flex-none"
                  >
                    Limpiar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <VisualizadorHorario 
                  ref={refVisualizadorHorario} 
                  horario={horario} 
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
