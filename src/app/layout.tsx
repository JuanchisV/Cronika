import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Providers } from '@/components/providers';

const fuenteGeistSans = Geist({ // Traducción
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const fuenteGeistMono = Geist_Mono({ // Traducción
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = { // 'metadata' es una convención de Next.js, se mantiene
  title: 'CRØNIKA - Optimizador de Horarios Académicos',
  description: 'Crea y gestiona inteligentemente tu horario académico con CRØNIKA.',
};

export default function RootLayout({ // Nombre de componente estándar de Next.js
  children, // 'children' es una prop estándar de React
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Asegurar que el tema oscuro se aplique si los componentes dependen de esta clase
    <html lang="es" className="dark"> 
      <body className={`${fuenteGeistSans.variable} ${fuenteGeistMono.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
