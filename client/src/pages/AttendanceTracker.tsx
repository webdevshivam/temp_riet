import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, ClipboardList, Users, Calendar } from "lucide-react";
import { useAttendance } from "@/hooks/use-attendance";
import { useStudents } from "@/hooks/use-students";
import { useTeachers } from "@/hooks/use-teachers";

export default function AttendanceTracker() {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [classFilter, setClassFilter] = useState<string>("all");

  const { data: students, isLoading: studentsLoading } = useStudents();
  const { data: attendanceRecords, isLoading: attLoading } = useAttendance();
  const { data: teachers } = useTeachers();

  // Build teacher lookup by id
  const teacherMap = useMemo(() => {
    const map = new Map<number, string>();
    if (!teachers) return map;
    for (const t of teachers) {
      map.set(t.id, t.user?.name || `Teacher #${t.id}`);
    }
    return map;
  }, [teachers]);

  // All unique grades
  const uniqueGrades = useMemo(() => {
    return Array.from(new Set(students?.map(s => s.grade) || [])).sort();
  }, [students]);

  // Attendance for selected date, keyed by studentId
  const dateAttendance = useMemo(() => {
    const map = new Map<number, { status: string; faceVerified: boolean; markedByTeacherId?: number | null }>();
    if (!attendanceRecords) return map;
    for (const rec of attendanceRecords) {
      const recDate = new Date(rec.date).toISOString().split("T")[0];
      if (recDate === selectedDate) {
        map.set(rec.studentId, {
          status: rec.status,
          faceVerified: rec.faceVerified,
          markedByTeacherId: (rec as any).markedByTeacherId ?? null,
        });
      }
    }
    return map;
  }, [attendanceRecords, selectedDate]);

  // Filter students by class
  const filteredStudents = useMemo(() => {
    if (!students) return [];
    if (classFilter === "all") return students;
    return students.filter(s => s.grade === classFilter);
  }, [students, classFilter]);

  const presentCount = filteredStudents.filter(s => dateAttendance.has(s.id)).length;
  const absentCount = filteredStudents.length - presentCount;

  if (studentsLoading || attLoading) {
    return <div className="p-8">Loading attendance data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-display tracking-tight flex items-center gap-2">
          <ClipboardList className="h-8 w-8 text-primary" />
          Daily Attendance Tracker
        </h1>
        <p className="text-muted-foreground mt-1">Track student attendance across all classes</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredStudents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent / Not Marked</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{absentCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredStudents.length > 0 ? Math.round((presentCount / filteredStudents.length) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Label>Date:</Label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-44"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label>Class:</Label>
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {uniqueGrades.map(g => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>
            {selectedDate === today ? "Today" : selectedDate} — {filteredStudents.length} students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Reg No</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Marked By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => {
                    const att = dateAttendance.get(student.id);
                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          <div>{student.user?.name || "Unknown"}</div>
                          <div className="text-xs text-muted-foreground">@{student.user?.username}</div>
                        </TableCell>
                        <TableCell>{student.registrationNo}</TableCell>
                        <TableCell>{student.grade}</TableCell>
                        <TableCell>
                          {att ? (
                            <Badge className="bg-green-500 gap-1">
                              <CheckCircle className="h-3 w-3" />
                              {att.status.charAt(0).toUpperCase() + att.status.slice(1)}
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="h-3 w-3" />
                              Absent
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {att ? (
                            att.faceVerified ? (
                              <Badge variant="outline" className="text-xs">Face Verified</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">Manual</Badge>
                            )
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {att?.markedByTeacherId ? (
                            <span className="text-sm">{teacherMap.get(att.markedByTeacherId) || `Teacher #${att.markedByTeacherId}`}</span>
                          ) : att ? (
                            <span className="text-xs text-muted-foreground">System</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
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
    </div>
  );
}
