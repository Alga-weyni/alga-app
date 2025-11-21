// client/src/lib/queryClient.ts
import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { API_URL } from "./api-config";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Default queryFn for React Query
// Usage: queryKey: ["/api/properties", { city: "Addis" }]
const defaultQueryFn: QueryFunction = async ({ queryKey }) => {
  const [endpoint, params] = queryKey as [
    string,
    Record<string, string> | undefined
  ];

  const search = params ? `?${new URLSearchParams(params)}` : "";

  // endpoint like "/api/properties" or "/api/auth/user"
  const path = endpoint.startsWith("/api") ? endpoint : `/api${endpoint}`;
  const url = `${API_URL}${path}${search}`;

  const res = await fetch(url, {
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res.json();
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});
