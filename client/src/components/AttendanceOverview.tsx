import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Calendar, TrendingDown, Users } from "lucide-react";

export function AttendanceOverview() {
  const { data: students } = useQuery<any[]>({
    queryKey: ["/api/students"],
    queryFn: async () => {
      const response = await fetch("/api/students", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch students");
      return response.json();
    },
  });

  const { data: schools } = useQuery<any[]>({
    queryKey: ["/api/schools"],
    queryFn: async () => {
      const response = await fetch("/api/schools", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch schools");
      return response.json();
    },
  });

  // Calculate attendance stats
  const getAttendanceStats = () => {
    if (!students) return { total: 0, avgAttendance: 0, lowAttendance: [], critical: [] };

    const totalStudents = students.length;
    const avgAttendance = students.reduce((sum, s) => sum + (s.attendanceRate || 0), 0) / totalStudents;

    const lowAttendance = students.filter(s => s.attendanceRate < 85 && s.attendanceRate >= 75);
    const critical = students.filter(s => s.attendanceRate < 75);

    return {
      total: totalStudents,
      avgAttendance: Math.round(avgAttendance),
      lowAttendance,
      critical,
    };
  };

  const stats = getAttendanceStats();

  const getSchoolName = (schoolId: number) => {
    return schools?.find(s => s.id === schoolId)?.name || "Unknown School";
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="stat-card from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              Average Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.avgAttendance}%</div>
            <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
              Across {stats.total} students
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/20 border-amber-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-amber-900 dark:text-amber-100">
              Low Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{stats.lowAttendance.length}</div>
            <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">
              75-84% attendance rate
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/20 border-red-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-red-900 dark:text-red-100">
              Critical Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.critical.length}</div>
            <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-1">
              Below 75% attendance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {stats.critical.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{stats.critical.length} student{stats.critical.length > 1 ? 's' : ''}</strong> have critical attendance rates below 75%. Immediate action recommended.
          </AlertDescription>
        </Alert>
      )}

      {stats.lowAttendance.length > 0 && (
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <TrendingDown className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-900 dark:text-amber-200">
            <strong>{stats.lowAttendance.length} student{stats.lowAttendance.length > 1 ? 's' : ''}</strong> have low attendance (75-84%). Consider sending reminders.
          </AlertDescription>
        </Alert>
      )}

      {/* Critical Students List */}
      {stats.critical.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Critical Attendance Cases
            </CardTitle>
            <CardDescription>
              Students requiring immediate intervention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.critical.slice(0, 5).map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30"
                >
                  <div className="flex-1">
                    <div className="font-semibold">{student.user?.name || 'Unknown'}</div>
                    <div className="text-sm text-muted-foreground">
                      {getSchoolName(student.schoolId)} • {student.grade}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="destructive">
                      {student.attendanceRate}% Attendance
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Low Attendance List */}
      {stats.lowAttendance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-500" />
              Low Attendance Students
            </CardTitle>
            <CardDescription>
              Students with attendance between 75-84%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.lowAttendance.slice(0, 5).map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30"
                >
                  <div className="flex-1">
                    <div className="font-semibold">{student.user?.name || 'Unknown'}</div>
                    <div className="text-sm text-muted-foreground">
                      {getSchoolName(student.schoolId)} • {student.grade}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-amber-500">
                      {student.attendanceRate}% Attendance
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
