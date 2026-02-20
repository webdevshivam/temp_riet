import { useDashboardAnalytics } from "@/hooks/use-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { School, Users, AlertTriangle, TrendingUp, BarChart3, TrendingUpIcon, Award } from "lucide-react";
import { motion } from "framer-motion";
import { ScholarshipRecommendations } from "@/components/ScholarshipRecommendations";

const TEACHER_SHORTAGE_DATA = [
  { subject: 'Math', shortage: 24, available: 120 },
  { subject: 'Science', shortage: 18, available: 110 },
  { subject: 'English', shortage: 8, available: 140 },
  { subject: 'History', shortage: 5, available: 90 },
];

const PERFORMANCE_DATA = [
  { month: 'Jan', score: 78 },
  { month: 'Feb', score: 82 },
  { month: 'Mar', score: 81 },
  { month: 'Apr', score: 85 },
  { month: 'May', score: 89 },
];

export default function GovDashboard() {
  const { data: analytics, isLoading } = useDashboardAnalytics();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  if (isLoading) return <div className="p-8">Loading analytics...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute -top-6 -left-6 w-32 h-32 bg-orange-200/30 dark:bg-orange-900/20 rounded-full blur-3xl"></div>
        <div className="relative">
          <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight text-orange-600 dark:text-orange-400">
            Government Overview
          </h1>
          <p className="text-muted-foreground mt-3 text-lg">National education metrics and insights at a glance</p>
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={item}>
          <Card className="stat-card from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200/50 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-orange-900 dark:text-orange-100">Total Schools</CardTitle>
              <div className="bg-orange-500 p-2.5 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                <School className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{analytics?.totalSchools || 42}</div>
              <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +2 from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={item}>
          <Card className="stat-card from-rose-50 to-pink-100/50 dark:from-rose-950/20 dark:to-pink-900/20 border-rose-200/50 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-rose-900 dark:text-rose-100">Total Students</CardTitle>
              <div className="bg-rose-500 p-2.5 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">{analytics?.totalStudents || 12543}</div>
              <p className="text-xs text-rose-600/70 dark:text-rose-400/70 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +12% enrollment rate
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="stat-card from-amber-50 to-yellow-100/50 dark:from-amber-950/20 dark:to-yellow-900/20 border-amber-200/50 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-amber-900 dark:text-amber-100">Teacher Shortage</CardTitle>
              <div className="bg-amber-500 p-2.5 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{analytics?.teacherShortageCount || 156}</div>
              <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">
                Critical in rural areas
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="stat-card from-emerald-50 to-green-100/50 dark:from-emerald-950/20 dark:to-green-900/20 border-emerald-200/50 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Avg Performance</CardTitle>
              <div className="bg-emerald-500 p-2.5 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">84%</div>
              <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +4.5% year over year
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 warm-shadow border-orange-100/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-500" />
              Teacher Shortage by Subject
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={TEACHER_SHORTAGE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="available" fill="#fed7aa" radius={[8, 8, 0, 0]} name="Available" />
                  <Bar dataKey="shortage" fill="#f97316" radius={[8, 8, 0, 0]} name="Shortage" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 warm-shadow border-rose-100/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUpIcon className="h-5 w-5 text-rose-500" />
              National Performance Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={PERFORMANCE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" />
                  <YAxis domain={[60, 100]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#f43f5e" strokeWidth={3} dot={{ r: 5, fill: '#f43f5e' }} activeDot={{ r: 8, fill: '#e11d48' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scholarship Recommendations */}
      <Card className="warm-shadow border-amber-100/50">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            Scholarship Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScholarshipRecommendations />
        </CardContent>
      </Card>
    </div>
  );
}
