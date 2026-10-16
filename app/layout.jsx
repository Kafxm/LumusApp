import { Analytics } from '@vercel/analytics/next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });
export const metadata = {
    title: 'Lumus · Iluminando el talento independiente',
    description: 'Iluminando el talento independiente: donde tus proyectos hablan por ti. Lumus conecta creadores independientes con empresas mediante portafolios de proyectos reales y reputación basada en evidencia.',
    generator: 'v0.app',
    icons: {
        icon: '/brand/lumus-mark.png',
        apple: '/brand/lumus-mark.png',
    },
};
export const viewport = {
    colorScheme: 'light',
    themeColor: '#729DF2',
};
export default function RootLayout({ children, }) {
    return (<html lang="es" className={`${geistSans.variable} ${geistMono.variable} bg-background`}>
      <body className="antialiased">
        {children}
        <Toaster theme="light" richColors position="bottom-right"/>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>);
}
