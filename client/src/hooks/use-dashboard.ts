import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useDashboardAnalytics() {
  return useQuery({
    queryKey: [api.dashboard.analytics.path],
    queryFn: async () => {
      const res = await fetch(api.dashboard.analytics.path);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return api.dashboard.analytics.responses[200].parse(await res.json());
    },
  });
}
