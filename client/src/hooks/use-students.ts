import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertStudent, buildUrl } from "@shared/routes";

export function useStudents(schoolId?: number) {
  return useQuery({
    queryKey: [api.students.list.path, schoolId],
    queryFn: async () => {
      const url = schoolId 
        ? buildUrl(api.students.list.path) + `?schoolId=${schoolId}` 
        : api.students.list.path;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch students");
      return api.students.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertStudent) => {
      const res = await fetch(api.students.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create student");
      return api.students.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.students.list.path] });
    },
  });
}

export function useSetStudentFaceData() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, imageBase64 }: { id: number; imageBase64: string }) => {
      const res = await fetch(api.students.setFaceData.path.replace(":id", String(id)), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });
      if (!res.ok) throw new Error("Failed to set face data");
      return await res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.students.list.path] });
    }
  });
}
