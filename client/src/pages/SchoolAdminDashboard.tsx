import { useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useStudents } from "@/hooks/use-students";
import { useTeachers } from "@/hooks/use-teachers";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, AlertTriangle, TrendingUp, School, UserCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

export default function SchoolAdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const schoolId = user?.schoolId ?? undefined;

  // Fetch real data scoped to this school
  const { data: students = [], isLoading: loadingStudents } = useStudents(schoolId);
  const { data: teachers = [], isLoading: loadingTeachers } = useTeachers(schoolId);
  const { data: allComplaints = [], isLoading: loadingComplaints } = useQuery<any[]>({
    queryKey: ["/api/complaints"],
    queryFn: async () => {
      const res = await fetch("/api/complaints", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch complaints");
      return res.json();
    },
  });

  // Filter complaints to this school
  const complaints = useMemo(
    () => (schoolId ? allComplaints.filter((c: any) => c.schoolId === schoolId) : allComplaints),
    [allComplaints, schoolId],
  );

  const pendingComplaints = useMemo(
    () => complaints.filter((c: any) => c.status === "pending"),
    [complaints],
  );

  // Compute average performance from student marks
  const avgPerformance = useMemo(() => {
    if (students.length === 0) return 0;
    const sum = students.reduce((acc: number, s: any) => acc + (s.marks ?? 0), 0);
    return Math.round(sum / students.length);
  }, [students]);

  // Students with low attendance (<75%)
  const lowAttendanceStudents = useMemo(
    () => students.filter((s: any) => (s.attendanceRate ?? 100) < 75),
    [students],
  );

  // Recent complaints (latest 3)
  const recentComplaints = useMemo(
    () =>
      [...complaints]
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3),
    [complaints],
  );

  // Class performance grouped by grade
  const gradePerformance = useMemo(() => {
    const map: Record<string, { totalMarks: number; count: number }> = {};
    students.forEach((s: any) => {
      const grade = s.grade || "Unknown";
      if (!map[grade]) map[grade] = { totalMarks: 0, count: 0 };
      map[grade].totalMarks += s.marks ?? 0;
      map[grade].count += 1;
    });
    return Object.entries(map)
      .map(([grade, v]) => {
        const avg = Math.round(v.totalMarks / v.count);
        const status = avg >= 90 ? "excellent" : avg >= 75 ? "good" : avg >= 50 ? "average" : "poor";
        return { grade, avgScore: avg, students: v.count, status };
      })
      .sort((a, b) => b.avgScore - a.avgScore);
  }, [students]);

  const isLoading = loadingStudents || loadingTeachers || loadingComplaints;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
    return d.toLocaleDateString();
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="relative">
        <div className="absolute -top-6 -left-6 w-32 h-32 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl"></div>
        <div className="relative">
          <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight text-blue-600 dark:text-blue-400">
            Welcome, {user?.username}!
          </h1>
          <p className="text-muted-foreground mt-3 text-lg">School Admin Dashboard - Oversee school operations</p>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={item}>
          <Card className="stat-card from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200/50 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-blue-900 dark:text-blue-100">Total Students</CardTitle>
              <div className="bg-blue-500 p-2.5 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{students.length}</div>
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">In your school</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="stat-card from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/20 border-green-200/50 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-green-900 dark:text-green-100">Teachers</CardTitle>
              <div className="bg-green-500 p-2.5 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                <UserCheck className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{teachers.length}</div>
              <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">Active faculty members</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="stat-card from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200/50 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-purple-900 dark:text-purple-100">Avg Performance</CardTitle>
              <div className="bg-purple-500 p-2.5 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {students.length > 0 ? `${avgPerformance}%` : "N/A"}
              </div>
              <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">Based on student marks</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="stat-card from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/20 border-amber-200/50 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-amber-900 dark:text-amber-100">Pending Issues</CardTitle>
              <div className="bg-amber-500 p-2.5 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{pendingComplaints.length}</div>
              <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">Require attention</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Quick Actions + Recent Alerts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="warm-shadow">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setLocation("/students")}>
              <Users className="h-6 w-6 text-blue-500" />
              <span className="text-sm">Manage Students</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setLocation("/teachers")}>
              <UserCheck className="h-6 w-6 text-green-500" />
              <span className="text-sm">Manage Teachers</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setLocation("/complaints")}>
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              <span className="text-sm">View Complaints</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setLocation("/analytics")}>
              <TrendingUp className="h-6 w-6 text-purple-500" />
              <span className="text-sm">Analytics</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="warm-shadow">
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowAttendanceStudents.length > 0 && (
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900/30">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-sm">Low Attendance Alert</p>
                  <p className="text-xs text-muted-foreground">
                    {lowAttendanceStudents.length} student{lowAttendanceStudents.length !== 1 ? "s" : ""} below 75% attendance
                  </p>
                </div>
              </div>
            )}
            {recentComplaints.map((c: any) => (
              <div
                key={c.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  c.aiClassification === "harassment"
                    ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30"
                    : c.aiClassification === "infrastructure"
                      ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30"
                      : "bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-900/30"
                }`}
              >
                <AlertTriangle
                  className={`h-5 w-5 mt-0.5 ${
                    c.aiClassification === "harassment"
                      ? "text-red-600"
                      : c.aiClassification === "infrastructure"
                        ? "text-blue-600"
                        : "text-gray-600"
                  }`}
                />
                <div className="flex-1">
                  <p className="font-semibold text-sm">{c.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.aiClassification ? c.aiClassification.charAt(0).toUpperCase() + c.aiClassification.slice(1) : "Other"}
                    {" · "}
                    {formatDate(c.createdAt)}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className={
                    c.status === "resolved"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  }
                >
                  {c.status}
                </Badge>
              </div>
            ))}
            {lowAttendanceStudents.length === 0 && recentComplaints.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No alerts at this time</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Class Performance */}
      <Card className="warm-shadow">
        <CardHeader>
          <CardTitle>Class Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {gradePerformance.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No student data available</p>
          ) : (
            <div className="space-y-3">
              {gradePerformance.map((cls, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold">{cls.grade}</p>
                    <p className="text-xs text-muted-foreground">
                      {cls.students} student{cls.students !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold">{cls.avgScore}%</p>
                      <p className="text-xs text-muted-foreground">Average</p>
                    </div>
                    <Badge
                      className={
                        cls.status === "excellent"
                          ? "bg-green-500"
                          : cls.status === "good"
                            ? "bg-blue-500"
                            : cls.status === "average"
                              ? "bg-amber-500"
                              : "bg-red-500"
                      }
                    >
                      {cls.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
