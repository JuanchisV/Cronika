
"use client";

import { useState, useEffect } from 'react';
import type { Horario } from '@/lib/types'; // Traducción
import { generarHorarioAccion, refinarHorarioAccion } from '@/lib/actions'; // Traducción
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle, MessageSquareQuote } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface PropsInteraccionHorarioIA { // Traducción
  horarioActual: Horario; // Traducción
  alActualizarHorario: (nuevoHorario: Horario, fuente: "ai-generated" | "ai-refined", errorSuperposicion?: string | null) => void; // Traducción
  alRecibirRecomendaciones: (recomendaciones: string | null) => void; // Traducción
  alRecibirPreguntaAclaratoria: (preguntaAclaratoria: string | null) => void; // Traducción
  preguntaAclaratoria: string | null; // Traducción
  establecerErrorSuperposicion: (error: string | null) => void; // Traducción
  errorSuperposicion: string | null; // Traducción
  establecerEstaCargando: (cargando: boolean) => void; // Traducción
  estaCargando: boolean; // Traducción
}

export function AIScheduleInteraction({ // Nombre de componente puede quedar en inglés para consistencia con ShadCN, pero las props se traducen
  horarioActual,
  alActualizarHorario,
  alRecibirRecomendaciones,
  alRecibirPreguntaAclaratoria,
  preguntaAclaratoria,
  establecerErrorSuperposicion,
  errorSuperposicion,
  establecerEstaCargando,
  estaCargando,
}: PropsInteraccionHorarioIA) {
  const [instruccionUsuario, establecerInstruccionUsuario] = useState(''); // Traducción
  const [errorClaveAPI, establecerErrorClaveAPI] = useState<string | null>(null); // Traducción
  const { toast } = useToast();

  const descripcionHerramientasIA = 
    Object.keys(horarioActual).length === 0 && !preguntaAclaratoria && !errorSuperposicion
    ? "Describe tu horario ideal, las clases que necesitas, tu disponibilidad, etc. para generar un horario desde cero."
    : "Escribe tus instrucciones para refinar el horario actual o generar uno nuevo. Si la IA te hizo una pregunta arriba, responde aquí y vuelve a detallar tu petición.";


  const manejarEnvioIA = async () => { // Traducción
    if (!instruccionUsuario.trim()) {
      toast({
        title: "Instrucción Requerida",
        description: "Por favor, escribe una instrucción para la IA.",
        variant: "destructive",
      });
      return;
    }

    establecerEstaCargando(true);
    alRecibirRecomendaciones(null);
    // No limpiar preguntaAclaratoria aquí si es parte de una interacción continua.
    // Limpiar solo si se hace un nuevo envío independiente o si la IA procesa la actual con éxito.
    establecerErrorClaveAPI(null);

    let resultado; // Traducción
    const horarioEstaVacio = Object.keys(horarioActual).length === 0; // Traducción

    if (horarioEstaVacio) {
      // Generar horario
      resultado = await generarHorarioAccion({ instruccion: instruccionUsuario }); // Traducción
      if (resultado.error) {
        manejarErrorIA(resultado.error, resultado.salidaCruda); // Traducción
      } else if (resultado.horario) {
        alActualizarHorario(resultado.horario, "ai-generated");
        alRecibirPreguntaAclaratoria(resultado.preguntaAclaratoria || null);
        if (!resultado.preguntaAclaratoria) {
             toast({
                title: "¡Horario Generado!",
                description: "La IA ha creado un borrador de tu horario.",
            });
        }
      }
    } else {
      // Refinar horario
      const horarioCadena = JSON.stringify(horarioActual); // Traducción
      const restriccionesHorarioCadena = instruccionUsuario; // Traducción
      resultado = await refinarHorarioAccion({ // Traducción
        horario: horarioCadena,
        restriccionesHorario: restriccionesHorarioCadena,
      });

      if (resultado.error && !resultado.errorSuperposicion) { 
        manejarErrorIA(resultado.error, resultado.salidaCruda);
      } else if (resultado.errorSuperposicion) { 
        establecerErrorSuperposicion(resultado.errorSuperposicion); 
        alActualizarHorario(horarioActual, "ai-refined", resultado.errorSuperposicion); 
        alRecibirRecomendaciones(resultado.recomendaciones || null);
        alRecibirPreguntaAclaratoria(resultado.preguntaAclaratoria || null); 
      }
      else { 
        if (resultado.horarioRefinado) { // Traducción
           alActualizarHorario(resultado.horarioRefinado, "ai-refined");
        }
        alRecibirRecomendaciones(resultado.recomendaciones || null);
        alRecibirPreguntaAclaratoria(resultado.preguntaAclaratoria || null);
        if (!resultado.preguntaAclaratoria && !resultado.errorSuperposicion) {
            toast({
                title: "¡Horario Refinado!",
                description: "La IA ha procesado tus cambios.",
            });
        }
      }
    }
    establecerEstaCargando(false);
  };

  const manejarErrorIA = (mensajeError: string, salidaCruda?: string) => { // Traducción
    let errorAmigableUsuario = mensajeError; // Traducción
    const mensajeErrorMinusculas = (mensajeError || "").toLowerCase(); // Traducción
    if (mensajeErrorMinusculas.includes("api key") || mensajeErrorMinusculas.includes("permission") || mensajeErrorMinusculas.includes("billing") || mensajeErrorMinusculas.includes("quota") || mensajeErrorMinusculas.includes("denied")) {
      errorAmigableUsuario = `Error con la configuración de Google AI: "${mensajeError}". Verifica tu GOOGLE_API_KEY en .env, y que la API "Generative Language" (o Vertex AI) y la facturación estén activas en Google Cloud.`;
      establecerErrorClaveAPI(errorAmigableUsuario);
    }
    toast({
      title: "Falló la Interacción con IA",
      description: errorAmigableUsuario,
      variant: "destructive",
      duration: 10000,
    });
    if (salidaCruda) {
      console.error("Salida Cruda de IA (Error):", salidaCruda);
    }
  };
  
  const horarioEstaVacioLocal = Object.keys(horarioActual).length === 0; // Traducción
  const textoBoton = horarioEstaVacioLocal ? "Crear Horario con IA" : "Revisar Horario con IA"; // Traducción
  const estaDeshabilitado = estaCargando || !instruccionUsuario.trim(); // Traducción

  return (
    <div className="space-y-4">
      {errorClaveAPI && (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>¡Error de Configuración de Google AI!</AlertTitle>
          <AlertDescription>{errorClaveAPI}</AlertDescription>
        </Alert>
      )}

      {errorSuperposicion && (
         <Alert variant="destructive" className="mb-4">
           <AlertTriangle className="h-4 w-4" />
           <AlertTitle>Conflicto de Horario Detectado por IA</AlertTitle>
           <AlertDescription>
             <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-2 rounded-md">{errorSuperposicion}</pre>
             <p className="mt-2 text-xs">El horario no se actualizó. Por favor, ajusta tu instrucción o el horario existente.</p>
           </AlertDescription>
         </Alert>
      )}

      {preguntaAclaratoria && !errorSuperposicion && (
        <Alert variant="default" className="mb-4 border-blue-500">
          <MessageSquareQuote className="h-4 w-4 text-blue-700" />
          <AlertTitle className="text-blue-700">La IA necesita más información o hizo suposiciones:</AlertTitle>
          <AlertDescription>
            <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-2 rounded-md">{preguntaAclaratoria}</pre>
            <p className="mt-2 text-xs">Por favor, considera esta información al escribir tu siguiente instrucción en el cuadro de texto de abajo.</p>
          </AlertDescription>
        </Alert>
      )}
      <Label htmlFor="ai-prompt">Tu Instrucción para la IA</Label>
      <Textarea
        id="ai-prompt"
        placeholder="" 
        value={instruccionUsuario}
        onChange={(e) => {
          establecerInstruccionUsuario(e.target.value);
          if (preguntaAclaratoria) alRecibirPreguntaAclaratoria(null);
          if (errorSuperposicion) establecerErrorSuperposicion(null); 
          if(errorClaveAPI) establecerErrorClaveAPI(null);
        }}
        className="mt-1"
        rows={5}
      />
      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={manejarEnvioIA} disabled={estaDeshabilitado} className="flex-1">
          {estaCargando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {textoBoton}
        </Button>
      </div>
    </div>
  );
}
