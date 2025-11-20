import { useQuery } from "@tanstack/react-query";
import { type User } from "@shared/schema";
import { API_URL } from "../lib/api-config";


export function useAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const url = `${API_URL}/auth/user`;
      console.log("🔍 Fetching auth:", url);

      const res = await fetch(url, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401) {
        return null; // Not logged in
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to fetch user");
      }

      return res.json();
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
