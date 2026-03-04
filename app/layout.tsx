import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ONG Gestão - Sistema Administrativo',
  description: 'Sistema de gestão para ONGs educacionais e sociais',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-ngo-bg text-slate-800 antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
