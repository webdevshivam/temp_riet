import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTeacherMe } from "@/hooks/use-teachers";
import { useStudents } from "@/hooks/use-students";
import { useAttendance, useMarkAttendance } from "@/hooks/use-attendance";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, Users, BookOpen, ClipboardCheck, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StudentComplaintDialog } from "@/components/StudentComplaintDialog";

export default function TeacherDashboard() {
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [complaintDialogOpen, setComplaintDialogOpen] = useState(false);
  const { data: teacher, isLoading: teacherLoading } = useTeacherMe();
  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const { data: attendance = [], isLoading: attendanceLoading } = useAttendance();
  const markAttendance = useMarkAttendance();
  const { toast } = useToast();
  const { data: complaints = [] } = useQuery<any[]>({
    queryKey: ["/api/complaints"],
    queryFn: async () => {
      const res = await fetch("/api/complaints", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch complaints");
      return res.json();
    },
  });

  const assignedClasses = teacher?.assignedClasses || [];

  const filteredStudents = useMemo(() => {
    if (selectedClass === "all") return students;
    return students.filter((s) => s.grade === selectedClass);
  }, [students, selectedClass]);

  const today = new Date().toISOString().split("T")[0];
  const todayMap = useMemo(() => {
    const m = new Map<number, { status: string; faceVerified: boolean }>();
    attendance.forEach((a) => {
      const d = new Date(a.date).toISOString().split("T")[0];
      if (d === today) m.set(a.studentId, { status: a.status, faceVerified: a.faceVerified });
    });
    return m;
  }, [attendance, today]);

  const presentCount = filteredStudents.filter((s) => todayMap.get(s.id)?.status === "present").length;

  const onMark = (studentId: number, status: "present" | "absent" | "late") => {
    markAttendance.mutate(
      {
        studentId,
        status,
        faceVerified: false,
      },
      {
        onSuccess: () => {
          toast({ title: "Attendance updated", description: `Marked ${status}.` });
        },
        onError: (err: Error) => {
          toast({ title: "Error", description: err.message, variant: "destructive" });
        },
      },
    );
  };

  if (teacherLoading || studentsLoading || attendanceLoading) {
    return <div className="p-8">Loading teacher panel...</div>;
  }

  if (!teacher) {
    return <div className="p-8 text-muted-foreground">Teacher profile not found.</div>;
  }

  if (assignedClasses.length === 0) {
    return (
      <div className="p-8 text-muted-foreground">
        No batches assigned yet. Ask admin to assign classes to your teacher account.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display tracking-tight flex items-center gap-2">
          <ClipboardCheck className="h-8 w-8 text-primary" />
          Teacher Panel
        </h1>
        <p className="text-muted-foreground mt-1">
          {teacher.user?.name} - {teacher.subject} - Batches: {assignedClasses.join(", ")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Batches</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedClasses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredStudents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {presentCount} / {filteredStudents.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>My Complaints</CardTitle>
            <CardDescription>Submit and track your complaints</CardDescription>
          </div>
          <Button onClick={() => setComplaintDialogOpen(true)} className="gap-2">
            <AlertCircle className="h-4 w-4" />
            New Complaint
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {complaints.length === 0 ? (
            <div className="text-sm text-muted-foreground">No complaints submitted yet.</div>
          ) : (
            complaints.slice(0, 5).map((c) => (
              <div key={c.id} className="p-3 border rounded-md">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{c.title}</div>
                  <Badge variant={c.status === "resolved" ? "secondary" : "outline"}>{c.status}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{c.aiClassification || "other"}</div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Batch</span>
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Batches</SelectItem>
            {assignedClasses.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mark Attendance</CardTitle>
          <CardDescription>
            Only students assigned to your batches are shown here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Reg No</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Status Today</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No students in selected batch.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((s) => {
                    const todayStatus = todayMap.get(s.id);
                    return (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">
                          <div>{s.user?.name || "Unknown"}</div>
                          <div className="text-xs text-muted-foreground">@{s.user?.username}</div>
                        </TableCell>
                        <TableCell>{s.registrationNo}</TableCell>
                        <TableCell>{s.grade}</TableCell>
                        <TableCell>
                          {todayStatus ? (
                            <Badge variant={todayStatus.status === "present" ? "default" : "secondary"}>
                              {todayStatus.status}
                            </Badge>
                          ) : (
                            <Badge variant="outline">not marked</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => onMark(s.id, "present")}
                              disabled={markAttendance.isPending}
                            >
                              Present
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => onMark(s.id, "late")}
                              disabled={markAttendance.isPending}
                            >
                              Late
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onMark(s.id, "absent")}
                              disabled={markAttendance.isPending}
                            >
                              Absent
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <StudentComplaintDialog open={complaintDialogOpen} onOpenChange={setComplaintDialogOpen} />
    </div>
  );
}
