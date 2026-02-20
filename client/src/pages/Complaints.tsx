import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Clock, User, School } from "lucide-react";


const categoryColors: Record<string, string> = {
  infrastructure: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  harassment: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  academic: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  other: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
};

export default function Complaints() {
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "resolved">("all");

  const { data: complaints, isLoading } = useQuery<any[]>({
    queryKey: ["/api/complaints"],
    queryFn: async () => {
      const response = await fetch("/api/complaints", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch complaints");
      return response.json();
    },
  });

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

  const filteredComplaints = complaints?.filter((c) => {
    if (statusFilter === "all") return true;
    return c.status === statusFilter;
  }) || [];

  const getStudentInfo = (studentId?: number) => {
    if (!studentId) return null;
    return students?.find((s) => s.id === studentId);
  };

  const getSchoolInfo = (schoolId?: number) => {
    if (!schoolId) return null;
    return schools?.find((s) => s.id === schoolId);
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return d.toLocaleDateString();
  };

  if (isLoading) {
    return <div className="p-8">Loading complaints...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold font-display text-orange-600 dark:text-orange-400">Complaints & Reports</h1>
          <p className="text-muted-foreground">AI-classified anonymous reporting system with student tracking</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Total Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{complaints?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">
              {complaints?.filter((c) => c.status === "pending").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {complaints?.filter((c) => c.status === "resolved").length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Complaints List */}
      <div className="grid gap-4">
        {filteredComplaints.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No complaints found
            </CardContent>
          </Card>
        ) : (
          filteredComplaints.map((complaint) => {
            const student = getStudentInfo(complaint.studentId);
            const school = getSchoolInfo(complaint.schoolId);
            
            return (
              <Card key={complaint.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={categoryColors[complaint.aiClassification || 'other']}>
                        {(complaint.aiClassification || 'other').charAt(0).toUpperCase() + 
                         (complaint.aiClassification || 'other').slice(1)}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(complaint.createdAt)}
                      </span>
                      {complaint.isAnonymous && (
                        <Badge variant="secondary" className="text-xs">
                          Anonymous
                        </Badge>
                      )}
                    </div>
                    {complaint.status === 'resolved' ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Resolved
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg mt-2">{complaint.title}</CardTitle>
                  
                  {/* Student/School Info */}
                  {!complaint.isAnonymous && (student || school) && (
                    <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                      {student && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {student.user?.name || 'Unknown Student'} ({student.grade})
                        </div>
                      )}
                      {school && (
                        <div className="flex items-center gap-1">
                          <School className="h-3 w-3" />
                          {school.name}
                        </div>
                      )}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{complaint.content}</p>
                  {complaint.aiClassification === 'harassment' && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-md text-xs text-red-600 dark:text-red-400">
                      <strong>AI Priority Alert:</strong> This report contains keywords indicating potential safety risks. Immediate attention recommended.
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
