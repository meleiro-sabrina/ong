import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { LayoutWrapper } from '@/components/LayoutWrapper';
import { ToastProvider } from '@/components/ToastProvider';
import { ConfirmationProvider } from '@/components/ConfirmationProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ONG Gestão - Sistema Administrativo',
  description: 'Sistema de gestão para ONGs educacionais e sociais',
};

export default function DashboardLayout({children}: {children: React.ReactNode}) {
  return (
    <div className={`${inter.className} bg-ngo-bg text-slate-800 antialiased`}>
      <ToastProvider>
        <ConfirmationProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </ConfirmationProvider>
      </ToastProvider>
    </div>
  );
}
