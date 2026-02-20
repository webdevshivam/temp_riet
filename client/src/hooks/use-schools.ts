import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertSchool } from "@shared/routes";

export function useSchools() {
  return useQuery({
    queryKey: [api.schools.list.path],
    queryFn: async () => {
      const res = await fetch(api.schools.list.path);
      if (!res.ok) throw new Error("Failed to fetch schools");
      return api.schools.list.responses[200].parse(await res.json());
    },
  });
}

export function useSchool(id: number) {
  return useQuery({
    queryKey: [api.schools.get.path, id],
    queryFn: async () => {
      const res = await fetch(api.schools.get.path.replace(":id", String(id)));
      if (!res.ok) throw new Error("Failed to fetch school");
      return api.schools.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertSchool) => {
      const res = await fetch(api.schools.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create school");
      return api.schools.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.schools.list.path] });
    },
  });
}

export function useUpdateSchool(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<InsertSchool>) => {
      const res = await fetch(api.schools.update.path.replace(":id", String(id)), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Failed to update school");
      return await res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.schools.list.path] });
      qc.invalidateQueries({ queryKey: [api.schools.get.path, id] });
    }
  });
}

export function useDeleteSchool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(api.schools.delete.path.replace(":id", String(id)), { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete school");
      return await res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.schools.list.path] });
    }
  });
}
