import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Calendar, ClipboardCheck, Award, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

export default function TeacherDashboard() {
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
        <div className="absolute -top-6 -left-6 w-32 h-32 bg-green-200/30 dark:bg-green-900/20 rounded-full blur-3xl"></div>
        <div className="relative">
          <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight text-green-600 dark:text-green-400">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-muted-foreground mt-3 text-lg">Teacher Dashboard - Manage your classes and students</p>
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
              <CardTitle className="text-sm font-semibold text-blue-900 dark:text-blue-100">My Students</CardTitle>
              <div className="bg-blue-500 p-2.5 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">127</div>
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">Across 4 classes</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="stat-card from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/20 border-green-200/50 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-green-900 dark:text-green-100">Classes Assigned</CardTitle>
              <div className="bg-green-500 p-2.5 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">4</div>
              <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">Mathematics courses</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="stat-card from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200/50 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-purple-900 dark:text-purple-100">Pending Assignments</CardTitle>
              <div className="bg-purple-500 p-2.5 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                <ClipboardCheck className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">23</div>
              <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">To be graded</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="stat-card from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/20 border-amber-200/50 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-amber-900 dark:text-amber-100">Avg Class Score</CardTitle>
              <div className="bg-amber-500 p-2.5 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">82%</div>
              <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +5% from last month
              </p>
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
              <span className="text-sm">My Students</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setLocation("/attendance")}>
              <Calendar className="h-6 w-6 text-green-500" />
              <span className="text-sm">Take Attendance</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setLocation("/courses")}>
              <BookOpen className="h-6 w-6 text-purple-500" />
              <span className="text-sm">Course Materials</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <ClipboardCheck className="h-6 w-6 text-orange-500" />
              <span className="text-sm">Grade Assignments</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="warm-shadow">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-sm">Chapter 5 Test</p>
                <p className="text-xs text-muted-foreground">Grade 10-A</p>
              </div>
              <Badge className="bg-green-500">Completed</Badge>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-sm">Assignment Review</p>
                <p className="text-xs text-muted-foreground">Grade 10-B</p>
              </div>
              <Badge className="bg-amber-500">In Progress</Badge>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-sm">Parent Meeting</p>
                <p className="text-xs text-muted-foreground">Tomorrow 10 AM</p>
              </div>
              <Badge variant="outline">Scheduled</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Performance Overview */}
      <Card className="warm-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-green-500" />
            Top Performing Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "Sarah Johnson", grade: "10-A", score: 98 },
              { name: "Michael Chen", grade: "10-B", score: 96 },
              { name: "Emma Williams", grade: "10-A", score: 94 },
            ].map((student, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-semibold">{student.name}</p>
                  <p className="text-xs text-muted-foreground">Grade {student.grade}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">{student.score}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
