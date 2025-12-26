import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getApiUrl } from "./api-config";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  const fullUrl = getApiUrl(url);
  console.log(`[API] ${method} ${fullUrl}`);

  try {
    const res = await fetch(fullUrl, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log(`[API] Response status: ${res.status}`);
    
    await throwIfResNotOk(res);
    
    // Check if response has content before parsing JSON
    const contentType = res.headers.get('content-type');
    const text = await res.text();
    
    if (!text) {
      console.warn('[API] Empty response body');
      return {};
    }
    
    if (!contentType?.includes('application/json')) {
      console.warn('[API] Non-JSON response:', contentType);
      throw new Error('Server returned non-JSON response');
    }
    
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error('[API] JSON parse error:', text.substring(0, 100));
      throw new Error('Invalid response from server');
    }
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error('[API] Request failed:', error.message);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const fullUrl = getApiUrl(queryKey[0] as string);
    
    try {
      const res = await fetch(fullUrl, {
        credentials: "include",
        headers: {
          'Accept': 'application/json',
        },
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      
      const text = await res.text();
      if (!text) {
        console.warn('[QueryFn] Empty response for:', fullUrl);
        return [];
      }
      
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error('[QueryFn] JSON parse error for:', fullUrl, text.substring(0, 100));
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('[QueryFn] Request failed for:', fullUrl, error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes - allows refetch on hard refresh
      gcTime: 30 * 60 * 1000, // 30 minutes - keep cache longer
      retry: (failureCount, error) => {
        // Retry up to 3 times for network errors, not for 4xx errors
        if (failureCount >= 3) return false;
        const message = (error as Error)?.message || '';
        // Don't retry for client errors (4xx)
        if (message.startsWith('4')) return false;
        // Retry for network/server errors
        return true;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
    mutations: {
      retry: false,
    },
  },
});
