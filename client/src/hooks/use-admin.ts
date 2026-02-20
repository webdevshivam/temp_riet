import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useUsersAdmin(params: { role?: string; q?: string; schoolId?: number } = {}) {
  const qs = new URLSearchParams();
  if (params.role) qs.set('role', params.role);
  if (params.q) qs.set('q', params.q);
  if (params.schoolId) qs.set('schoolId', String(params.schoolId));
  const url = `${api.admin.users.list.path}${qs.toString() ? `?${qs.toString()}` : ''}`;
  return useQuery({
    queryKey: [api.admin.users.list.path, params],
    queryFn: async () => {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch users');
      return api.admin.users.list.responses[200].parse(await res.json());
    }
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: number; role: 'gov_admin'|'school_admin'|'teacher'|'student' }) => {
      const res = await fetch(api.admin.users.updateRole.path.replace(':id', String(id)), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error('Failed to update role');
      return await res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.admin.users.list.path] });
    }
  });
}

export function useScholarshipRules() {
  return useQuery({
    queryKey: [api.scholarship.rules.get.path],
    queryFn: async () => {
      const res = await fetch(api.scholarship.rules.get.path);
      if (!res.ok) throw new Error('Failed to fetch rules');
      return await res.json();
    }
  });
}

export function useUpdateScholarshipRules() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(api.scholarship.rules.update.path, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update rules');
      return await res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.scholarship.rules.get.path] });
    }
  });
}

export function useEvaluateScholarship() {
  return useMutation({
    mutationFn: async (studentId: number) => {
      const res = await fetch(api.scholarship.evaluate.path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      });
      if (!res.ok) throw new Error('Failed to evaluate');
      return await res.json();
    }
  });
}
