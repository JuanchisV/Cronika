
import Link from 'next/link';
import { Abril_Fatface } from 'next/font/google';

const fuenteAbrilFatface = Abril_Fatface({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-abril-fatface',
});

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Link href="/" className="flex items-center space-x-2" prefetch={false}>
          <span className={`font-bold text-xl ${fuenteAbrilFatface.variable} font-abril`}>CRØNIKA</span>
        </Link>
        {/* Future navigation items can go here */}
      </div>
    </header>
  );
}

    