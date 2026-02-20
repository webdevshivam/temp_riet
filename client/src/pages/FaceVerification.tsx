import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Camera, ClipboardCheck, Users } from "lucide-react";
import { useFaceVerify, useMarkAttendance, useAttendance } from "@/hooks/use-attendance";
import { useStudents } from "@/hooks/use-students";
import { useTeacherMe } from "@/hooks/use-teachers";
import { useToast } from "@/hooks/use-toast";
import { FaceCapture } from "@/components/FaceCapture";

export default function FaceVerification() {
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [faceStudentId, setFaceStudentId] = useState<number | null>(null);
  const [showCapture, setShowCapture] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    studentName?: string;
    confidence?: number;
  } | null>(null);

  const { data: teacher, isLoading: teacherLoading } = useTeacherMe();
  const { data: allStudents, isLoading: studentsLoading } = useStudents();
  const { data: attendanceRecords } = useAttendance();
  const { mutate: verify, isPending: verifyPending } = useFaceVerify();
  const { mutate: markAttendance, isPending: markPending } = useMarkAttendance();
  const { toast } = useToast();

  const assignedClasses = teacher?.assignedClasses ?? [];

  // Filter students to only those in teacher's assigned classes
  const students = useMemo(() => {
    if (!allStudents) return [];
    if (assignedClasses.length === 0) return [];
    return allStudents.filter(s => assignedClasses.includes(s.grade));
  }, [allStudents, assignedClasses]);

  // Further filter by selected class tab
  const filteredStudents = useMemo(() => {
    if (selectedClass === "all") return students;
    return students.filter(s => s.grade === selectedClass);
  }, [students, selectedClass]);

  // Today's attendance records by studentId
  const todayStr = new Date().toISOString().split("T")[0];
  const todayAttendance = useMemo(() => {
    const map = new Map<number, { status: string; faceVerified: boolean }>();
    if (!attendanceRecords) return map;
    for (const rec of attendanceRecords) {
      const recDate = new Date(rec.date).toISOString().split("T")[0];
      if (recDate === todayStr) {
        map.set(rec.studentId, { status: rec.status, faceVerified: rec.faceVerified });
      }
    }
    return map;
  }, [attendanceRecords, todayStr]);

  const handleMarkPresent = (studentId: number) => {
    markAttendance({
      studentId,
      status: "present",
      faceVerified: false,
      markedByTeacherId: teacher?.id,
    }, {
      onSuccess: () => {
        toast({ title: "Marked Present", description: "Attendance recorded successfully." });
      },
      onError: (err: Error) => {
        toast({ variant: "destructive", title: "Error", description: err.message });
      },
    });
  };

  const handleFaceCapture = (imageBase64: string) => {
    if (!faceStudentId) return;
    verify({ imageBase64, studentId: faceStudentId }, {
      onSuccess: (data: any) => {
        setShowCapture(false);
        setVerificationResult({
          success: data.success,
          studentName: data.studentName,
          confidence: data.matchConfidence,
        });
        if (data.success) {
          toast({ title: "Verified & Present", description: `${data.studentName} verified with ${data.matchConfidence}% confidence.` });
        } else {
          toast({ variant: "destructive", title: "Verification Failed", description: "Face does not match." });
        }
      },
      onError: (err: Error) => {
        setShowCapture(false);
        toast({ variant: "destructive", title: "Error", description: err.message });
      },
    });
  };

  const presentCount = filteredStudents.filter(s => todayAttendance.has(s.id)).length;

  if (teacherLoading || studentsLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!teacher) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p className="text-lg font-semibold">No teacher profile found for your account.</p>
        <p className="text-sm mt-2">Please contact your admin to assign you as a teacher.</p>
      </div>
    );
  }

  if (assignedClasses.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p className="text-lg font-semibold">No classes assigned to you yet.</p>
        <p className="text-sm mt-2">Please contact your admin to assign classes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-display tracking-tight flex items-center gap-2">
          <ClipboardCheck className="h-8 w-8 text-primary" />
          Mark Attendance
        </h1>
        <p className="text-muted-foreground mt-1">
          {teacher.user?.name} &mdash; {teacher.subject} &mdash; Classes: {assignedClasses.join(", ")}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedClasses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredStudents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {presentCount} / {filteredStudents.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class filter */}
      <div className="flex items-center gap-3">
        <Label>Class:</Label>
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {assignedClasses.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Verification result banner */}
      {verificationResult && (
        <Card className={`border-2 ${verificationResult.success ? 'border-green-500 bg-green-50 dark:bg-green-950/50' : 'border-red-500 bg-red-50 dark:bg-red-950/50'}`}>
          <CardContent className="p-4 flex items-center gap-4">
            {verificationResult.success ? <CheckCircle className="h-8 w-8 text-green-600" /> : <XCircle className="h-8 w-8 text-red-600" />}
            <div className="flex-1">
              <p className="font-semibold">{verificationResult.success ? 'Verified' : 'Failed'}</p>
              <p className="text-sm text-muted-foreground">
                {verificationResult.success
                  ? `${verificationResult.studentName} — ${verificationResult.confidence}% confidence`
                  : 'Face does not match'}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setVerificationResult(null)}>Dismiss</Button>
          </CardContent>
        </Card>
      )}

      {/* Students table */}
      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
          <CardDescription>Mark attendance for today — {new Date().toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Reg No</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Today's Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No students found in your assigned classes.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => {
                    const today = todayAttendance.get(student.id);
                    const isPresent = !!today;
                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          <div>{student.user?.name || "Unknown"}</div>
                          <div className="text-xs text-muted-foreground">@{student.user?.username}</div>
                        </TableCell>
                        <TableCell>{student.registrationNo}</TableCell>
                        <TableCell>{student.grade}</TableCell>
                        <TableCell>
                          {isPresent ? (
                            <Badge className="bg-green-500 gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Present{today.faceVerified ? " (Face)" : ""}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Not Marked</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {isPresent ? (
                            <span className="text-sm text-muted-foreground">Done</span>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleMarkPresent(student.id)}
                                disabled={markPending}
                              >
                                Mark Present
                              </Button>
                              {(student as any).faceImageBase64 && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => { setFaceStudentId(student.id); setShowCapture(true); }}
                                >
                                  <Camera className="h-3 w-3 mr-1" />
                                  Face Verify
                                </Button>
                              )}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Face Capture Dialog */}
      <Dialog open={showCapture} onOpenChange={setShowCapture}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Face Verification</DialogTitle>
            <DialogDescription>Position face in the center with good lighting</DialogDescription>
          </DialogHeader>
          <FaceCapture
            onCapture={handleFaceCapture}
            onCancel={() => setShowCapture(false)}
            showPreview={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
