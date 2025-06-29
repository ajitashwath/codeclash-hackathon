import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SlideFlow | AI-Powered Presentation Editor',
  description: 'Create professional presentations with AI assistance, interactive tools, and seamless export options.',
  keywords: 'presentation, AI, slides, editor, PowerPoint, PPTX, export',
  authors: [{ name: 'SlideFlow Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#1f2937',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          {children}
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  );
}