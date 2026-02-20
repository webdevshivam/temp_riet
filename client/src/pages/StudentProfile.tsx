import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useStudents } from "@/hooks/use-students";
import { useSchools } from "@/hooks/use-schools";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  TrendingUp, 
  Award, 
  Camera, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  BookOpen
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Mock attendance data
const ATTENDANCE_TREND = [
  { month: 'Sep', rate: 95 },
  { month: 'Oct', rate: 92 },
  { month: 'Nov', rate: 88 },
  { month: 'Dec', rate: 90 },
  { month: 'Jan', rate: 93 },
];

// Mock subject-wise marks
const SUBJECT_MARKS = [
  { subject: 'Mathematics', marks: 92, total: 100 },
  { subject: 'Science', marks: 88, total: 100 },
  { subject: 'English', marks: 95, total: 100 },
  { subject: 'History', marks: 78, total: 100 },
  { subject: 'Geography', marks: 85, total: 100 },
];

// Calculate risk level
function calculateRiskLevel(student: any) {
  const marks = student.marks || 0;
  const attendance = student.attendanceRate || 0;
  
  // Critical: Low marks AND low attendance
  if (marks < 60 && attendance < 75) {
    return { level: 'critical', label: 'Critical', color: 'red', reason: 'Low marks and attendance' };
  }
  
  // At Risk: Either low marks OR low attendance
  if (marks < 70 || attendance < 80) {
    return { level: 'at-risk', label: 'At Risk', color: 'amber', reason: marks < 70 ? 'Low academic performance' : 'Low attendance' };
  }
  
  // On Track
  return { level: 'on-track', label: 'On Track', color: 'green', reason: 'Meeting all criteria' };
}

export default function StudentProfile() {
  const [, params] = useRoute("/students/:id");
  const [, setLocation] = useLocation();
  const studentId = params?.id ? parseInt(params.id) : null;
  
  const { data: students } = useStudents();
  const { data: schools } = useSchools();
  
  const student = students?.find(s => s.id === studentId);
  const school = schools?.find(s => s.id === student?.schoolId);
  
  if (!student) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Student not found</p>
            <Button onClick={() => setLocation("/students")} className="mt-4">
              Back to Students
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const risk = calculateRiskLevel(student);
  const hasFaceData = !!(student as any).faceImageBase64;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => setLocation("/students")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold font-display text-orange-600 dark:text-orange-400">
            Student Profile
          </h1>
          <p className="text-muted-foreground">Detailed information and analytics</p>
        </div>
      </div>

      {/* Student Overview */}
      <Card className="warm-shadow border-orange-100/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <User className="h-12 w-12 text-orange-500" />
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h2 className="text-2xl font-bold">{student.user?.name || 'Unknown'}</h2>
                <p className="text-muted-foreground">@{student.user?.username}</p>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Grade: <strong>{student.grade}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">School: <strong>{school?.name || 'Unknown'}</strong></span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {/* Risk Badge */}
                <Badge className={`
                  ${risk.level === 'critical' ? 'bg-red-500' : ''}
                  ${risk.level === 'at-risk' ? 'bg-amber-500' : ''}
                  ${risk.level === 'on-track' ? 'bg-green-500' : ''}
                `}>
                  {risk.level === 'critical' && <XCircle className="h-3 w-3 mr-1" />}
                  {risk.level === 'at-risk' && <AlertTriangle className="h-3 w-3 mr-1" />}
                  {risk.level === 'on-track' && <CheckCircle className="h-3 w-3 mr-1" />}
                  {risk.label}
                </Badge>
                
                {/* Scholarship Badge */}
                {student.scholarshipEligible && (
                  <Badge className="bg-blue-500">
                    <Award className="h-3 w-3 mr-1" />
                    Scholarship Eligible
                  </Badge>
                )}
                
                {/* Face Data Badge */}
                <Badge variant={hasFaceData ? "default" : "secondary"}>
                  <Camera className="h-3 w-3 mr-1" />
                  {hasFaceData ? 'Face Registered' : 'No Face Data'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="stat-card from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{student.attendanceRate}%</div>
          </CardContent>
        </Card>

        <Card className="stat-card from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/20 border-green-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-green-900 dark:text-green-100">
              Average Marks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{student.marks}%</div>
          </CardContent>
        </Card>

        <Card className="stat-card from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-purple-900 dark:text-purple-100">
              Risk Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              risk.level === 'critical' ? 'text-red-600' :
              risk.level === 'at-risk' ? 'text-amber-600' :
              'text-green-600'
            }`}>
              {risk.label}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{risk.reason}</p>
          </CardContent>
        </Card>

        <Card className="stat-card from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/20 border-amber-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-amber-900 dark:text-amber-100">
              Scholarship
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {student.scholarshipEligible ? 'Eligible' : 'Not Eligible'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <Card className="warm-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Attendance Trend
            </CardTitle>
            <CardDescription>Monthly attendance rate over last 5 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ATTENDANCE_TREND}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    dot={{ r: 5 }} 
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Subject-wise Marks */}
        <Card className="warm-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Subject-wise Performance
            </CardTitle>
            <CardDescription>Marks obtained in each subject</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SUBJECT_MARKS}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="subject" angle={-45} textAnchor="end" height={80} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                  <Bar dataKey="marks" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Table */}
      <Card className="warm-shadow">
        <CardHeader>
          <CardTitle>Subject Details</CardTitle>
          <CardDescription>Detailed breakdown of performance by subject</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Subject</th>
                  <th className="text-center p-3 font-semibold">Marks</th>
                  <th className="text-center p-3 font-semibold">Total</th>
                  <th className="text-center p-3 font-semibold">Percentage</th>
                  <th className="text-center p-3 font-semibold">Grade</th>
                </tr>
              </thead>
              <tbody>
                {SUBJECT_MARKS.map((subject, idx) => {
                  const percentage = (subject.marks / subject.total) * 100;
                  const grade = percentage >= 90 ? 'A+' : 
                               percentage >= 80 ? 'A' :
                               percentage >= 70 ? 'B' :
                               percentage >= 60 ? 'C' : 'D';
                  
                  return (
                    <tr key={idx} className="border-b hover:bg-muted/50">
                      <td className="p-3">{subject.subject}</td>
                      <td className="p-3 text-center font-semibold">{subject.marks}</td>
                      <td className="p-3 text-center text-muted-foreground">{subject.total}</td>
                      <td className="p-3 text-center">{percentage.toFixed(0)}%</td>
                      <td className="p-3 text-center">
                        <Badge variant="outline">{grade}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Face Recognition Status */}
      <Card className="warm-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-orange-500" />
            Face Recognition Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">
                Status: {hasFaceData ? 
                  <span className="text-green-600">Registered</span> : 
                  <span className="text-red-600">Not Registered</span>
                }
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {hasFaceData ? 
                  'Face data is available for attendance verification' : 
                  'Face data needs to be captured for biometric attendance'
                }
              </p>
            </div>
            <Button variant="outline">
              {hasFaceData ? 'Update Face Data' : 'Capture Face Data'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
