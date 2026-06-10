import './globals.css';
import type { Metadata } from 'next';
import { AppThemeProvider, QueryProvider } from '@/components/providers';
import { SiteShell } from '@/components/SiteShell';

export const metadata: Metadata = {
  title: 'DealInstinct - Find Deals Before Your Instinct Kicks In',
  description: 'Discover the best deals from Amazon, eBay, Walmart and more. AI-powered deal scoring to help you find the best bargains.',
  keywords: ['deals', 'discount', 'shopping', 'amazon deals', 'ebay deals', 'coupons'],
  openGraph: {
    title: 'DealInstinct - Find Deals Before Your Instinct Kicks In',
    description: 'Discover the best deals from top retailers',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 antialiased">
        <AppThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryProvider>
            <SiteShell>{children}</SiteShell>
          </QueryProvider>
        </AppThemeProvider>
      </body>
    </html>
  );
}

/**
 * Example usage:
 * 
 * This layout wraps all pages in the application
 * - Provides theme support via next-themes
 * - Wraps with QueryProvider for data fetching
 * - Includes Navbar and Cart components
 * 
 * Add providers as needed for:
 * - Authentication state
 * - Analytics
 * - Error boundaries
 */
