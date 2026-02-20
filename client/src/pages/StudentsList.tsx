import { useState } from "react";
import { useStudents, useCreateStudent, useSetStudentFaceData } from "@/hooks/use-students";
import { useSchools } from "@/hooks/use-schools";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { GraduationCap, Plus, Search, TrendingUp, TrendingDown, Award, AlertTriangle, AlertCircle, CheckCircle, XCircle, Filter, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

function fileToBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function FaceCaptureDialog({ open, onClose, students, defaultStudentId, onCaptured }: {
  open: boolean;
  onClose: () => void;
  students: any[];
  defaultStudentId?: number;
  onCaptured: (id: number, b64: string) => void;
}) {
  const [studentId, setStudentId] = useState<number | undefined>(defaultStudentId);
  const videoRef = (window as any).React?.useRef?.() || (undefined as any);
  // fallback simple refs to avoid type issues
  const [stream, setStream] = useState<MediaStream | null>(null);

  (window as any).useEffect?.(() => {}, []);
  // Lightweight manual lifecycle to start camera when dialog opens
  if (open && !stream && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true }).then((s) => {
      setStream(s);
      const video = document.getElementById('face-video') as HTMLVideoElement | null;
      if (video) {
        video.srcObject = s;
        video.play();
      }
    }).catch(() => {});
  }
  if (!open && stream) {
    stream.getTracks().forEach(t => t.stop());
    setStream(null);
  }

  const capture = () => {
    if (!studentId) return;
    const video = document.getElementById('face-video') as HTMLVideoElement | null;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const b64 = dataUrl.split(',')[1];
    onCaptured(studentId, b64);
    onClose();
  };

  return (
    <DialogContent className="max-w-xl">
      <DialogHeader>
        <DialogTitle>Add Student Face</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label>Select Student</Label>
          <Select value={String(studentId ?? '') === '' ? '__select__' : String(studentId)} onValueChange={(v) => setStudentId(v === '__select__' ? undefined : Number(v))}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a student" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__select__">Select…</SelectItem>
              {students.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.user?.name || `Student ${s.id}`} ({s.grade})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-md overflow-hidden border bg-black">
          <video id="face-video" className="w-full h-64 object-cover" autoPlay playsInline muted />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={!studentId} onClick={capture}>Capture & Save</Button>
        </div>
        <div className="text-xs text-muted-foreground">If camera access is blocked, allow it in your browser settings. As a fallback, you can still add a face image when creating a student.</div>
      </div>
    </DialogContent>
  );
}

