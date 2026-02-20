import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertTeacher, buildUrl } from "@shared/routes";

export function useTeachers(schoolId?: number) {
  return useQuery({
    queryKey: [api.teachers.list.path, schoolId],
    queryFn: async () => {
      const url = schoolId 
        ? buildUrl(api.teachers.list.path) + `?schoolId=${schoolId}` 
        : api.teachers.list.path;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch teachers");
      return api.teachers.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.teachers.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create teacher");
      return api.teachers.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.teachers.list.path] });
    },
  });
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertTeacher> }) => {
      const res = await fetch(buildUrl(api.teachers.update.path, { id }), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update teacher");
      return api.teachers.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.teachers.list.path] });
    },
  });
}

export function useDeleteTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(buildUrl(api.teachers.delete.path, { id }), {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete teacher");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.teachers.list.path] });
    },
  });
}

export function useSetTeacherFaceData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, imageBase64 }: { id: number; imageBase64: string }) => {
      const res = await fetch(buildUrl(api.teachers.setFaceData.path, { id }), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });
      if (!res.ok) throw new Error("Failed to set teacher face data");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.teachers.list.path] });
    },
  });
}
