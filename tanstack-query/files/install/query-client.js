import { QueryClient } from '@tanstack/react-query';

/**
 * One client for the whole app.
 *
 * `staleTime` defaults to 0, which makes every mounted component refetch on
 * focus; a minute is a saner starting point for a fresh project. Override per
 * query where the data really is that volatile.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
});
