
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowDown, Users, BookOpen, Clock, Coffee, Sparkles, CalendarDays, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";
import Image from 'next/image';
import { Abril_Fatface } from 'next/font/google';

const fuenteAbrilFatface = Abril_Fatface({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-abril-fatface',
});

export default function PaginaInicio() {
  const manejarScrollHaciaAbajo = () => {
    const siguienteSeccion = document.getElementById('seccion-necesidad');
    if (siguienteSeccion) {
      siguienteSeccion.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-border/40 fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
        <Link href="/" className="flex items-center justify-center" prefetch={false}>
          <span className={`ml-2 text-xl font-semibold ${fuenteAbrilFatface.variable} font-abril`}>CRØNIKA</span>
        </Link>
      </header>

      <main className="flex-1 pt-16">
        {/* SECCIÓN 1: INTRO / LANDING PRINCIPAL */}
        <section className="w-full min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center relative text-center overflow-hidden py-12 md:py-24 lg:py-32 bg-background">
          <div className="absolute inset-0 z-0">
            <Image
              alt="Fondo de bienvenida para Crønika con muñequitos 3D"
              src="https://api.linkareer.com/attachments/476088"
              fill={true}
              className="object-cover opacity-60"
              priority
              data-ai-hint="muñequitos 3d"
            />
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
          <div className="container px-4 md:px-6 relative z-10 space-y-8 flex flex-col items-center">
            <h1 className={`text-8xl font-bold tracking-tighter sm:text-9xl md:text-[10rem] lg:text-[11.5rem] bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-purple-400 to-blue-500 ${fuenteAbrilFatface.variable} font-abril`}>
              Crønika
            </h1>
            <p className="max-w-[800px] mx-auto text-muted-foreground md:text-2xl font-light">
              Porque cada clase es parte de tu crónica diaria.
            </p>
            <button
              type="button"
              onClick={manejarScrollHaciaAbajo}
              className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 mt-4"
              aria-label="Desplazarse hacia abajo"
            >
              <ArrowDown className="h-7 w-7" />
            </button>
          </div>
        </section>

        {/* SECCIÓN 2: CREAR NECESIDAD (DRAMA) - Rediseñada: Más corta, casi negra con detalles púrpuras */}
        <section id="seccion-necesidad" className="w-full py-20 md:py-28 relative overflow-hidden bg-[#02020a]">
          {/* Fondo creativo tipo noche con gradientes sutiles */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[35%] bg-indigo-900/15 rounded-full blur-[100px]"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-5"></div>
          </div>
          
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center text-center space-y-8">
              <div className="space-y-4 max-w-4xl">
                <h2 className={`text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl leading-tight text-white/80 ${fuenteAbrilFatface.variable} font-abril`}>
                  ¿Mucho <span className="text-purple-400/80 italic">drama</span> para organizar tu semestre?
                </h2>
                <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent mx-auto"></div>
              </div>
              
              <div className="relative">
                <p className="max-w-[600px] text-purple-100/60 md:text-lg/relaxed font-light tracking-wide leading-relaxed italic border-l border-purple-500/20 pl-4 py-1">
                  "El choque de horarios, los huecos infinitos y el caos de no saber dónde estar... El estrés académico empieza mucho antes de los exámenes."
                </p>
              </div>
              
              <div className="pt-4">
                <p className="text-xs md:text-sm font-medium text-purple-300/40 tracking-[0.2em] uppercase">
                  Es hora de tomar el control total
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN 3: CREA TU HORARIO MANUAL */}
        <section className="w-full py-16 md:py-24 lg:py-32 bg-background border-t border-border/10">
          <div className="container px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="flex flex-wrap justify-center gap-6 md:gap-8 order-last md:order-first">
                <div className="flex flex-col items-center p-4 bg-card rounded-lg shadow-md w-32 h-32 justify-center border border-border/40 hover:border-primary/50 transition-colors group">
                  <Users className="h-12 w-12 text-primary mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm text-center">Profesores</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-card rounded-lg shadow-md w-32 h-32 justify-center border border-border/40 hover:border-primary/50 transition-colors group">
                  <BookOpen className="h-12 w-12 text-primary mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm text-center">Materias</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-card rounded-lg shadow-md w-32 h-32 justify-center border border-border/40 hover:border-primary/50 transition-colors group">
                  <Clock className="h-12 w-12 text-primary mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm text-center">Horarios</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-card rounded-lg shadow-md w-32 h-32 justify-center border border-border/40 hover:border-primary/50 transition-colors group">
                  <Coffee className="h-12 w-12 text-primary mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm text-center">Descansos</span>
                </div>
              </div>
              <div className="space-y-6 text-center md:text-left">
                <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">Diseña tu horario <span className="text-primary">a medida</span></h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                  Sin algoritmos complicados. Añade tus materias, elige tus profes y organiza tus días exactamente como los quieres vivir.
                </p>
                <Button asChild size="lg" className="h-12 px-8 text-lg font-medium rounded-full">
                  <Link href="/schedule">
                    Empezar ahora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* SECCIÓN FINAL: TU ALIADO ACADÉMICO INTELIGENTE */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://community-filepreview.spline.design/d36b985d-3898-4b6d-9df9-88599935dcd8.jpg"
              alt="Fondo abstracto de tecnología y diseño para sección de aliado académico"
              fill={true}
              className="object-cover opacity-30"
              priority={false} 
              data-ai-hint="abstract technology"
            />
            <div className="absolute inset-0 bg-black/50"></div>
          </div>
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-muted/70 backdrop-blur-sm px-3 py-1 text-sm text-foreground/80">Gestión académica simplificada</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-foreground">Tu aliado académico inteligente</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Gracias a Juan Vargas, José Vargas, Verónica Ubarne y Diego Ramos, Crønika te ofrece herramientas poderosas para maximizar tu aprendizaje.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
