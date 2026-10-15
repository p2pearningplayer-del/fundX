import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PwaPrompt from '@/components/PwaPrompt';

export const metadata: Metadata = {
  title: 'FundX Panel — Institutional Fund-Orchestration & Commission Engine',
  description: 'Enterprise segmented fund activation, transaction-task generation, and auditable multi-tier commission disbursement platform.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#1b5eed',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans selection:bg-brand-500 selection:text-white">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
        <PwaPrompt />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('SW registration note:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
