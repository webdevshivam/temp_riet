import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertAttendance } from "@shared/routes";

export function useAttendance(studentId?: number, schoolId?: number) {
  return useQuery({
    queryKey: [api.attendance.list.path, studentId, schoolId],
    queryFn: async () => {
      let url = api.attendance.list.path;
      const params = new URLSearchParams();
      if (studentId) params.append("studentId", String(studentId));
      if (schoolId) params.append("schoolId", String(schoolId));
      if (params.toString()) url += `?${params.toString()}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch attendance");
      return api.attendance.list.responses[200].parse(await res.json());
    },
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertAttendance) => {
      const res = await fetch(api.attendance.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to mark attendance");
      return api.attendance.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.attendance.list.path] });
    },
  });
}

export function useFaceVerify() {
  return useMutation({
    mutationFn: async (data: { imageBase64: string, studentId: number }) => {
      const res = await fetch(api.attendance.faceVerify.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Verification failed");
      return api.attendance.faceVerify.responses[200].parse(await res.json());
    },
  });
}
