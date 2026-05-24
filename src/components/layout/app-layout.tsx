
import type { ReactNode } from 'react';
import { Header } from './header';

interface AppLayoutProps {
  children: ReactNode; // 'children' es una prop estándar de React
}

export function AppLayout({ children }: AppLayoutProps) { // 'AppLayout' como nombre de componente se mantiene
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      {/* Footer eliminado según solicitud previa */}
    </div>
  );
}
