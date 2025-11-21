import { useQuery } from "@tanstack/react-query";
import { API_URL } from "../lib/api-config";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/auth/user`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 401) return null;

      if (!res.ok) throw new Error("Failed to fetch user");

      return res.json();
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
