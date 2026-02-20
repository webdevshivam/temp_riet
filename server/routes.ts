import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { UserModel, SchoolModel, StudentModel, TeacherModel, ComplaintModel } from "./db";
import type { Request, Response, NextFunction } from "express";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);
      let user = await storage.getUserByUsername(input.username);
      if (!user) {
        // Auto create dummy user for UI testing if doesn't exist
        // try mapping by username
        const role = input.username === 'teacher' ? 'teacher' : input.username === 'student' ? 'student' : input.username === 'school_admin' ? 'school_admin' : 'gov_admin';
        user = await storage.createUser({
          username: input.username,
          password: input.password,
          role,
          name: input.username,
        });
      }
      // persist session
      (req as any).session.userId = user.id;
      res.json(user);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.get(api.auth.me.path, async (req, res) => {
    const userId = (req as any).session?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const user = await storage.getUser(userId);
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    res.json(user);
  });

  app.post(api.auth.logout.path, async (req, res) => {
    const sess = (req as any).session;
    if (sess) {
      sess.destroy(() => {});
    }
    res.json({ message: "ok" });
  });

  app.get(api.schools.list.path, async (req, res) => {
    const schools = await storage.getSchools();
    res.json(schools);
  });

  app.get(api.schools.get.path, async (req, res) => {
    const id = Number((req.params as any).id);
    const school = await storage.getSchool(id);
    if (!school) return res.status(404).json({ message: 'Not found' });
    res.json(school);
  });

  app.post(api.schools.create.path, async (req, res) => {
    try {
      const input = api.schools.create.input.parse(req.body);
      const school = await storage.createSchool(input);
      res.status(201).json(school);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.put(api.schools.update.path, async (req, res) => {
    try {
      const id = Number((req.params as any).id);
      const input = api.schools.update.input.parse(req.body);
      const updated = await storage.updateSchool(id, input as any);
      if (!updated) return res.status(404).json({ message: 'Not found' });
      res.json(updated);
    } catch (e) {
      res.status(400).json({ message: 'Invalid input' });
    }
  });

  app.delete(api.schools.delete.path, async (req, res) => {
    const id = Number((req.params as any).id);
    const ok = await storage.deleteSchool(id);
    if (!ok) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'deleted' });
  });

  app.get(api.students.list.path, async (req, res) => {
    const schoolId = req.query.schoolId ? Number(req.query.schoolId) : undefined;
    const students = await storage.getStudents(schoolId);
    res.json(students);
  });

  app.post(api.students.create.path, async (req, res) => {
    try {
      const input = api.students.create.input.parse(req.body);
      const { user, ...studentData } = input as any;
      const student = await storage.createStudent(studentData, user);
      res.status(201).json(student);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.students.setFaceData.path, async (req, res) => {
    try {
      const id = Number((req.params as any).id);
      const input = api.students.setFaceData.input.parse(req.body);
      await storage.setStudentFaceData(id, input.imageBase64);
      res.json({ message: 'ok' });
    } catch (e) {
      res.status(400).json({ message: 'Invalid input' });
    }
  });

  app.get(api.teachers.list.path, async (req, res) => {
    const schoolId = req.query.schoolId ? Number(req.query.schoolId) : undefined;
    const teachers = await storage.getTeachers(schoolId);
    res.json(teachers);
  });

  app.get(api.teachers.get.path, async (req, res) => {
    const id = Number((req.params as any).id);
    const teacher = await storage.getTeachers();
    const found = teacher.find(t => t.id === id);
    if (!found) return res.status(404).json({ message: 'Not found' });
    res.json(found);
  });

  app.post(api.teachers.create.path, async (req, res) => {
    try {
      const input = api.teachers.create.input.parse(req.body);
      const { user, ...teacherData } = input;
      const teacher = await storage.createTeacher(teacherData, user);
      res.status(201).json(teacher);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.put(api.teachers.update.path, async (req, res) => {
    try {
      const id = Number((req.params as any).id);
      const input = api.teachers.update.input.parse(req.body);
      const updated = await storage.updateTeacher(id, input as any);
      if (!updated) return res.status(404).json({ message: 'Not found' });
      res.json(updated);
    } catch (e) {
      res.status(400).json({ message: 'Invalid input' });
    }
  });

  app.delete(api.teachers.delete.path, async (req, res) => {
    const id = Number((req.params as any).id);
    const ok = await storage.deleteTeacher(id);
    if (!ok) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'deleted' });
  });

  app.post(api.teachers.setFaceData.path, async (req, res) => {
    try {
      const id = Number((req.params as any).id);
      const input = api.teachers.setFaceData.input.parse(req.body);
      await storage.setTeacherFaceData(id, input.imageBase64);
      res.json({ message: 'ok' });
    } catch (e) {
      res.status(400).json({ message: 'Invalid input' });
    }
  });

  app.get(api.attendance.list.path, async (req, res) => {
    const att = await storage.getAttendance();
    res.json(att);
  });

  app.post(api.attendance.create.path, async (req, res) => {
    try {
      const input = api.attendance.create.input.parse(req.body);
      const att = await storage.createAttendance(input);
      res.status(201).json(att);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Face testing endpoint for manual verification
  app.post('/api/face-test/compare', async (req, res) => {
    try {
      const { storedImage, testImage } = req.body;
      
      if (!storedImage || !testImage) {
        return res.status(400).json({ message: 'Both images are required' });
      }
      
      // Import face recognition service
      const { compareFaces } = await import('./services/face-recognition');
      
      // Compare faces
      const result = await compareFaces(storedImage, testImage);
      
      res.json(result);
    } catch (e) {
      console.error('Face test error:', e);
      res.status(400).json({ message: 'Face comparison failed' });
    }
  });

  app.post(api.attendance.faceVerify.path, async (req, res) => {
    try {
      const input = api.attendance.faceVerify.input.parse(req.body);
      const { imageBase64, studentId } = input;
      
      // Get student with face data
      const student = await storage.getStudent(studentId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      
      if (!(student as any).faceImageBase64) {
        return res.status(400).json({ message: 'No face data registered for this student' });
      }
      
      // Import face recognition service
      const { compareFaces, validateFaceImage } = await import('./services/face-recognition');
      
      // Validate captured image
      const validation = validateFaceImage(imageBase64);
      if (!validation.valid) {
        return res.status(400).json({ message: validation.error || 'Invalid face image' });
      }
      
      // Compare faces
      const result = await compareFaces((student as any).faceImageBase64, imageBase64);
      
      // If match, create attendance record
      if (result.match) {
        await storage.createAttendance({
          studentId,
          status: 'present',
          faceVerified: true,
        });
      }
      
      res.json({ 
        success: result.match, 
        matchConfidence: result.confidence,
        studentName: student.user?.name || 'Unknown'
      });
    } catch (e) {
      console.error('Face verification error:', e);
      res.status(400).json({ message: 'Face verification failed' });
    }
  });

  app.get(api.complaints.list.path, async (req, res) => {
    const complaints = await storage.getComplaints();
    res.json(complaints);
  });

  app.post(api.complaints.create.path, async (req, res) => {
    try {
      const input = api.complaints.create.input.parse(req.body);
      const comp = await storage.createComplaint(input);
      res.status(201).json(comp);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.get(api.courses.list.path, async (req, res) => {
    const courses = await storage.getCourses();
    res.json(courses);
  });

  app.get(api.blockchain.list.path, async (req, res) => {
    const results = await storage.getBlockchainResults();
    res.json(results);
  });

  app.post(api.blockchain.verify.path, async (req, res) => {
    try {
      const input = api.blockchain.verify.input.parse(req.body);
      const result = await storage.verifyBlockchainResult(input.hash);
      if (result) {
        res.json({ isValid: true, details: result });
      } else {
        res.status(404).json({ message: "Not found" });
      }
    } catch (e) {
      res.status(400).json({ message: "Invalid hash" });
    }
  });

  app.get(api.dashboard.analytics.path, async (req, res) => {
    const counts = await storage.getCounts();
    const byDistrict = await storage.getDistrictSummary();
    res.json({
      totalSchools: counts.schools,
      totalStudents: counts.students,
      totalTeachers: counts.teachers,
      averageAttendance: counts.avgAttendance,
      teacherShortageCount: byDistrict.reduce((a, d) => a + d.teacherShortages, 0),
      recentComplaints: counts.complaints,
      byDistrict,
    });
  });

  // Analytics endpoints
  app.get(api.analytics.schools.path, async (req, res) => {
    const district = req.query.district as string | undefined;
    const data = await storage.getSchoolsWithComplaintCounts(district);
    res.json(data);
  });

  app.get(api.analytics.teachersShortages.path, async (req, res) => {
    const district = req.query.district as string | undefined;
    const data = await storage.getTeacherShortagesByDistrict(district);
    res.json(data);
  });

  app.get(api.analytics.studentsTrends.path, async (_req, res) => {
    // Minimal placeholder trends using available data
    const results = await storage.getBlockchainResults();
    const byTerm: Record<string, number> = {};
    results.forEach((r) => { byTerm[r.term] = (byTerm[r.term] || 0) + 1; });
    const academicByTerm = Object.entries(byTerm).map(([term, cnt]) => ({ term, avgMarks: 70 + (cnt % 20) }));
    // Attendance trend by month using Attendance docs
    const attendance = await storage.getAttendance();
    const monthMap: Record<string, { sum: number; count: number }> = {};
    attendance.forEach((a) => {
      const d = new Date(a.date);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const val = a.status === 'present' ? 100 : a.status === 'late' ? 80 : 0;
      monthMap[key] = monthMap[key] || { sum: 0, count: 0 };
      monthMap[key].sum += val;
      monthMap[key].count += 1;
    });
    const attendanceByMonth = Object.entries(monthMap).sort(([a],[b]) => a.localeCompare(b)).map(([month, v]) => ({ month, avgAttendance: Math.round((v.sum / v.count) * 10) / 10 }));
    res.json({ academicByTerm, attendanceByMonth });
  });

  // Scholarship
  app.get(api.scholarship.rules.get.path, async (_req, res) => {
    const rule = await storage.getScholarshipRule();
    res.json(rule);
  });

  app.put(api.scholarship.rules.update.path, async (req, res) => {
    try {
      const input = api.scholarship.rules.update.input.parse(req.body);
      const rule = await storage.updateScholarshipRule(input as any);
      res.json(rule);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.scholarship.evaluate.path, async (req, res) => {
    try {
      const input = api.scholarship.evaluate.input.parse(req.body);
      const out = await storage.evaluateScholarship(input.studentId);
      res.json(out);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Admin users (gov_admin only)
  function requireGov(req: Request, res: Response, next: NextFunction) {
    const userId = (req as any).session?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    storage.getUser(userId).then((u) => {
      if (u?.role !== 'gov_admin') return res.status(403).json({ message: 'Forbidden' });
      next();
    });
  }

  app.get(api.admin.users.list.path, requireGov, async (req, res) => {
    const { role, q, schoolId } = req.query as any;
    const users = await storage.listUsers({ role, q, schoolId: schoolId ? Number(schoolId) : undefined });
    res.json(users);
  });

  app.put(api.admin.users.updateRole.path, requireGov, async (req, res) => {
    try {
      const id = Number((req.params as any).id);
      const input = api.admin.users.updateRole.input.parse(req.body);
      const user = await storage.updateUserRole(id, input.role as any);
      if (!user) return res.status(404).json({ message: 'Not found' });
      res.json(user);
    } catch (e) {
      res.status(400).json({ message: 'Invalid input' });
    }
  });

  // Reports export
  app.get(api.reports.export.path, requireGov, async (req, res) => {
    const type = (req.query.type as string) || 'schools';
    const format = (req.query.format as string) || 'csv';
    const district = req.query.district as string | undefined;
    function toCsv(rows: any[]) {
      if (!rows.length) return '';
      const headers = Object.keys(rows[0]);
      const lines = [headers.join(',')].concat(rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(',')));
      return lines.join('\n');
    }
    let rows: any[] = [];
    if (type === 'schools') rows = await storage.getSchoolsWithComplaintCounts(district);
    if (type === 'teachers') rows = await TeacherModel.find().select({ _id:0, id:1, userId:1, schoolId:1, subject:1, classesAssigned:1 }).lean();
    if (type === 'students') rows = await StudentModel.find().select({ _id:0, id:1, userId:1, schoolId:1, grade:1, marks:1, attendanceRate:1, scholarshipEligible:1 }).lean();
    if (type === 'complaints') rows = await ComplaintModel.find().select({ _id:0, id:1, schoolId:1, title:1, status:1, createdAt:1, aiClassification:1 }).lean();
    if (format === 'json') {
      res.json(rows);
    } else {
      const csv = toCsv(rows);
      res.header('Content-Type', 'text/csv');
      res.attachment(`${type}.csv`);
      res.send(csv);
    }
  });

  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const schools = await storage.getSchools();
  if (schools.length === 0) {
    const school = await storage.createSchool({
      name: "Springfield High",
      location: "Springfield",
      district: "Central",
      performanceScore: 85,
      teacherShortage: true,
      shortageDetails: [{ subject: "Math", count: 2 }, { subject: "Science", count: 1 }],
    });

    const userGov = await storage.createUser({
      username: "admin",
      password: "password",
      role: "gov_admin",
      name: "Government Official",
    });

    const userTeacher = await storage.createUser({
      username: "teacher",
      password: "password",
      role: "teacher",
      name: "Edna Krabappel",
      schoolId: school.id,
    });

    const teacher = await storage.createTeacher({
      userId: userTeacher.id,
      schoolId: school.id,
      subject: "Math",
      classesAssigned: 4,
    });

    const userStudent = await storage.createUser({
      username: "student",
      password: "password",
      role: "student",
      name: "Bart Simpson",
      schoolId: school.id,
    });

    const student = await storage.createStudent({
      userId: userStudent.id,
      schoolId: school.id,
      grade: "4th",
      attendanceRate: 85,
      marks: 70,
      scholarshipEligible: false,
      aiPerformanceSummary: "Needs improvement in focus and behavior. Academic performance is slightly below average.",
    });

    await storage.createComplaint({
      schoolId: school.id,
      title: "Broken AC",
      content: "The AC in room 104 is broken.",
      isAnonymous: true,
      aiClassification: "infrastructure",
    });
    
    await storage.createCourse({
      title: "Introduction to Algebra",
      description: "Learn the basics of algebra in this interactive course.",
    });
    
    await storage.createBlockchainResult({
      studentId: student.id,
      term: "Fall 2023",
      reportHash: "0x1234567890abcdef",
      isVerified: true,
      aiExplanation: "The student has shown strong foundational skills but needs to focus more during class hours.",
    });
  }
}
