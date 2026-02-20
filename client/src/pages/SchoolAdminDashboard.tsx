import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, AlertTriangle, TrendingUp, School, UserCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

export default function SchoolAdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-8">
      <div className="relative">
        <div className="absolute -top-6 -left-6 w-32 h-32 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl"></div>
        <div className="relative">
          <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight text-blue-600 dark:text-blue-400">
            Welcome, {user?.name}!
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
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">542</div>
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
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">32</div>
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
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">87%</div>
              <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +3% this semester
              </p>
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
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">7</div>
              <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">Require attention</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
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
            <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900/30">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm">Low Attendance Alert</p>
                <p className="text-xs text-muted-foreground">12 students below 75% attendance</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900/30">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm">New Complaint</p>
                <p className="text-xs text-muted-foreground">Infrastructure issue reported</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900/30">
              <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm">Teacher Request</p>
                <p className="text-xs text-muted-foreground">New course material approval needed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Performance */}
      <Card className="warm-shadow">
        <CardHeader>
          <CardTitle>Class Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { grade: "Grade 10-A", avgScore: 92, students: 45, status: "excellent" },
              { grade: "Grade 10-B", avgScore: 85, students: 48, status: "good" },
              { grade: "Grade 9-A", avgScore: 78, students: 42, status: "average" },
              { grade: "Grade 9-B", avgScore: 88, students: 46, status: "good" },
            ].map((cls, idx) => (
              <div key={idx} className="flex justify-between items-center p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold">{cls.grade}</p>
                  <p className="text-xs text-muted-foreground">{cls.students} students</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold">{cls.avgScore}%</p>
                    <p className="text-xs text-muted-foreground">Average</p>
                  </div>
                  <Badge className={
                    cls.status === "excellent" ? "bg-green-500" :
                    cls.status === "good" ? "bg-blue-500" :
                    "bg-amber-500"
                  }>
                    {cls.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
