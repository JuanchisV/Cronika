"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { UserData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useEffect } from "react";

export const userDataSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  major: z.string().min(1, "La carrera es obligatoria"),
  semester: z.string().min(1, "El semestre es obligatorio"),
  subjects: z.string().min(1, "Enumera las asignaturas (ej: una por línea o separadas por comas)"),
  professors: z.string().optional(),
  availability: z.string().min(1, "Describe tu disponibilidad (ej: 'Lun 9-5, Mar 1-4, prefiero mañanas')"),
  constraints: z.string().optional().describe("Restricciones adicionales para la IA (ej: 'evitar clases a las 8 AM', 'máx. 3 clases por día')"),
});

export type UserDataSchema = z.infer<typeof userDataSchema>;

interface DataInputFormProps {
  onSubmit: (data: UserDataSchema) => void;
  initialData?: UserDataSchema | null;
}

export function DataInputForm({ onSubmit, initialData }: DataInputFormProps) {
  const form = useForm<UserDataSchema>({
    resolver: zodResolver(userDataSchema),
    defaultValues: initialData || {
      name: "",
      major: "",
      semester: "",
      subjects: "",
      professors: "",
      availability: "",
      constraints: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  function handleSubmit(data: UserDataSchema) {
    onSubmit(data);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información Académica</CardTitle>
        <CardDescription>Proporciona tus detalles para personalizar tu horario.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Alex Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="major"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carrera</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Ingeniería Informática" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="semester"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Semestre Actual</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Otoño 2024, 3er Semestre" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subjects"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asignaturas/Cursos</FormLabel>
                  <FormControl>
                    <Textarea placeholder="MAT101 - Cálculo I\nINF202 - Estructuras de Datos\nFIS201 - Física Universitaria" {...field} />
                  </FormControl>
                  <FormDescription>Enumera todas las asignaturas que estás cursando o planeas cursar.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="professors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profesores Preferidos (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Dr. García para INF202\nProf. López para MAT101 (si es posible)" {...field} />
                  </FormControl>
                   <FormDescription>Enumera cualquier preferencia de profesor.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="availability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disponibilidad</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ej: Lunes 9am-5pm, Martes 1pm-4pm, Miércoles todo el día. Prefiero clases por la mañana. No disponible los viernes por la tarde." {...field} />
                  </FormControl>
                   <FormDescription>Describe cuándo estás libre o tienes compromisos.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="constraints"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Restricciones de Horario (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ej: Máx. 2 laboratorios por semana, al menos 1 hora de descanso entre clases, no clases después de las 6 PM." {...field} />
                  </FormControl>
                   <FormDescription>Cualquier regla específica para que la IA la considere.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">Guardar Información</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
