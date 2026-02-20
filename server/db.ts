import mongoose, { Schema } from "mongoose";

const defaultMongoUri =
  "mongodb+srv://webdevshivamkushwah_db_user:6KGNccolXGJiq7cu@cluster0.s4bp7ob.mongodb.net/?appName=Cluster0";
const mongoUri = process.env.MONGODB_URI || defaultMongoUri;
const mongoDbName = process.env.MONGODB_DB || "riet";

let isConnecting = false;

export async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) return;
  if (isConnecting) return;

  isConnecting = true;
  try {
    await mongoose.connect(mongoUri, { dbName: mongoDbName });
  } finally {
    isConnecting = false;
  }
}

const userSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    username: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["gov_admin", "school_admin", "teacher", "student"],
      required: true,
    },
    schoolId: { type: Number, default: null },
    name: { type: String, required: true },
    avatarUrl: { type: String, default: null },
  },
  { versionKey: false },
);

const schoolSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true },
    location: { type: String, required: true },
    district: { type: String, default: null },
    performanceScore: { type: Number, default: 0 },
    teacherShortage: { type: Boolean, default: false },
    shortageDetails: {
      type: [{ subject: { type: String, required: true }, count: { type: Number, required: true } }],
      default: [],
    },
  },
  { versionKey: false },
);

const studentSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    userId: { type: Number, required: true, index: true },
    schoolId: { type: Number, required: true, index: true },
    registrationNo: { type: String, required: true },
    fatherName: { type: String, required: true },
    motherName: { type: String, required: true },
    mobileNumber: { type: String, default: null },
    address: { type: String, required: true },
    permanentAddress: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    age: { type: Number, required: true },
    parentMobileNumber: { type: String, required: true },
    grade: { type: String, required: true },
    attendanceRate: { type: Number, default: 100 },
    marks: { type: Number, default: 0 },
    scholarshipEligible: { type: Boolean, default: false },
    aiPerformanceSummary: { type: String, default: null },
    faceImageBase64: { type: String, default: null },
  },
  { versionKey: false },
);

const teacherSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    userId: { type: Number, required: true, index: true },
    schoolId: { type: Number, required: true, index: true },
    subject: { type: String, required: true },
    assignedClasses: { type: [String], default: [] },
  },
  { versionKey: false },
);

const attendanceSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    studentId: { type: Number, required: true, index: true },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ["present", "absent", "late"], required: true },
    faceVerified: { type: Boolean, default: false },
    markedByTeacherId: { type: Number, default: null },
  },
  { versionKey: false },
);

const complaintSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    schoolId: { type: Number, default: null, index: true },
    studentId: { type: Number, default: null, index: true },
    createdByUserId: { type: Number, default: null, index: true },
    createdByRole: {
      type: String,
      enum: ["gov_admin", "school_admin", "teacher", "student"],
      default: null,
      index: true,
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    isAnonymous: { type: Boolean, default: false },
    aiClassification: {
      type: String,
      enum: ["harassment", "infrastructure", "academic", "other"],
      default: null,
    },
    status: { type: String, enum: ["pending", "resolved"], default: "pending" },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

const courseSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    thumbnailUrl: { type: String, default: null },
    videoUrl: { type: String, default: null },
  },
  { versionKey: false },
);

const blockchainResultSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    studentId: { type: Number, required: true, index: true },
    term: { type: String, required: true },
    reportHash: { type: String, required: true, unique: true, index: true },
    isVerified: { type: Boolean, default: true },
    aiExplanation: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

export const UserModel = mongoose.models.User || mongoose.model("User", userSchema);
export const SchoolModel = mongoose.models.School || mongoose.model("School", schoolSchema);
export const StudentModel = mongoose.models.Student || mongoose.model("Student", studentSchema);
export const TeacherModel = mongoose.models.Teacher || mongoose.model("Teacher", teacherSchema);
export const AttendanceModel =
  mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);
export const ComplaintModel =
  mongoose.models.Complaint || mongoose.model("Complaint", complaintSchema);
export const CourseModel = mongoose.models.Course || mongoose.model("Course", courseSchema);
export const BlockchainResultModel =
  mongoose.models.BlockchainResult || mongoose.model("BlockchainResult", blockchainResultSchema);

const scholarshipRuleSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    minMarks: { type: Number, required: true },
    minAttendance: { type: Number, required: true },
    districtsOverride: {
      type: [{ district: { type: String, required: true }, minMarks: { type: Number }, minAttendance: { type: Number } }],
      default: [],
    },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

export const ScholarshipRuleModel = mongoose.models.ScholarshipRule || mongoose.model("ScholarshipRule", scholarshipRuleSchema);
