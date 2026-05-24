
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ElementoClase, DiaDeSemana } from "@/lib/types"; // Traducción
import { TODOS_LOS_DIAS } from "@/lib/types"; // Traducción
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const expresionHora = /^([01]\d|2[0-3]):([0-5]\d)$/; // Formato HH:mm // Traducción

const esquemaClaseManual = z.object({ // Traducción
  asignatura: z.string().min(1, "La asignatura es obligatoria"), // Traducción
  profesor: z.string().optional(), // Traducción
  dia: z.enum(TODOS_LOS_DIAS, { required_error: "El día es obligatorio" }), // Traducción
  horaInicio: z.string().regex(expresionHora, "Hora de inicio inválida (HH:mm)"), // Traducción
  horaFin: z.string().regex(expresionHora, "Hora de fin inválida (HH:mm)"), // Traducción
  ubicacion: z.string().optional(), // Traducción
}).refine(data => data.horaInicio < data.horaFin, { // Traducción
  message: "La hora de fin debe ser posterior a la hora de inicio",
  path: ["horaFin"],
});

type EsquemaClaseManual = z.infer<typeof esquemaClaseManual>; // Traducción

interface PropsFormularioClaseManual { // Traducción
  alAnadirClase: (elementoClase: ElementoClase) => void; // Traducción
}

export function FormularioClaseManual({ alAnadirClase }: PropsFormularioClaseManual) { // Traducción
  const form = useForm<EsquemaClaseManual>({
    resolver: zodResolver(esquemaClaseManual),
    defaultValues: {
      asignatura: "",
      profesor: "",
      dia: "Lunes", 
      horaInicio: "09:00",
      horaFin: "10:00",
      ubicacion: "",
    },
  });

  function manejarEnvio(datos: EsquemaClaseManual) { // Traducción
    const nuevaClase: ElementoClase = { // Traducción
      ...datos,
      id: crypto.randomUUID(), 
    };
    alAnadirClase(nuevaClase);
    form.reset(); 
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(manejarEnvio)} className="space-y-4">
        <FormField
          control={form.control}
          name="asignatura"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de asignatura/curso</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="off" placeholder=""/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="profesor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profesor (opcional)</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="off" placeholder=""/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dia"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Día de la semana</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un día" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TODOS_LOS_DIAS.map(dia => (
                    <SelectItem key={dia} value={dia}>{dia}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="horaInicio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora de inicio</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="horaFin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora de fin</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="ubicacion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ubicación (opcional)</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="off" placeholder=""/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Añadir clase al horario</Button>
      </form>
    </Form>
  );
}
