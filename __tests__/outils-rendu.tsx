import { type QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { BasculesProvider } from '../features/books/bascules-provider';
import { SuppressionsProvider } from '../features/books/suppressions-provider';

export const creerEnveloppeOuvrages =
  (client: QueryClient) =>
  ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>
      <SuppressionsProvider>
        <BasculesProvider>{children}</BasculesProvider>
      </SuppressionsProvider>
    </QueryClientProvider>
  );
