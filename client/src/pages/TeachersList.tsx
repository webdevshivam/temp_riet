import { useState } from "react";
import { useTeachers, useCreateTeacher, useUpdateTeacher, useDeleteTeacher, useSetTeacherFaceData } from "@/hooks/use-teachers";
import { useSchools } from "@/hooks/use-schools";
import { useStudents } from "@/hooks/use-students";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Users, Plus, Search, BookOpen, School as SchoolIcon, Pencil, Trash2, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function EditTeacherForm({ teacher, subjects, availableGrades, isPending, onSubmit, onCancel }: {
  teacher: any;
  subjects: string[];
  availableGrades: string[];
  isPending: boolean;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [subject, setSubject] = useState(teacher.subject);
  const [classes, setClasses] = useState<string[]>(teacher.assignedClasses || []);

  const toggle = (grade: string) => {
    setClasses(prev => prev.includes(grade) ? prev.filter(c => c !== grade) : [...prev, grade]);
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ subject, assignedClasses: classes }); }} className="space-y-4">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input value={teacher.user?.name || ''} disabled />
      </div>
      <div className="space-y-2">
        <Label>Subject</Label>
        <Select value={subject} onValueChange={setSubject}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Assigned Classes</Label>
        <div className="flex flex-wrap gap-2 border rounded-md p-3">
          {availableGrades.length === 0 ? (
            <span className="text-sm text-muted-foreground">No classes available</span>
          ) : (
            availableGrades.map(grade => (
              <label key={grade} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={classes.includes(grade)}
                  onChange={() => toggle(grade)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{grade}</span>
              </label>
            ))
          )}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isPending}>{isPending ? "Updating..." : "Update"}</Button>
      </div>
    </form>
  );
}

function fileToBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function FaceCaptureDialog({ open, onClose, teachers, defaultTeacherId, onCaptured }: {
  open: boolean;
  onClose: () => void;
  teachers: any[];
  defaultTeacherId?: number;
  onCaptured: (id: number, b64: string) => void;
}) {
  const [teacherId, setTeacherId] = useState<number | undefined>(defaultTeacherId);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Start camera when dialog opens
  if (open && !stream && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true }).then((s) => {
      setStream(s);
      const video = document.getElementById('teacher-face-video') as HTMLVideoElement | null;
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
    if (!teacherId) return;
    const video = document.getElementById('teacher-face-video') as HTMLVideoElement | null;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const b64 = dataUrl.split(',')[1];
    onCaptured(teacherId, b64);
    onClose();
  };

  return (
    <DialogContent className="max-w-xl">
      <DialogHeader>
        <DialogTitle>Add Teacher Face</DialogTitle>
        <DialogDescription>Capture face image for attendance verification</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label>Select Teacher</Label>
          <Select value={String(teacherId ?? '') === '' ? '__select__' : String(teacherId)} onValueChange={(v) => setTeacherId(v === '__select__' ? undefined : Number(v))}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a teacher" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__select__">Select…</SelectItem>
              {teachers.map((t) => (
                <SelectItem key={t.id} value={String(t.id)}>
                  {t.user?.name || `Teacher ${t.id}`} - {t.subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-md overflow-hidden border bg-black">
          <video id="teacher-face-video" className="w-full h-64 object-cover" autoPlay playsInline muted />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={!teacherId} onClick={capture}>Capture & Save</Button>
        </div>
        <div className="text-xs text-muted-foreground">Ensure good lighting and face the camera directly for best results.</div>
      </div>
    </DialogContent>
  );
}

export default function TeachersList() {
  const { data: teachers, isLoading } = useTeachers();
  const { data: schools } = useSchools();
  const { data: students } = useStudents();

  // Get unique grades from students for class assignment
  const availableGrades = Array.from(new Set(students?.map(s => s.grade) || [])).sort();
  const createTeacher = useCreateTeacher();
  const updateTeacher = useUpdateTeacher();
  const deleteTeacher = useDeleteTeacher();
  const setFaceData = useSetTeacherFaceData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFaceDialogOpen, setIsFaceDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "password",
    schoolId: "",
    subject: "",
    assignedClasses: [] as string[],
  });

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.username || !formData.schoolId || !formData.subject) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createTeacher.mutate({
      userId: 0, // Will be created
      schoolId: parseInt(formData.schoolId),
      subject: formData.subject,
      assignedClasses: formData.assignedClasses,
      user: {
        name: formData.name,
        username: formData.username,
        password: formData.password,
        schoolId: parseInt(formData.schoolId),
      },
    } as any, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Teacher created successfully",
        });
        setIsDialogOpen(false);
        setFormData({
          name: "",
          username: "",
          password: "password",
          schoolId: "",
          subject: "",
          assignedClasses: [],
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to create teacher",
          variant: "destructive",
        });
      },
    });
  };

  const filteredTeachers = teachers?.filter((teacher) =>
    teacher.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.subject.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const toggleClass = (grade: string) => {
    setFormData(prev => ({
      ...prev,
      assignedClasses: prev.assignedClasses.includes(grade)
        ? prev.assignedClasses.filter(c => c !== grade)
        : [...prev.assignedClasses, grade],
    }));
  };

  // Subject list
  const subjects = ["Mathematics", "Science", "English", "History", "Geography", "Physics", "Chemistry", "Biology", "Computer Science", "Physical Education"];

  if (isLoading) return <div className="p-8">Loading teachers...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Staff Management
          </h1>
          <p className="text-muted-foreground mt-2">View and manage teaching staff</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Teacher
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Teacher</DialogTitle>
              <DialogDescription>Create a new teacher record with account credentials</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTeacher} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Jane Smith"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    placeholder="jane.smith"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="subject">Subject *</Label>
                  <Select value={formData.subject} onValueChange={(v) => setFormData({ ...formData, subject: v })}>
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Assign Classes</Label>
                <div className="flex flex-wrap gap-2 border rounded-md p-3">
                  {availableGrades.length === 0 ? (
                    <span className="text-sm text-muted-foreground">No classes available (add students first)</span>
                  ) : (
                    availableGrades.map(grade => (
                      <label key={grade} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.assignedClasses.includes(grade)}
                          onChange={() => toggleClass(grade)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{grade}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTeacher.isPending}>
                  {createTeacher.isPending ? "Creating..." : "Create Teacher"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teachers?.reduce((acc, t) => acc + (t.assignedClasses?.length || 0), 0) || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Classes/Teacher</CardTitle>
            <BookOpen className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teachers && teachers.length > 0
                ? (teachers.reduce((acc, t) => acc + (t.assignedClasses?.length || 0), 0) / teachers.length).toFixed(1)
                : 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Schools Covered</CardTitle>
            <SchoolIcon className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(teachers?.map(t => t.schoolId)).size || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teachers by name or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Teachers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Teachers</CardTitle>
          <CardDescription>
            {filteredTeachers.length} teacher{filteredTeachers.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Assigned Classes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No teachers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{teacher.user?.name || 'Unknown'}</div>
                          <div className="text-xs text-muted-foreground">@{teacher.user?.username}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {schools?.find(s => s.id === teacher.schoolId)?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{teacher.subject}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(teacher.assignedClasses?.length || 0) > 0 ? (
                            (teacher.assignedClasses || []).map(c => (
                              <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">None</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedTeacher(teacher); setIsEditDialogOpen(true); }}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedTeacher(teacher); setIsFaceDialogOpen(true); }}>
                            <Camera className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedTeacher(teacher); setIsDeleteDialogOpen(true); }}>
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Teacher Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(o) => { setIsEditDialogOpen(o); if (!o) setSelectedTeacher(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Teacher</DialogTitle>
            <DialogDescription>Update teacher information</DialogDescription>
          </DialogHeader>
          {selectedTeacher && <EditTeacherForm
            teacher={selectedTeacher}
            subjects={subjects}
            availableGrades={availableGrades}
            isPending={updateTeacher.isPending}
            onSubmit={(data) => {
              updateTeacher.mutate({ id: selectedTeacher.id, data }, {
                onSuccess: () => {
                  toast({ title: "Success", description: "Teacher updated successfully" });
                  setIsEditDialogOpen(false);
                  setSelectedTeacher(null);
                },
                onError: (error: Error) => {
                  toast({ title: "Error", description: error.message, variant: "destructive" });
                },
              });
            }}
            onCancel={() => { setIsEditDialogOpen(false); setSelectedTeacher(null); }}
          />}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedTeacher?.user?.name} and their associated user account. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedTeacher(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                if (!selectedTeacher) return;
                deleteTeacher.mutate(selectedTeacher.id, {
                  onSuccess: () => {
                    toast({ title: "Success", description: "Teacher deleted successfully" });
                    setIsDeleteDialogOpen(false);
                    setSelectedTeacher(null);
                  },
                  onError: (error: Error) => {
                    toast({ title: "Error", description: error.message, variant: "destructive" });
                  },
                });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Face Capture Dialog */}
      <Dialog open={isFaceDialogOpen} onOpenChange={(o) => { setIsFaceDialogOpen(o); if (!o) setSelectedTeacher(null); }}>
        <FaceCaptureDialog
          open={isFaceDialogOpen}
          onClose={() => { setIsFaceDialogOpen(false); setSelectedTeacher(null); }}
          teachers={teachers || []}
          defaultTeacherId={selectedTeacher?.id}
          onCaptured={(id, b64) => {
            setFaceData.mutate({ id, imageBase64: b64 }, {
              onSuccess: () => {
                toast({ title: "Success", description: "Face data saved successfully" });
              },
              onError: (error: Error) => {
                toast({ title: "Error", description: error.message, variant: "destructive" });
              },
            });
          }}
        />
      </Dialog>
    </div>
  );
}
