import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, TrendingUp, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

export function ScholarshipRecommendations() {
  const [, setLocation] = useLocation();

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

  // Scholarship recommendation logic
  const getRecommendations = () => {
    if (!students) return [];

    return students
      .map((student) => {
        const marks = student.marks || 0;
        const attendance = student.attendanceRate || 0;
        
        // Calculate recommendation score (0-100)
        let score = 0;
        let reasons: string[] = [];
        
        // Performance criteria (max 50 points)
        if (marks >= 90) {
          score += 50;
          reasons.push("Excellent academic performance (≥90%)");
        } else if (marks >= 80) {
          score += 40;
          reasons.push("Very good academic performance (80-89%)");
        } else if (marks >= 70) {
          score += 25;
          reasons.push("Good academic performance (70-79%)");
        }
        
        // Attendance criteria (max 30 points)
        if (attendance >= 95) {
          score += 30;
          reasons.push("Excellent attendance (≥95%)");
        } else if (attendance >= 85) {
          score += 20;
          reasons.push("Good attendance (85-94%)");
        } else if (attendance >= 75) {
          score += 10;
          reasons.push("Fair attendance (75-84%)");
        }
        
        // Current scholarship status (max 20 points)
        if (student.scholarshipEligible) {
          score += 20;
          reasons.push("Currently marked as eligible");
        }
        
        // Only recommend students with score >= 50
        if (score >= 50) {
          return {
            student,
            score,
            reasons,
            priority: score >= 80 ? "high" : score >= 65 ? "medium" : "low",
          };
        }
        
        return null;
      })
      .filter((rec) => rec !== null)
      .sort((a, b) => b!.score - a!.score);
  };

  const recommendations = getRecommendations();

  const getSchoolName = (schoolId: number) => {
    return schools?.find((s) => s.id === schoolId)?.name || "Unknown School";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-green-500";
      case "medium":
        return "bg-blue-500";
      case "low":
        return "bg-amber-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="stat-card from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/20 border-green-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-green-900 dark:text-green-100">
              High Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {recommendations.filter((r) => r?.priority === "high").length}
            </div>
            <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">
              Score ≥ 80
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              Medium Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {recommendations.filter((r) => r?.priority === "medium").length}
            </div>
            <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
              Score 65-79
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/20 border-amber-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-amber-900 dark:text-amber-100">
              Low Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">
              {recommendations.filter((r) => r?.priority === "low").length}
            </div>
            <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">
              Score 50-64
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recommended Students</CardTitle>
          <CardDescription>
            AI-powered recommendations based on performance, attendance, and eligibility
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No scholarship recommendations at this time
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.slice(0, 10).map((rec) => {
                if (!rec) return null;
                const { student, score, reasons, priority } = rec;

                return (
                  <div
                    key={student.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setLocation(`/students/${student.id}`)}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                        <Award className="h-6 w-6 text-orange-500" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">
                            {student.user?.name || "Unknown"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {getSchoolName(student.schoolId)} • {student.grade}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(priority)}>
                            {priority.toUpperCase()} • Score: {score}
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-2 space-y-1">
                        {reasons.map((reason, idx) => (
                          <div
                            key={idx}
                            className="text-xs text-muted-foreground flex items-center gap-1"
                          >
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {reason}
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 flex gap-2 text-xs">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Performance: {student.marks}%
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Attendance: {student.attendanceRate}%
                        </span>
                        {student.scholarshipEligible && (
                          <span className="flex items-center gap-1 text-green-600">
                            <Award className="h-3 w-3" />
                            Already Eligible
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
