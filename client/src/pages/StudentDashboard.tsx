import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Calendar, Award, AlertCircle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { StudentComplaintDialog } from "@/components/StudentComplaintDialog";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [complaintDialogOpen, setComplaintDialogOpen] = useState(false);

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
        <div className="absolute -top-6 -left-6 w-32 h-32 bg-orange-200/30 dark:bg-orange-900/20 rounded-full blur-3xl"></div>
        <div className="relative">
          <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight text-orange-600 dark:text-orange-400">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-muted-foreground mt-3 text-lg">Here's your academic overview</p>
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
              <CardTitle className="text-sm font-semibold text-blue-900 dark:text-blue-100">Attendance</CardTitle>
              <div className="bg-blue-500 p-2.5 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                <Calendar className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">92%</div>
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">28/30 days present</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="stat-card from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/20 border-green-200/50 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-green-900 dark:text-green-100">Average Grade</CardTitle>
              <div className="bg-green-500 p-2.5 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">85%</div>
              <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +3% from last term
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="stat-card from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200/50 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-purple-900 dark:text-purple-100">Assignments</CardTitle>
              <div className="bg-purple-500 p-2.5 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">3</div>
              <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">Pending submissions</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="stat-card from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/20 border-amber-200/50 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-amber-900 dark:text-amber-100">Scholarship</CardTitle>
              <div className="bg-amber-500 p-2.5 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                <Award className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">Eligible</div>
              <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">Based on performance</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Alerts */}
      <Card className="bg-orange-50/50 dark:bg-orange-950/20 border-orange-200/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Important Notices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-white dark:bg-card rounded-lg">
            <BookOpen className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-sm">Mathematics Assignment Due</p>
              <p className="text-xs text-muted-foreground">Submit Chapter 5 problems by Friday</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-white dark:bg-card rounded-lg">
            <Calendar className="h-5 w-5 text-green-500 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-sm">Parent-Teacher Meeting</p>
              <p className="text-xs text-muted-foreground">Scheduled for next Monday at 10 AM</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="warm-shadow">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and features</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <BookOpen className="h-6 w-6 text-blue-500" />
              <span className="text-sm">My Courses</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Calendar className="h-6 w-6 text-green-500" />
              <span className="text-sm">Attendance</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <GraduationCap className="h-6 w-6 text-purple-500" />
              <span className="text-sm">Grades</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2"
              onClick={() => setComplaintDialogOpen(true)}
            >
              <AlertCircle className="h-6 w-6 text-orange-500" />
              <span className="text-sm">File Complaint</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="warm-shadow">
          <CardHeader>
            <CardTitle>Recent Performance</CardTitle>
            <CardDescription>Your grades from recent tests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Mathematics Test</span>
              <span className="font-bold text-green-600">92%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Science Quiz</span>
              <span className="font-bold text-blue-600">88%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">English Essay</span>
              <span className="font-bold text-purple-600">95%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Complaint Dialog */}
      <StudentComplaintDialog 
        open={complaintDialogOpen} 
        onOpenChange={setComplaintDialogOpen} 
      />
    </div>
  );
}