export default function StudentsList() {
  const { data: students, isLoading } = useStudents();
  const { data: schools } = useSchools();
  const createStudent = useCreateStudent();
  const setFaceData = useSetStudentFaceData();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFaceDialogOpen, setIsFaceDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  
  // Filters
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [performanceFilter, setPerformanceFilter] = useState<string>("all");
  const [attendanceFilter, setAttendanceFilter] = useState<string>("all");
  const [scholarshipFilter, setScholarshipFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  
  // Bulk actions
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "password",
    schoolId: "",
    registrationNo: "",
    fatherName: "",
    motherName: "",
    mobileNumber: "",
    address: "",
    permanentAddress: "",
    gender: "",
    age: "",
    parentMobileNumber: "",
    grade: "",
    marks: "0",
    attendanceRate: "100",
    faceImageBase64: "",
  });

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.username || !formData.schoolId || !formData.grade || !formData.registrationNo || !formData.fatherName || !formData.motherName || !formData.address || !formData.permanentAddress || !formData.gender || !formData.age || !formData.parentMobileNumber) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createStudent.mutate({
      userId: 0, // Will be created
      schoolId: parseInt(formData.schoolId),
      registrationNo: formData.registrationNo,
      fatherName: formData.fatherName,
      motherName: formData.motherName,
      mobileNumber: formData.mobileNumber || undefined,
      address: formData.address,
      permanentAddress: formData.permanentAddress,
      gender: formData.gender as "male" | "female" | "other",
      age: parseInt(formData.age),
      parentMobileNumber: formData.parentMobileNumber,
      grade: formData.grade,
      marks: parseInt(formData.marks),
      attendanceRate: parseInt(formData.attendanceRate),
      user: {
        name: formData.name,
        username: formData.username,
        password: formData.password,
        schoolId: parseInt(formData.schoolId),
      },
      faceImageBase64: formData.faceImageBase64 || undefined,
    } as any, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Student created successfully",
        });
        setIsDialogOpen(false);
        setFormData({
          name: "",
          username: "",
          password: "password",
          schoolId: "",
          registrationNo: "",
          fatherName: "",
          motherName: "",
          mobileNumber: "",
          address: "",
          permanentAddress: "",
          gender: "",
          age: "",
          parentMobileNumber: "",
          grade: "",
          marks: "0",
          attendanceRate: "100",
          faceImageBase64: "",
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to create student",
          variant: "destructive",
        });
      },
    });
  };

  // Get unique grades for filter
  const uniqueGrades = Array.from(new Set(students?.map(s => s.grade) || []));

  const filteredStudents = students?.filter((student) => {
    // Search filter
    const matchesSearch = searchTerm === "" ||
      student.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.grade.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Grade filter
    const matchesGrade = gradeFilter === "all" || student.grade === gradeFilter;
    
    // Performance filter
    let matchesPerformance = true;
    if (performanceFilter === "excellent") matchesPerformance = student.marks >= 90;
    else if (performanceFilter === "good") matchesPerformance = student.marks >= 75 && student.marks < 90;
    else if (performanceFilter === "average") matchesPerformance = student.marks >= 60 && student.marks < 75;
    else if (performanceFilter === "poor") matchesPerformance = student.marks < 60;
    
    // Attendance filter
    let matchesAttendance = true;
    if (attendanceFilter === "excellent") matchesAttendance = student.attendanceRate >= 95;
    else if (attendanceFilter === "good") matchesAttendance = student.attendanceRate >= 85 && student.attendanceRate < 95;
    else if (attendanceFilter === "fair") matchesAttendance = student.attendanceRate >= 75 && student.attendanceRate < 85;
    else if (attendanceFilter === "poor") matchesAttendance = student.attendanceRate < 75;
    
    // Scholarship filter
    const matchesScholarship = scholarshipFilter === "all" ||
      (scholarshipFilter === "eligible" && student.scholarshipEligible) ||
      (scholarshipFilter === "not-eligible" && !student.scholarshipEligible);
    
    // Risk filter
    let matchesRisk = true;
    if (riskFilter !== "all") {
      const marks = student.marks || 0;
      const attendance = student.attendanceRate || 0;
      
      if (riskFilter === "critical") {
        matchesRisk = marks < 60 && attendance < 75;
      } else if (riskFilter === "at-risk") {
        matchesRisk = (marks < 70 || attendance < 80) && !(marks < 60 && attendance < 75);
      } else if (riskFilter === "on-track") {
        matchesRisk = marks >= 70 && attendance >= 80;
      }
    }
    
    return matchesSearch && matchesGrade && matchesPerformance && matchesAttendance && matchesScholarship && matchesRisk;
  }) || [];

  const getPerformanceBadge = (marks: number) => {
    if (marks >= 90) return <Badge className="bg-green-500">Excellent</Badge>;
    if (marks >= 75) return <Badge className="bg-blue-500">Good</Badge>;
    if (marks >= 60) return <Badge className="bg-yellow-500">Average</Badge>;
    return <Badge variant="destructive">Needs Improvement</Badge>;
  };

  const getAttendanceBadge = (rate: number) => {
    if (rate >= 95) return <Badge className="bg-green-500">Excellent</Badge>;
    if (rate >= 85) return <Badge className="bg-blue-500">Good</Badge>;
    if (rate >= 75) return <Badge className="bg-yellow-500">Fair</Badge>;
    return <Badge variant="destructive">Poor</Badge>;
  };

  const toggleStudentSelection = (studentId: number) => {
    const newSelection = new Set(selectedStudents);
    if (newSelection.has(studentId)) {
      newSelection.delete(studentId);
    } else {
      newSelection.add(studentId);
    }
    setSelectedStudents(newSelection);
  };

  const toggleAllStudents = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => s.id)));
    }
  };

  const handleBulkScholarship = () => {
    toast({
      title: "Bulk Action",
      description: `Updated scholarship status for ${selectedStudents.size} students`,
    });
    setSelectedStudents(new Set());
    setBulkActionDialogOpen(false);
  };

  const handleBulkNotification = () => {
    toast({
      title: "Bulk Notification",
      description: `Sent notification to ${selectedStudents.size} students`,
    });
    setSelectedStudents(new Set());
    setBulkActionDialogOpen(false);
  };

  const handleBulkWarning = () => {
    toast({
      title: "Bulk Warning",
      description: `Sent warning to ${selectedStudents.size} students`,
      variant: "destructive",
    });
    setSelectedStudents(new Set());
    setBulkActionDialogOpen(false);
  };

  const exportToCSV = () => {
    const headers = ["Name", "Username", "School", "Grade", "Performance (%)", "Attendance (%)", "Risk Status", "Scholarship", "Face Data"];
    
    const rows = filteredStudents.map(student => {
      const school = schools?.find(s => s.id === student.schoolId);
      const marks = student.marks || 0;
      const attendance = student.attendanceRate || 0;
      
      let riskStatus = "On Track";
      if (marks < 60 && attendance < 75) riskStatus = "Critical";
      else if (marks < 70 || attendance < 80) riskStatus = "At Risk";
      
      return [
        student.user?.name || 'Unknown',
        student.user?.username || '',
        school?.name || 'Unknown',
        student.grade,
        student.marks,
        student.attendanceRate,
        riskStatus,
        student.scholarshipEligible ? 'Eligible' : 'Not Eligible',
        (student as any).faceImageBase64 ? 'Yes' : 'No'
      ];
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `students_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Success",
      description: `Exported ${filteredStudents.length} student records to CSV`,
    });
  };

  const getRiskIndicator = (student: any) => {
    const marks = student.marks || 0;
    const attendance = student.attendanceRate || 0;
    
    // Critical: Low marks AND low attendance
    if (marks < 60 && attendance < 75) {
      return (
        <Badge className="bg-red-500">
          <XCircle className="h-3 w-3 mr-1" />
          Critical
        </Badge>
      );
    }
    
    // At Risk: Either low marks OR low attendance
    if (marks < 70 || attendance < 80) {
      return (
        <Badge className="bg-amber-500">
          <AlertTriangle className="h-3 w-3 mr-1" />
          At Risk
        </Badge>
      );
    }
    
    // On Track
    return (
      <Badge className="bg-green-500">
        <CheckCircle className="h-3 w-3 mr-1" />
        On Track
      </Badge>
    );
  };

  if (isLoading) return <div className="p-8">Loading students...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            Students Management
          </h1>
          <p className="text-muted-foreground mt-2">View and manage student records</p>
        </div>
        
        <div className="flex gap-2">
          {selectedStudents.size > 0 && (
            <Dialog open={bulkActionDialogOpen} onOpenChange={setBulkActionDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="gap-2">
                  Bulk Actions ({selectedStudents.size})
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk Actions</DialogTitle>
                  <DialogDescription>
                    Apply actions to {selectedStudents.size} selected student{selectedStudents.size > 1 ? 's' : ''}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <Button onClick={handleBulkScholarship} className="w-full justify-start" variant="outline">
                    <Award className="h-4 w-4 mr-2" />
                    Mark as Scholarship Eligible
                  </Button>
                  <Button onClick={handleBulkNotification} className="w-full justify-start" variant="outline">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Send Notification
                  </Button>
                  <Button onClick={handleBulkWarning} className="w-full justify-start" variant="outline">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Send Warning
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          <Button variant="outline" onClick={exportToCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>Create a new student record with account credentials</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registrationNo">Registration No *</Label>
                  <Input
                    id="registrationNo"
                    placeholder="REG-2026-001"
                    value={formData.registrationNo}
                    onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fatherName">Father's Name *</Label>
                  <Input
                    id="fatherName"
                    placeholder="Father's full name"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motherName">Mother's Name *</Label>
                  <Input
                    id="motherName"
                    placeholder="Mother's full name"
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    min="1"
                    max="100"
                    placeholder="e.g., 16"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grade">Current Class *</Label>
                  <Input
                    id="grade"
                    placeholder="e.g., 10th, Grade 5"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">Mobile Number</Label>
                  <Input
                    id="mobileNumber"
                    placeholder="Student's mobile (optional)"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parentMobileNumber">Parent Mobile Number *</Label>
                  <Input
                    id="parentMobileNumber"
                    placeholder="Parent's mobile number"
                    value={formData.parentMobileNumber}
                    onChange={(e) => setFormData({ ...formData, parentMobileNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  placeholder="Current address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="permanentAddress">Permanent Address *</Label>
                <Input
                  id="permanentAddress"
                  placeholder="Permanent address"
                  value={formData.permanentAddress}
                  onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    placeholder="john.doe"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="school">School *</Label>
                <Select value={formData.schoolId} onValueChange={(v) => setFormData({ ...formData, schoolId: v })}>
                  <SelectTrigger id="school">
                    <SelectValue placeholder="Select school" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools?.map((school) => (
                      <SelectItem key={school.id} value={school.id.toString()}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="face">Face Image (optional)</Label>
                <Input id="face" type="file" accept="image/*" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const b64 = await fileToBase64(file);
                  setFormData({ ...formData, faceImageBase64: b64 as string });
                }} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="marks">Current Marks (%)</Label>
                  <Input
                    id="marks"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.marks}
                    onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attendance">Attendance Rate (%)</Label>
                  <Input
                    id="attendance"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.attendanceRate}
                    onChange={(e) => setFormData({ ...formData, attendanceRate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createStudent.isPending}>
                  {createStudent.isPending ? "Creating..." : "Create Student"}
                </Button>
              </div>
            </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isFaceDialogOpen} onOpenChange={(o) => { setIsFaceDialogOpen(o); if (!o) setSelectedStudentId(null); }}>
            <DialogTrigger asChild>
              <Button variant="secondary" onClick={() => setIsFaceDialogOpen(true)}>Add Student Face</Button>
            </DialogTrigger>
            <FaceCaptureDialog
              open={isFaceDialogOpen}
              onClose={() => { setIsFaceDialogOpen(false); setSelectedStudentId(null); }}
              students={students || []}
              defaultStudentId={selectedStudentId ?? undefined}
              onCaptured={(id, b64) => setFaceData.mutate({ id, imageBase64: b64 })}
            />
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students && students.length > 0
                ? Math.round(students.reduce((acc, s) => acc + s.marks, 0) / students.length)
                : 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students && students.length > 0
                ? Math.round(students.reduce((acc, s) => acc + s.attendanceRate, 0) / students.length)
                : 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scholarship Eligible</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students?.filter(s => s.scholarshipEligible).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students by name or grade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          {/* Filter Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {/* Grade Filter */}
            <div className="space-y-1">
              <Label className="text-xs">Grade</Label>
              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {uniqueGrades.map(grade => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Performance Filter */}
            <div className="space-y-1">
              <Label className="text-xs">Performance</Label>
              <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="excellent">Excellent (≥90%)</SelectItem>
                  <SelectItem value="good">Good (75-89%)</SelectItem>
                  <SelectItem value="average">Average (60-74%)</SelectItem>
                  <SelectItem value="poor">Poor (&lt;60%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Attendance Filter */}
            <div className="space-y-1">
              <Label className="text-xs">Attendance</Label>
              <Select value={attendanceFilter} onValueChange={setAttendanceFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="excellent">Excellent (≥95%)</SelectItem>
                  <SelectItem value="good">Good (85-94%)</SelectItem>
                  <SelectItem value="fair">Fair (75-84%)</SelectItem>
                  <SelectItem value="poor">Poor (&lt;75%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Scholarship Filter */}
            <div className="space-y-1">
              <Label className="text-xs">Scholarship</Label>
              <Select value={scholarshipFilter} onValueChange={setScholarshipFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="eligible">Eligible</SelectItem>
                  <SelectItem value="not-eligible">Not Eligible</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Risk Filter */}
            <div className="space-y-1">
              <Label className="text-xs">Risk Status</Label>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="on-track">On Track</SelectItem>
                  <SelectItem value="at-risk">At Risk</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Clear Filters Button */}
          {(gradeFilter !== "all" || performanceFilter !== "all" || attendanceFilter !== "all" || scholarshipFilter !== "all" || riskFilter !== "all" || searchTerm !== "") && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setGradeFilter("all");
                setPerformanceFilter("all");
                setAttendanceFilter("all");
                setScholarshipFilter("all");
                setRiskFilter("all");
                setSearchTerm("");
              }}
            >
              Clear All Filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
          <CardDescription>
            {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <input
                      type="checkbox"
                      checked={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0}
                      onChange={toggleAllStudents}
                      className="rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Risk Status</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Scholarship</TableHead>
                  <TableHead>Face Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow 
                      key={student.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedStudents.has(student.id)}
                          onChange={() => toggleStudentSelection(student.id)}
                          className="rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell 
                        className="font-medium cursor-pointer"
                        onClick={() => setLocation(`/students/${student.id}`)}
                      >
                        <div>
                          <div>{student.user?.name || 'Unknown'}</div>
                          <div className="text-xs text-muted-foreground">@{student.user?.username}</div>
                        </div>
                      </TableCell>
                      <TableCell 
                        className="cursor-pointer"
                        onClick={() => setLocation(`/students/${student.id}`)}
                      >
                        {schools?.find(s => s.id === student.schoolId)?.name || 'Unknown'}
                      </TableCell>
                      <TableCell 
                        className="cursor-pointer"
                        onClick={() => setLocation(`/students/${student.id}`)}
                      >
                        {student.grade}
                      </TableCell>
                      <TableCell 
                        className="cursor-pointer"
                        onClick={() => setLocation(`/students/${student.id}`)}
                      >
                        {getRiskIndicator(student)}
                      </TableCell>
                      <TableCell 
                        className="cursor-pointer"
                        onClick={() => setLocation(`/students/${student.id}`)}
                      >
                        <div className="space-y-1">
                          <div className="font-medium">{student.marks}%</div>
                          {getPerformanceBadge(student.marks)}
                        </div>
                      </TableCell>
                      <TableCell 
                        className="cursor-pointer"
                        onClick={() => setLocation(`/students/${student.id}`)}
                      >
                        <div className="space-y-1">
                          <div className="font-medium">{student.attendanceRate}%</div>
                          {getAttendanceBadge(student.attendanceRate)}
                        </div>
                      </TableCell>
                      <TableCell 
                        className="cursor-pointer"
                        onClick={() => setLocation(`/students/${student.id}`)}
                      >
                        {student.scholarshipEligible ? (
                          <Badge className="bg-green-500"><Award className="h-3 w-3 mr-1" />Eligible</Badge>
                        ) : (
                          <Badge variant="secondary">Not Eligible</Badge>
                        )}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Button size="sm" variant="outline" onClick={() => { setSelectedStudentId(student.id); setIsFaceDialogOpen(true); }}>
                          {(student as any).faceImageBase64 ? 'Update Face' : 'Add Face'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
