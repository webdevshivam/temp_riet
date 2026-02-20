import {
  type User,
  type InsertUser,
  type School,
  type InsertSchool,
  type Student,
  type InsertStudent,
  type Teacher,
  type InsertTeacher,
  type Attendance,
  type InsertAttendance,
  type Complaint,
  type InsertComplaint,
  type Course,
  type InsertCourse,
  type BlockchainResult,
  type InsertBlockchainResult,
} from "@shared/schema";
import {
  connectToDatabase,
  UserModel,
  SchoolModel,
  StudentModel,
  TeacherModel,
  AttendanceModel,
  ComplaintModel,
  CourseModel,
  BlockchainResultModel,
} from "./db";

function cleanDoc<T>(doc: any): T | undefined {
  if (!doc) return undefined;
  const { _id, __v, ...rest } = doc as Record<string, unknown>;
  return rest as T;
}

function cleanDocs<T>(docs: any[]): T[] {
  return docs.map((doc) => cleanDoc<T>(doc)).filter((doc): doc is T => !!doc);
}

async function nextId(model: any): Promise<number> {
  const last = await model.findOne().sort({ id: -1 }).select({ id: 1 }).lean();
  return (last?.id ?? 0) + 1;
}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getSchools(): Promise<School[]>;
  getSchool(id: number): Promise<School | undefined>;
  createSchool(school: InsertSchool): Promise<School>;

  getStudents(schoolId?: number): Promise<(Student & { user?: User })[]>;
  getStudent(id: number): Promise<(Student & { user?: User }) | undefined>;
  getStudentByUserId(userId: number): Promise<(Student & { user?: User }) | undefined>;
  updateStudentResult(
    id: number,
    patch: { marks: number; aiPerformanceSummary?: string; scholarshipEligible?: boolean },
  ): Promise<(Student & { user?: User }) | undefined>;
  createStudent(
    student: InsertStudent,
    user?: Omit<InsertUser, "role">,
  ): Promise<Student & { user?: User }>;

  getTeachers(schoolId?: number): Promise<(Teacher & { user?: User })[]>;
  createTeacher(
    teacher: InsertTeacher,
    user?: Omit<InsertUser, "role">,
  ): Promise<Teacher & { user?: User }>;

  getAttendance(studentId?: number, schoolId?: number): Promise<Attendance[]>;
  createAttendance(att: InsertAttendance): Promise<Attendance>;
  upsertTodayAttendance(att: InsertAttendance): Promise<Attendance>;

  getComplaints(): Promise<Complaint[]>;
  createComplaint(complaint: InsertComplaint): Promise<Complaint>;

  getCourses(): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;

  getBlockchainResults(studentId?: number): Promise<BlockchainResult[]>;
  createBlockchainResult(result: InsertBlockchainResult): Promise<BlockchainResult>;
  verifyBlockchainResult(hash: string): Promise<BlockchainResult | undefined>;
}

