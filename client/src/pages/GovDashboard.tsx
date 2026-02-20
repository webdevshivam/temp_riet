import { useDashboardAnalytics } from "@/hooks/use-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { School, Users, AlertTriangle, TrendingUp, BarChart3, Award } from "lucide-react";
import { ScholarshipRecommendations } from "@/components/ScholarshipRecommendations";
import { useAuth } from "@/hooks/use-auth";

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
  const { user } = useAuth();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading analytics...</div>;

  const stats = [
    { label: "Total Schools", value: analytics?.totalSchools ?? 0, icon: School, change: "+2 this month" },
    { label: "Total Students", value: analytics?.totalStudents ?? 0, icon: Users, change: "Enrolled" },
    { label: "Teacher Shortage", value: analytics?.teacherShortageCount ?? 0, icon: AlertTriangle, change: "Positions needed" },
    { label: "Avg Attendance", value: `${analytics?.averageAttendance ?? 0}%`, icon: TrendingUp, change: "Across all schools" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight">Welcome back, {user?.username}</h1>
        <p className="text-muted-foreground mt-1">National education metrics at a glance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground font-medium">{s.label}</span>
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                    <Icon className="h-4.5 w-4.5 text-muted-foreground" />
                  </div>
                </div>
                <div className="text-2xl font-bold">{s.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{s.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Teacher Shortage by Subject
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={TEACHER_SHORTAGE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 90%)" />
                  <XAxis dataKey="subject" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(220 13% 90%)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 13 }}
                  />
                  <Bar dataKey="available" fill="hsl(220 14% 86%)" radius={[4, 4, 0, 0]} name="Available" />
                  <Bar dataKey="shortage" fill="hsl(234 85% 55%)" radius={[4, 4, 0, 0]} name="Shortage" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Performance Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={PERFORMANCE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 90%)" />
                  <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[60, 100]} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(220 13% 90%)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 13 }}
                  />
                  <Line type="monotone" dataKey="score" stroke="hsl(234 85% 55%)" strokeWidth={2.5} dot={{ r: 4, fill: 'hsl(234 85% 55%)' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-4 w-4 text-muted-foreground" />
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
