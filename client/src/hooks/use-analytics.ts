import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useDashboardAnalytics() {
  return useQuery({
    queryKey: [api.dashboard.analytics.path],
    queryFn: async () => {
      const res = await fetch(api.dashboard.analytics.path);
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return api.dashboard.analytics.responses[200].parse(await res.json());
    }
  });
}

export function useSchoolsAnalytics(district?: string) {
  return useQuery({
    queryKey: [api.analytics.schools.path, district],
    queryFn: async () => {
      const url = district ? `${api.analytics.schools.path}?district=${encodeURIComponent(district)}` : api.analytics.schools.path;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch schools analytics');
      return api.analytics.schools.responses[200].parse(await res.json());
    }
  });
}

export function useTeacherShortages(district?: string) {
  return useQuery({
    queryKey: [api.analytics.teachersShortages.path, district],
    queryFn: async () => {
      const url = district ? `${api.analytics.teachersShortages.path}?district=${encodeURIComponent(district)}` : api.analytics.teachersShortages.path;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch teacher shortages');
      return api.analytics.teachersShortages.responses[200].parse(await res.json());
    }
  });
}

export function useStudentTrends(district?: string) {
  return useQuery({
    queryKey: [api.analytics.studentsTrends.path, district],
    queryFn: async () => {
      const url = district ? `${api.analytics.studentsTrends.path}?district=${encodeURIComponent(district)}` : api.analytics.studentsTrends.path;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch student trends');
      return api.analytics.studentsTrends.responses[200].parse(await res.json());
    }
  });
}
