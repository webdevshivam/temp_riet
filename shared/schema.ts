import { z } from "zod";

const roleSchema = z.enum(["gov_admin", "school_admin", "teacher", "student"]);
const attendanceStatusSchema = z.enum(["present", "absent", "late"]);
const complaintTypeSchema = z.enum(["harassment", "infrastructure", "academic", "other"]);
const complaintStatusSchema = z.enum(["pending", "resolved"]);

export type User = {
  id: number;
  username: string;
  password: string;
  role: z.infer<typeof roleSchema>;
  schoolId?: number | null;
  name: string;
  avatarUrl?: string | null;
};

export type School = {
  id: number;
  name: string;
  location: string;
  district?: string | null;
  performanceScore: number;
  teacherShortage: boolean;
  shortageDetails?: { subject: string; count: number }[] | null;
};

const genderSchema = z.enum(["male", "female", "other"]);

export type Student = {
  id: number;
  userId: number;
  schoolId: number;
  registrationNo: string;
  fatherName: string;
  motherName: string;
  mobileNumber?: string | null;
  address: string;
  permanentAddress: string;
  gender: z.infer<typeof genderSchema>;
  age: number;
  parentMobileNumber: string;
  grade: string;
  attendanceRate: number;
  marks: number;
  scholarshipEligible: boolean;
  aiPerformanceSummary?: string | null;
  faceImageBase64?: string | null;
};

export type Teacher = {
  id: number;
  userId: number;
  schoolId: number;
  subject: string;
  assignedClasses: string[];
  faceImageBase64?: string | null;
};

export type Attendance = {
  id: number;
  studentId: number;
  date: Date;
  status: z.infer<typeof attendanceStatusSchema>;
  faceVerified: boolean;
  markedByTeacherId?: number | null;
};

export type Complaint = {
  id: number;
  schoolId?: number | null;
  studentId?: number | null;
  title: string;
  content: string;
  isAnonymous: boolean;
  aiClassification?: z.infer<typeof complaintTypeSchema> | null;
  status: z.infer<typeof complaintStatusSchema>;
  createdAt: Date;
};

export type Course = {
  id: number;
  title: string;
  description: string;
  thumbnailUrl?: string | null;
  videoUrl?: string | null;
};

export type BlockchainResult = {
  id: number;
  studentId: number;
  term: string;
  reportHash: string;
  isVerified: boolean;
  aiExplanation?: string | null;
  createdAt: Date;
};

// Scholarship rules
export type ScholarshipRule = {
  id: number;
  minMarks: number;
  minAttendance: number;
  districtsOverride?: { district: string; minMarks?: number; minAttendance?: number }[] | null;
  updatedAt: Date;
};

export const scholarshipRuleSchema = z.object({
  id: z.number(),
  minMarks: z.number().min(0).max(100),
  minAttendance: z.number().min(0).max(100),
  districtsOverride: z
    .array(
      z.object({
        district: z.string(),
        minMarks: z.number().min(0).max(100).optional(),
        minAttendance: z.number().min(0).max(100).optional(),
      }),
    )
    .optional(),
  updatedAt: z.coerce.date(),
});

export const updateScholarshipRuleSchema = scholarshipRuleSchema
  .omit({ id: true, updatedAt: true })
  .partial()
  .extend({
    minMarks: z.number().min(0).max(100).optional(),
    minAttendance: z.number().min(0).max(100).optional(),
  });

export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
  role: roleSchema,
  schoolId: z.number().optional(),
  name: z.string(),
  avatarUrl: z.string().optional(),
});

export const insertSchoolSchema = z.object({
  name: z.string(),
  location: z.string(),
  district: z.string().optional(),
  performanceScore: z.number().optional(),
  teacherShortage: z.boolean().optional(),
  shortageDetails: z.array(z.object({ subject: z.string(), count: z.number() })).optional(),
});

export const insertStudentSchema = z.object({
  userId: z.number(),
  schoolId: z.number(),
  registrationNo: z.string(),
  fatherName: z.string(),
  motherName: z.string(),
  mobileNumber: z.string().optional(),
  address: z.string(),
  permanentAddress: z.string(),
  gender: genderSchema,
  age: z.number().min(1).max(100),
  parentMobileNumber: z.string(),
  grade: z.string(),
  attendanceRate: z.number().optional(),
  marks: z.number().optional(),
  scholarshipEligible: z.boolean().optional(),
  aiPerformanceSummary: z.string().optional(),
  faceImageBase64: z.string().optional(),
});

export const insertTeacherSchema = z.object({
  userId: z.number(),
  schoolId: z.number(),
  subject: z.string(),
  assignedClasses: z.array(z.string()).optional(),
  faceImageBase64: z.string().optional(),
});

export const insertAttendanceSchema = z.object({
  studentId: z.number(),
  status: attendanceStatusSchema,
  faceVerified: z.boolean().optional(),
  markedByTeacherId: z.number().optional(),
});

export const insertComplaintSchema = z.object({
  schoolId: z.number().optional(),
  studentId: z.number().optional(),
  title: z.string(),
  content: z.string(),
  isAnonymous: z.boolean().optional(),
  aiClassification: complaintTypeSchema.optional(),
});

export const insertCourseSchema = z.object({
  title: z.string(),
  description: z.string(),
  thumbnailUrl: z.string().optional(),
  videoUrl: z.string().optional(),
});

export const insertBlockchainResultSchema = z.object({
  studentId: z.number(),
  term: z.string(),
  reportHash: z.string(),
  isVerified: z.boolean().optional(),
  aiExplanation: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSchool = z.infer<typeof insertSchoolSchema>;
export const updateSchoolSchema = insertSchoolSchema.partial();
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertBlockchainResult = z.infer<typeof insertBlockchainResultSchema>;

// Auth requests
export const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});
