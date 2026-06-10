'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { ThemeProvider as NextThemeProvider } from 'next-themes';

interface QueryProviderProps {
  children: React.ReactNode;
}

type AppThemeProviderProps = React.ComponentProps<typeof NextThemeProvider>;

/**
 * AppThemeProvider - client wrapper around next-themes
 */
export function AppThemeProvider({ children, ...props }: AppThemeProviderProps) {
  return <NextThemeProvider {...props}>{children}</NextThemeProvider>;
}

/**
 * QueryProvider - React Query context provider
 * Wraps the app to enable data fetching with caching
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

/**
 * Custom hook for fetching deals
 */
export const useDeals = (source?: string) => {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const url = new URL('/api/deals', window.location.origin);
      if (source && source !== 'all') {
        url.searchParams.set('source', source);
      }
      url.searchParams.set('limit', '50');

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.success) {
        setDeals(data.deals || []);
      } else {
        setError(data.error || 'Failed to fetch deals');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch deals');
    } finally {
      setLoading(false);
    }
  }, [source]);

  return { deals, loading, error, fetchDeals };
};

/**
 * Custom hook for fetching products
 */
export const useProducts = (category?: string, search?: string) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Use Firebase through API for consistency
      const url = new URL('/api/products', window.location.origin);
      if (category) {
        url.searchParams.set('category', category);
      }
      if (search) {
        url.searchParams.set('search', search);
      }
      url.searchParams.set('limit', '50');

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.success) {
        setProducts(data.products || []);
      } else {
        setError(data.error || 'Failed to fetch products');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  return { products, loading, error, fetchProducts };
};

/**
 * Example usage:
 * 
 * import { QueryProvider } from '@/components/providers';
 * 
 * // In layout
 * <QueryProvider>
 *   {children}
 * </QueryProvider>
 * 
 * // In components
 * const { deals, loading, fetchDeals } = useDeals('amazon');
 */
