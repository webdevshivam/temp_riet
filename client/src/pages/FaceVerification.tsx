import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, XCircle, User, Camera, ShieldCheck, Info } from "lucide-react";
import { useFaceVerify } from "@/hooks/use-attendance";
import { useStudents } from "@/hooks/use-students";
import { useToast } from "@/hooks/use-toast";
import { FaceCapture } from "@/components/FaceCapture";

export default function FaceVerification() {
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [showCapture, setShowCapture] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    studentName?: string;
    confidence?: number;
  } | null>(null);
  
  const { data: students } = useStudents();
  const { mutate: verify, isPending } = useFaceVerify();
  const { toast } = useToast();

  const handleCapture = (imageBase64: string) => {
    if (!selectedStudentId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a student first.",
      });
      return;
    }

    verify({ imageBase64, studentId: selectedStudentId }, {
      onSuccess: (data: any) => {
        setShowCapture(false);
        setVerificationResult({
          success: data.success,
          studentName: data.studentName,
          confidence: data.matchConfidence
        });

        if (data.success) {
          toast({
            title: "Attendance Verified",
            description: `${data.studentName} verified with ${data.matchConfidence}% confidence.`,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Verification Failed",
            description: "Face does not match. Please try again.",
          });
        }
      },
      onError: (error: Error) => {
        setShowCapture(false);
        toast({
          variant: "destructive",
          title: "Verification Error",
          description: error.message || "An error occurred during verification.",
        });
      }
    });
  };

  const studentsWithFaces = students?.filter(s => (s as any).faceImageBase64) || [];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-display flex items-center justify-center gap-3 text-orange-600 dark:text-orange-400">
          <Camera className="h-8 w-8" />
          Smart Attendance
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">AI-Powered Face Verification System</p>
      </div>

      {/* Info Alert */}
      <div className="mb-6 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900 dark:text-blue-100">
            <p className="font-semibold mb-1">How Face Verification Works:</p>
            <ul className="space-y-1 text-blue-800 dark:text-blue-200">
              <li>1. Select a student from the dropdown below</li>
              <li>2. Click "Start Face Verification" to capture their face</li>
              <li>3. The system compares the captured image with stored face data</li>
              <li>4. If verified, attendance is automatically recorded</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Student Selection */}
      <Card className="mb-6 warm-shadow border-orange-100/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-orange-500" />
            Select Student
          </CardTitle>
          <CardDescription>Choose a student to verify their attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="student-select">Student</Label>
              <Select 
                value={selectedStudentId?.toString() || ''} 
                onValueChange={(v) => setSelectedStudentId(v ? Number(v) : null)}
              >
                <SelectTrigger id="student-select">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {studentsWithFaces.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No students with face data registered
                    </SelectItem>
                  ) : (
                    studentsWithFaces.map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.user?.name || 'Unknown'} - {student.grade}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <Button
              size="lg"
              className="w-full gap-2"
              onClick={() => setShowCapture(true)}
              disabled={!selectedStudentId || isPending}
            >
              <Camera className="h-4 w-4" />
              Start Face Verification
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Verification Result */}
      {verificationResult && (
        <Card className={`mb-6 border-2 shadow-xl ${
          verificationResult.success 
            ? 'border-green-500 bg-green-50 dark:bg-green-950/50' 
            : 'border-red-500 bg-red-50 dark:bg-red-950/50'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              {verificationResult.success ? (
                <CheckCircle className="h-12 w-12 text-green-600" />
              ) : (
                <XCircle className="h-12 w-12 text-red-600" />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold">
                  {verificationResult.success ? 'Verification Successful' : 'Verification Failed'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {verificationResult.success 
                    ? `${verificationResult.studentName} verified with ${verificationResult.confidence}% confidence`
                    : 'Face does not match the selected student'}
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setVerificationResult(null)}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="stat-card from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <User className="h-4 w-4 text-blue-600" />
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{students?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="stat-card from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/20 border-green-200/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-green-900 dark:text-green-100">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              With Face Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{studentsWithFaces.length}</div>
          </CardContent>
        </Card>
        <Card className="stat-card col-span-2 md:col-span-1 from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-orange-900 dark:text-orange-100">Enrollment Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {students && students.length > 0
                ? Math.round((studentsWithFaces.length / students.length) * 100)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validation Info */}
      <Card className="mt-6 bg-orange-50/50 dark:bg-orange-950/20 border-orange-200/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-orange-500" />
            Face Validation Process
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p><strong>Where validation happens:</strong> Face comparison occurs on the server-side for security.</p>
          <p><strong>Validation steps:</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Captured image is validated (format, size, quality)</li>
            <li>Image is sent securely to the server</li>
            <li>Server compares with stored face data using recognition algorithm</li>
            <li>Match confidence score is calculated (threshold: 75%)</li>
            <li>If verified, attendance record is created automatically</li>
          </ol>
          <p className="mt-3 text-xs italic">Note: Current implementation uses a simplified algorithm. For production, integrate AWS Rekognition, Azure Face API, or similar services. See <code className="bg-orange-100 dark:bg-orange-900 px-1 py-0.5 rounded">FACE_RECOGNITION_GUIDE.md</code> for details.</p>
        </CardContent>
      </Card>

      {/* Face Capture Dialog */}
      <Dialog open={showCapture} onOpenChange={setShowCapture}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Face Verification</DialogTitle>
            <DialogDescription>
              Position your face in the center and ensure good lighting
            </DialogDescription>
          </DialogHeader>
          <FaceCapture
            onCapture={handleCapture}
            onCancel={() => setShowCapture(false)}
            showPreview={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
