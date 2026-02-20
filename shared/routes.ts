import { z } from 'zod';
import { 
  insertUserSchema,
  insertSchoolSchema,
  insertStudentSchema,
  insertTeacherSchema,
  insertAttendanceSchema,
  insertComplaintSchema,
  insertCourseSchema,
  insertBlockchainResultSchema,
  type User,
  type School,
  type Student,
  type Teacher,
  type Attendance,
  type Complaint,
  type Course,
  type BlockchainResult,
  loginSchema,
  updateScholarshipRuleSchema,
  type ScholarshipRule,
  updateSchoolSchema,
} from './schema';

export type {
  InsertUser,
  InsertSchool,
  InsertStudent,
  InsertTeacher,
  InsertAttendance,
  InsertComplaint,
  InsertCourse,
  InsertBlockchainResult,
} from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// We include the user object with student/teacher details for ease
export const studentWithDetailsSchema = z.custom<Student & { user?: User }>();
export const teacherWithDetailsSchema = z.custom<Teacher & { user?: User }>();

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: loginSchema,
      responses: {
        200: z.custom<User>(),
        401: errorSchemas.unauthorized,
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me' as const,
      responses: {
        200: z.custom<User>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout' as const,
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
  },
  schools: {
    list: {
      method: 'GET' as const,
      path: '/api/schools' as const,
      responses: {
        200: z.array(z.custom<School>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/schools/:id' as const,
      responses: {
        200: z.custom<School>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/schools' as const,
      input: insertSchoolSchema,
      responses: {
        201: z.custom<School>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/schools/:id' as const,
      input: updateSchoolSchema,
      responses: {
        200: z.custom<School>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/schools/:id' as const,
      responses: {
        200: z.object({ message: z.string() }),
        404: errorSchemas.notFound,
      },
    },
  },
  students: {
    list: {
      method: 'GET' as const,
      path: '/api/students' as const,
      input: z.object({ schoolId: z.coerce.number().optional() }).optional(),
      responses: {
        200: z.array(studentWithDetailsSchema),
      },
    },
    setFaceData: {
      method: 'POST' as const,
      path: '/api/students/:id/face-data' as const,
      input: z.object({ imageBase64: z.string() }),
      responses: {
        200: z.custom<Attendance>().optional(), // not used; returns ack
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/students/:id' as const,
      responses: {
        200: studentWithDetailsSchema,
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/students' as const,
      input: insertStudentSchema.extend({
        user: insertUserSchema.omit({ role: true }).optional()
      }),
      responses: {
        201: studentWithDetailsSchema,
        400: errorSchemas.validation,
      },
    },
  },
  teachers: {
    list: {
      method: 'GET' as const,
      path: '/api/teachers' as const,
      input: z.object({ schoolId: z.coerce.number().optional() }).optional(),
      responses: {
        200: z.array(teacherWithDetailsSchema),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/teachers/:id' as const,
      responses: {
        200: teacherWithDetailsSchema,
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/teachers' as const,
      input: insertTeacherSchema.extend({
        user: insertUserSchema.omit({ role: true }).optional()
      }),
      responses: {
        201: teacherWithDetailsSchema,
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/teachers/:id' as const,
      input: insertTeacherSchema.partial(),
      responses: {
        200: teacherWithDetailsSchema,
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/teachers/:id' as const,
      responses: {
        200: z.object({ message: z.string() }),
        404: errorSchemas.notFound,
      },
    },
    setFaceData: {
      method: 'POST' as const,
      path: '/api/teachers/:id/face-data' as const,
      input: z.object({ imageBase64: z.string() }),
      responses: {
        200: z.object({ message: z.string() }),
        400: errorSchemas.validation,
      },
    },
  },
  attendance: {
    list: {
      method: 'GET' as const,
      path: '/api/attendance' as const,
      input: z.object({ studentId: z.coerce.number().optional(), schoolId: z.coerce.number().optional() }).optional(),
      responses: {
        200: z.array(z.custom<Attendance>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/attendance' as const,
      input: insertAttendanceSchema,
      responses: {
        201: z.custom<Attendance>(),
        400: errorSchemas.validation,
      },
    },
    faceVerify: {
      method: 'POST' as const,
      path: '/api/attendance/face-verify' as const,
      input: z.object({ imageBase64: z.string(), studentId: z.number() }),
      responses: {
        200: z.object({ success: z.boolean(), matchConfidence: z.number() }),
        400: errorSchemas.validation,
      },
    }
  },
  complaints: {
    list: {
      method: 'GET' as const,
      path: '/api/complaints' as const,
      responses: {
        200: z.array(z.custom<Complaint>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/complaints' as const,
      input: insertComplaintSchema,
      responses: {
        201: z.custom<Complaint>(),
        400: errorSchemas.validation,
      },
    },
  },
  courses: {
    list: {
      method: 'GET' as const,
      path: '/api/courses' as const,
      responses: {
        200: z.array(z.custom<Course>()),
      },
    },
  },
  blockchain: {
    list: {
      method: 'GET' as const,
      path: '/api/blockchain-results' as const,
      input: z.object({ studentId: z.coerce.number().optional() }).optional(),
      responses: {
        200: z.array(z.custom<BlockchainResult>()),
      },
    },
    verify: {
      method: 'POST' as const,
      path: '/api/blockchain-results/verify' as const,
      input: z.object({ hash: z.string() }),
      responses: {
        200: z.object({ isValid: z.boolean(), details: z.custom<BlockchainResult>().optional() }),
        404: errorSchemas.notFound,
      },
    }
  },
  dashboard: {
    analytics: {
      method: 'GET' as const,
      path: '/api/dashboard/analytics' as const,
      responses: {
        200: z.object({
          totalSchools: z.number(),
          totalStudents: z.number(),
          totalTeachers: z.number(),
          averageAttendance: z.number(),
          teacherShortageCount: z.number(),
          recentComplaints: z.number(),
          byDistrict: z.array(z.object({ district: z.string(), schools: z.number(), avgPerformance: z.number(), teacherShortages: z.number() })).optional(),
        }),
      }
    }
  },
  analytics: {
    schools: {
      method: 'GET' as const,
      path: '/api/analytics/schools' as const,
      input: z.object({ district: z.string().optional() }).optional(),
      responses: {
        200: z.array(z.object({ id: z.number(), name: z.string(), district: z.string().nullable(), performanceScore: z.number(), teacherShortage: z.boolean(), complaints: z.number() })),
      },
    },
    teachersShortages: {
      method: 'GET' as const,
      path: '/api/analytics/teachers/shortages' as const,
      input: z.object({ district: z.string().optional() }).optional(),
      responses: {
        200: z.array(z.object({ subject: z.string(), count: z.number(), district: z.string().nullable() })),
      }
    },
    studentsTrends: {
      method: 'GET' as const,
      path: '/api/analytics/trends/students' as const,
      input: z.object({ groupBy: z.enum(['term','month']).optional(), district: z.string().optional() }).optional(),
      responses: {
        200: z.object({
          academicByTerm: z.array(z.object({ term: z.string(), avgMarks: z.number() })),
          attendanceByMonth: z.array(z.object({ month: z.string(), avgAttendance: z.number() })),
        }),
      }
    },
  },
  scholarship: {
    rules: {
get: {
        method: 'GET' as const,
        path: '/api/scholarship/rules' as const,
        responses: { 200: z.custom<ScholarshipRule>() }
      },
      update: {
        method: 'PUT' as const,
        path: '/api/scholarship/rules' as const,
        input: updateScholarshipRuleSchema,
        responses: { 200: z.custom<ScholarshipRule>() }
      },
    },
    evaluate: {
      method: 'POST' as const,
      path: '/api/scholarship/evaluate' as const,
      input: z.object({ studentId: z.number() }),
      responses: { 200: z.object({ eligible: z.boolean(), reason: z.string() }) }
    }
  },
  admin: {
    users: {
      list: {
        method: 'GET' as const,
        path: '/api/admin/users' as const,
        input: z.object({ role: z.string().optional(), q: z.string().optional(), schoolId: z.coerce.number().optional() }).optional(),
        responses: { 200: z.array(z.custom<User>()) }
      },
      updateRole: {
        method: 'PUT' as const,
        path: '/api/admin/users/:id/role' as const,
        input: z.object({ role: z.enum(['gov_admin','school_admin','teacher','student']) }),
        responses: { 200: z.custom<User>() }
      }
    }
  },
  reports: {
    export: {
      method: 'GET' as const,
      path: '/api/reports' as const,
      input: z.object({ type: z.enum(['schools','teachers','students','complaints']), format: z.enum(['csv','json']).default('csv'), district: z.string().optional() }).optional(),
      responses: { 200: z.any() }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
