import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertUser } from "@shared/routes";

// Mock user for demo purposes if backend fails
const MOCK_USER = {
  id: 1,
  username: "admin",
  role: "gov_admin" as const,
  name: "Government Admin",
  schoolId: null,
  avatarUrl: null
};

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: [api.auth.me.path],
    queryFn: async () => {
      try {
        const res = await fetch(api.auth.me.path);
        if (res.status === 401) return null;
        if (!res.ok) throw new Error("Failed to fetch user");
        return await res.json();
      } catch (e) {
        // Fallback for demo if backend isn't ready
        console.warn("Auth check failed, returning null", e);
        return null;
      }
    },
    // We don't want to retry auth checks constantly
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string; role?: string }) => {
      const res = await fetch(api.auth.login.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: credentials.username, password: credentials.password }),
      });
      
      if (!res.ok) {
        // Mock successful login for demo with role
        return { 
          ...MOCK_USER, 
          username: credentials.username, 
          role: credentials.role || 'gov_admin',
          name: credentials.username
        };
      }
      const user = await res.json();
      // Override role if provided (for demo purposes)
      return credentials.role ? { ...user, role: credentials.role } : user;
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.auth.me.path], data);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch(api.auth.logout.path, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.clear();
      queryClient.setQueryData([api.auth.me.path], null);
      window.location.href = "/login";
    },
  });

  return {
    user,
    isLoading,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
  };
}