function dayRange(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    await connectToDatabase();
    const user = await UserModel.findOne({ id }).lean();
    return cleanDoc<User>(user);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    await connectToDatabase();
    const user = await UserModel.findOne({ username }).lean();
    return cleanDoc<User>(user);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    await connectToDatabase();
    const id = await nextId(UserModel);
    const created = await UserModel.create({
      id,
      ...insertUser,
      schoolId: insertUser.schoolId ?? null,
      avatarUrl: insertUser.avatarUrl ?? null,
    });
    return cleanDoc<User>(created.toObject()) as User;
  }

  async getSchools(): Promise<School[]> {
    await connectToDatabase();
    const docs = await SchoolModel.find().sort({ id: 1 }).lean();
    return cleanDocs<School>(docs);
  }

  async getSchool(id: number): Promise<School | undefined> {
    await connectToDatabase();
    const school = await SchoolModel.findOne({ id }).lean();
    return cleanDoc<School>(school);
  }

  async createSchool(insertSchool: InsertSchool): Promise<School> {
    await connectToDatabase();
    const id = await nextId(SchoolModel);
    const created = await SchoolModel.create({
      id,
      ...insertSchool,
      district: (insertSchool as any).district ?? null,
      performanceScore: insertSchool.performanceScore ?? 0,
      teacherShortage: insertSchool.teacherShortage ?? false,
      shortageDetails: insertSchool.shortageDetails ?? [],
    });
    return cleanDoc<School>(created.toObject()) as School;
  }

  async updateSchool(id: number, patch: Partial<InsertSchool>): Promise<School | undefined> {
    await connectToDatabase();
    const updated = await SchoolModel.findOneAndUpdate(
      { id },
      {
        ...(patch as any),
        district: (patch as any)?.district ?? undefined,
      },
      { new: true },
    ).lean();
    return cleanDoc<School>(updated);
  }

  async deleteSchool(id: number): Promise<boolean> {
    await connectToDatabase();
    const res = await SchoolModel.deleteOne({ id });
    return res.deletedCount === 1;
  }

  async getStudents(schoolId?: number): Promise<(Student & { user?: User })[]> {
    await connectToDatabase();
    const filter = schoolId ? { schoolId } : {};
    const studentDocs = await StudentModel.find(filter).sort({ id: 1 }).lean();
    const students = cleanDocs<Student>(studentDocs);

    const userIds = students.map((s) => s.userId);
    const users = cleanDocs<User>(await UserModel.find({ id: { $in: userIds } }).lean());
    const userMap = new Map(users.map((u) => [u.id, u]));

    return students.map((student) => ({
      ...student,
      user: userMap.get(student.userId),
    }));
  }

  async getStudent(id: number): Promise<(Student & { user?: User }) | undefined> {
    await connectToDatabase();
    const student = cleanDoc<Student>(await StudentModel.findOne({ id }).lean());
    if (!student) return undefined;
    const user = cleanDoc<User>(await UserModel.findOne({ id: student.userId }).lean());
    return { ...student, user };
  }

  async getStudentByUserId(userId: number): Promise<(Student & { user?: User }) | undefined> {
    await connectToDatabase();
    const student = cleanDoc<Student>(await StudentModel.findOne({ userId }).lean());
    if (!student) return undefined;
    const user = cleanDoc<User>(await UserModel.findOne({ id: student.userId }).lean());
    return { ...student, user };
  }

  async createStudent(
    insertStudent: InsertStudent,
    userParams?: Omit<InsertUser, "role">,
  ): Promise<Student & { user?: User }> {
    await connectToDatabase();

    let createdUser: User | undefined;
    if (userParams) {
      createdUser = await this.createUser({ ...userParams, role: "student" });
      insertStudent.userId = createdUser.id;
    }

    const id = await nextId(StudentModel);
    const created = await StudentModel.create({
      id,
      ...insertStudent,
      mobileNumber: insertStudent.mobileNumber ?? null,
      attendanceRate: insertStudent.attendanceRate ?? 100,
      marks: insertStudent.marks ?? 0,
      scholarshipEligible: insertStudent.scholarshipEligible ?? false,
      aiPerformanceSummary: insertStudent.aiPerformanceSummary ?? null,
      faceImageBase64: (insertStudent as any).faceImageBase64 ?? null,
    });
    const student = cleanDoc<Student>(created.toObject()) as Student;
    return { ...student, user: createdUser };
  }

  async updateStudentResult(
    id: number,
    patch: { marks: number; aiPerformanceSummary?: string; scholarshipEligible?: boolean },
  ): Promise<(Student & { user?: User }) | undefined> {
    await connectToDatabase();
    const updated = await StudentModel.findOneAndUpdate(
      { id },
      {
        $set: {
          marks: patch.marks,
          aiPerformanceSummary: patch.aiPerformanceSummary ?? null,
          ...(patch.scholarshipEligible !== undefined
            ? { scholarshipEligible: patch.scholarshipEligible }
            : {}),
        },
      },
      { new: true },
    ).lean();
    const student = cleanDoc<Student>(updated);
    if (!student) return undefined;
    const user = cleanDoc<User>(await UserModel.findOne({ id: student.userId }).lean());
    return { ...student, user };
  }

  async getTeachers(schoolId?: number): Promise<(Teacher & { user?: User })[]> {
    await connectToDatabase();
    const filter = schoolId ? { schoolId } : {};
    const teacherDocs = await TeacherModel.find(filter).sort({ id: 1 }).lean();
    const teachers = cleanDocs<Teacher>(teacherDocs);

    const userIds = teachers.map((t) => t.userId);
    const users = cleanDocs<User>(await UserModel.find({ id: { $in: userIds } }).lean());
    const userMap = new Map(users.map((u) => [u.id, u]));

    return teachers.map((teacher) => ({
      ...teacher,
      user: userMap.get(teacher.userId),
    }));
  }

  async createTeacher(
    insertTeacher: InsertTeacher,
    userParams?: Omit<InsertUser, "role">,
  ): Promise<Teacher & { user?: User }> {
    await connectToDatabase();

    let createdUser: User | undefined;
    if (userParams) {
      createdUser = await this.createUser({ ...userParams, role: "teacher" });
      insertTeacher.userId = createdUser.id;
    }

    const id = await nextId(TeacherModel);
    const created = await TeacherModel.create({
      id,
      ...insertTeacher,
      assignedClasses: insertTeacher.assignedClasses ?? [],
      faceImageBase64: (insertTeacher as any).faceImageBase64 ?? null,
    });
    const teacher = cleanDoc<Teacher>(created.toObject()) as Teacher;
    return { ...teacher, user: createdUser };
  }

  async updateTeacher(
    id: number,
    patch: Partial<InsertTeacher>,
  ): Promise<(Teacher & { user?: User }) | undefined> {
    await connectToDatabase();
    const updated = await TeacherModel.findOneAndUpdate(
      { id },
      { $set: patch },
      { new: true },
    ).lean();
    if (!updated) return undefined;
    const teacher = cleanDoc<Teacher>(updated);
    if (!teacher) return undefined;
    const user = cleanDoc<User>(await UserModel.findOne({ id: teacher.userId }).lean());
    return { ...teacher, user };
  }

  async deleteTeacher(id: number): Promise<boolean> {
    await connectToDatabase();
    const teacher = await TeacherModel.findOne({ id }).lean();
    if (!teacher) return false;
    // Also delete associated user
    await UserModel.deleteOne({ id: (teacher as any).userId });
    const res = await TeacherModel.deleteOne({ id });
    return res.deletedCount === 1;
  }

  async getTeacherByUserId(userId: number): Promise<(Teacher & { user?: User }) | undefined> {
    await connectToDatabase();
    const doc = await TeacherModel.findOne({ userId }).lean();
    const teacher = cleanDoc<Teacher>(doc);
    if (!teacher) return undefined;
    const user = cleanDoc<User>(await UserModel.findOne({ id: teacher.userId }).lean());
    return { ...teacher, user };
  }

  async setTeacherFaceData(id: number, imageBase64: string): Promise<void> {
    await connectToDatabase();
    await TeacherModel.findOneAndUpdate({ id }, { faceImageBase64: imageBase64 });
  }

  async getAttendance(studentId?: number, schoolId?: number): Promise<Attendance[]> {
    await connectToDatabase();

    if (studentId) {
      const docs = await AttendanceModel.find({ studentId }).sort({ date: -1 }).lean();
      return cleanDocs<Attendance>(docs);
    }

    if (schoolId) {
      const schoolStudents = cleanDocs<Student>(
        await StudentModel.find({ schoolId }).select({ id: 1 }).lean(),
      );
      const ids = schoolStudents.map((s) => s.id);
      if (ids.length === 0) return [];
      const docs = await AttendanceModel.find({ studentId: { $in: ids } }).sort({ date: -1 }).lean();
      return cleanDocs<Attendance>(docs);
    }

    const docs = await AttendanceModel.find().sort({ date: -1 }).lean();
    return cleanDocs<Attendance>(docs);
  }

  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    await connectToDatabase();
    const id = await nextId(AttendanceModel);
    const created = await AttendanceModel.create({
      id,
      ...insertAttendance,
      faceVerified: insertAttendance.faceVerified ?? false,
      markedByTeacherId: insertAttendance.markedByTeacherId ?? null,
      date: new Date(),
    });
    return cleanDoc<Attendance>(created.toObject()) as Attendance;
  }

  async upsertTodayAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    await connectToDatabase();
    const { start, end } = dayRange();
    const existing = await AttendanceModel.findOne({
      studentId: insertAttendance.studentId,
      date: { $gte: start, $lte: end },
    }).lean();

    if (existing) {
      const updated = await AttendanceModel.findOneAndUpdate(
        { id: (existing as any).id },
        {
          $set: {
            status: insertAttendance.status,
            faceVerified: insertAttendance.faceVerified ?? false,
            markedByTeacherId: insertAttendance.markedByTeacherId ?? null,
          },
        },
        { new: true },
      ).lean();
      return cleanDoc<Attendance>(updated) as Attendance;
    }

    return this.createAttendance(insertAttendance);
  }

  async getComplaints(): Promise<Complaint[]> {
    await connectToDatabase();
    const docs = await ComplaintModel.find().sort({ createdAt: -1 }).lean();
    return cleanDocs<Complaint>(docs);
  }

  async createComplaint(insertComplaint: InsertComplaint): Promise<Complaint> {
    await connectToDatabase();
    const id = await nextId(ComplaintModel);
    const created = await ComplaintModel.create({
      id,
      ...insertComplaint,
      schoolId: insertComplaint.schoolId ?? null,
      isAnonymous: insertComplaint.isAnonymous ?? false,
      aiClassification: insertComplaint.aiClassification ?? null,
      status: "pending",
      createdAt: new Date(),
    });
    return cleanDoc<Complaint>(created.toObject()) as Complaint;
  }

  async getCourses(): Promise<Course[]> {
    await connectToDatabase();
    const docs = await CourseModel.find().sort({ id: 1 }).lean();
    return cleanDocs<Course>(docs);
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    await connectToDatabase();
    const id = await nextId(CourseModel);
    const created = await CourseModel.create({
      id,
      ...insertCourse,
      thumbnailUrl: insertCourse.thumbnailUrl ?? null,
      videoUrl: insertCourse.videoUrl ?? null,
    });
    return cleanDoc<Course>(created.toObject()) as Course;
  }

  async getBlockchainResults(studentId?: number): Promise<BlockchainResult[]> {
    await connectToDatabase();
    const filter = studentId ? { studentId } : {};
    const docs = await BlockchainResultModel.find(filter).sort({ createdAt: -1 }).lean();
    return cleanDocs<BlockchainResult>(docs);
  }

  async createBlockchainResult(insertResult: InsertBlockchainResult): Promise<BlockchainResult> {
    await connectToDatabase();
    const id = await nextId(BlockchainResultModel);
    const created = await BlockchainResultModel.create({
      id,
      ...insertResult,
      isVerified: insertResult.isVerified ?? true,
      aiExplanation: insertResult.aiExplanation ?? null,
      createdAt: new Date(),
    });
    return cleanDoc<BlockchainResult>(created.toObject()) as BlockchainResult;
  }

  async setStudentFaceData(id: number, imageBase64: string): Promise<void> {
    await connectToDatabase();
    await StudentModel.findOneAndUpdate({ id }, { faceImageBase64: imageBase64 });
  }

  async verifyBlockchainResult(hash: string): Promise<BlockchainResult | undefined> {
    await connectToDatabase();
    const result = await BlockchainResultModel.findOne({ reportHash: hash }).lean();
    return cleanDoc<BlockchainResult>(result);
  }

  // --- Analytics helpers ---
  async getCounts(): Promise<{ schools: number; students: number; teachers: number; avgAttendance: number; complaints: number; }> {
    await connectToDatabase();
    const [schools, students, teachers, complaints] = await Promise.all([
      SchoolModel.countDocuments(),
      StudentModel.countDocuments(),
      TeacherModel.countDocuments(),
      ComplaintModel.countDocuments(),
    ]);
    let avgAttendance = 0;
    if (students > 0) {
      const docs = await StudentModel.find().select({ attendanceRate: 1, _id: 0 }).lean();
      const sum = docs.reduce((acc, d: any) => acc + (d.attendanceRate || 0), 0);
      avgAttendance = Math.round((sum / students) * 10) / 10;
    }
    return { schools, students, teachers, avgAttendance, complaints };
  }

  async getSchoolsWithComplaintCounts(district?: string) {
    await connectToDatabase();
    const schoolFilter: any = district ? { district } : {};
    const schools = cleanDocs<School>(await SchoolModel.find(schoolFilter).lean());
    const counts = await ComplaintModel.aggregate([
      { $group: { _id: "$schoolId", count: { $sum: 1 } } },
    ]);
    const map = new Map<number, number>();
    counts.forEach((c: any) => map.set(c._id ?? -1, c.count));
    return schools.map((s) => ({
      id: s.id,
      name: s.name,
      district: (s as any).district ?? null,
      performanceScore: s.performanceScore,
      teacherShortage: s.teacherShortage,
      complaints: map.get(s.id) ?? 0,
    }));
  }

  async getTeacherShortagesByDistrict(district?: string) {
    await connectToDatabase();
    const filter: any = district ? { district } : {};
    const schools = await SchoolModel.find(filter).select({ shortageDetails: 1, district: 1 }).lean();
    const result: Record<string, { subject: string; count: number; district: string | null }[]> = {} as any;
    const rows: { subject: string; count: number; district: string | null }[] = [];
    (schools as any[]).forEach((s: any) => {
      (s.shortageDetails || []).forEach((d: any) => {
        rows.push({ subject: d.subject, count: d.count, district: s.district ?? null });
      });
    });
    const grouped: Record<string, number> = {};
    rows.forEach((r) => {
      const key = `${r.district || 'Unknown'}|${r.subject}`;
      grouped[key] = (grouped[key] || 0) + r.count;
    });
    return Object.entries(grouped).map(([k, count]) => {
      const [dist, subject] = k.split("|");
      return { district: dist === 'Unknown' ? null : dist, subject, count };
    });
  }

  async getDistrictSummary() {
    await connectToDatabase();
    const schools = await SchoolModel.find().select({ district: 1, performanceScore: 1, teacherShortage: 1 }).lean();
    const by: Record<string, { schools: number; perfSum: number; shortages: number }> = {};
    (schools as any[]).forEach((s: any) => {
      const d = s.district || 'Unknown';
      if (!by[d]) by[d] = { schools: 0, perfSum: 0, shortages: 0 };
      by[d].schools += 1;
      by[d].perfSum += s.performanceScore || 0;
      if (s.teacherShortage) by[d].shortages += 1;
    });
    return Object.entries(by).map(([district, v]) => ({
      district,
      schools: v.schools,
      avgPerformance: v.schools ? Math.round((v.perfSum / v.schools) * 10) / 10 : 0,
      teacherShortages: v.shortages,
    }));
  }

  // --- Scholarship ---
  async getScholarshipRule() {
    await connectToDatabase();
    let rule = await (await import("./db")).ScholarshipRuleModel.findOne({ id: 1 }).lean();
    if (!rule) {
      const Model = (await import("./db")).ScholarshipRuleModel;
      const created = await Model.create({ id: 1, minMarks: 85, minAttendance: 90, districtsOverride: [], updatedAt: new Date() });
      rule = created.toObject();
    }
    const { _id, __v, ...rest } = rule as any;
    return rest;
  }

  async updateScholarshipRule(update: Partial<{ minMarks: number; minAttendance: number; districtsOverride: any[] }>) {
    await connectToDatabase();
    const Model = (await import("./db")).ScholarshipRuleModel;
    const existing = await Model.findOne({ id: 1 });
    if (existing) {
      if (update.minMarks !== undefined) existing.minMarks = update.minMarks;
      if (update.minAttendance !== undefined) existing.minAttendance = update.minAttendance;
      if (update.districtsOverride !== undefined) existing.districtsOverride = update.districtsOverride as any[];
      existing.updatedAt = new Date();
      await existing.save();
      return cleanDoc<any>(existing.toObject());
    } else {
      const created = await Model.create({ id: 1, updatedAt: new Date(), ...update });
      return cleanDoc<any>(created.toObject());
    }
  }

  async evaluateScholarship(studentId: number) {
    await connectToDatabase();
    const [rule, student] = await Promise.all([
      this.getScholarshipRule(),
      StudentModel.findOne({ id: studentId }).lean(),
    ]);
    if (!student) return { eligible: false, reason: "Student not found" };
    const marks = (student as any).marks || 0;
    const attendance = (student as any).attendanceRate || 0;
    let minMarks = rule.minMarks;
    let minAttendance = rule.minAttendance;
    // Apply district override if any
    if (rule.districtsOverride && (student as any).schoolId) {
      const school = await SchoolModel.findOne({ id: (student as any).schoolId }).lean();
      const district = (school as any)?.district;
      const o = rule.districtsOverride.find((x: any) => x.district === district);
      if (o) {
        if (o.minMarks !== undefined) minMarks = o.minMarks;
        if (o.minAttendance !== undefined) minAttendance = o.minAttendance;
      }
    }
    const eligible = marks >= minMarks && attendance >= minAttendance;
    const reason = eligible ? `Meets thresholds (marks>=${minMarks}, attendance>=${minAttendance})` : `Below thresholds (marks ${marks}/${minMarks}, attendance ${attendance}/${minAttendance})`;
    return { eligible, reason };
  }

  // --- Admin ---
  async listUsers(params: { role?: string; q?: string; schoolId?: number } = {}) {
    await connectToDatabase();
    const filter: any = {};
    if (params.role) filter.role = params.role;
    if (params.schoolId) filter.schoolId = params.schoolId;
    if (params.q) {
      filter.$or = [
        { username: { $regex: params.q, $options: 'i' } },
        { name: { $regex: params.q, $options: 'i' } },
      ];
    }
    const docs = await UserModel.find(filter).sort({ id: 1 }).lean();
    return cleanDocs<User>(docs);
  }

  async updateUserRole(id: number, role: User["role"]) {
    await connectToDatabase();
    const doc = await UserModel.findOneAndUpdate({ id }, { role }, { new: true }).lean();
    return cleanDoc<User>(doc);
  }
}

export const storage = new DatabaseStorage();
