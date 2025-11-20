import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { apiRequest as api } from "./api-config"; // renamed to avoid conflict

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Standard API wrapper for non-react-query calls
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: any
): Promise<any> {

  const fullUrl = `${url}`; // url already includes endpoint, no need to call getApiUrl

  const res = await api(fullUrl, {
    method,
    body: data ? JSON.stringify(data) : undefined,
    headers: data ? { "Content-Type": "application/json" } : {},
    credentials: "include",
  });

  return res;
}

/**
 * React-query handler wrapper
 */
const getQueryFn: <T>(options: {
  on401: "returnNull" | "throw";
}) => QueryFunction<T> =
  ({ on401 }) =>
  async ({ queryKey }) => {
    const endpoint = queryKey[0] as string;
    const res = await fetch(endpoint, { credentials: "include" });

    if (on401 === "returnNull" && res.status === 401) return null;

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: { retry: false },
  },
});
