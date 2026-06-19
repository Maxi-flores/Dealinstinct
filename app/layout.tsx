import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Dealinstinct - Premium Webshop',
    template: '%s | Dealinstinct',
  },
  description: 'Premium webshop platform with inventory management and beautiful product displays.',
  keywords: ['webshop', 'ecommerce', 'inventory', 'products', 'shop'],
  authors: [{ name: 'Dealinstinct' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Dealinstinct',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              borderRadius: '0.75rem',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#f1f5f9',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#f1f5f9',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
