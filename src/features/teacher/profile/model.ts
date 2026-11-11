import { z } from "zod";

export interface TeacherProfile {
  id: string;
  realName: string;
  email: string;
  status: string;
  avatarUrl: string | null;
  role: string;
  classCount: number;
  studentCount: number;
  phone: string;
  title: string;
  bio: string;
  department: string;
  qualification: string;
  experience: string;
  joiningDate: string;
  dob: string;
  gender: string;
  address: string;
}

export const updateProfileSchema = z.object({
  realName: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z.string().trim().optional(),
  title: z.string().trim().optional(),
  avatarUrl: z.string().trim().optional(),
  bio: z.string().trim().optional(),
  department: z.string().trim().optional(),
  qualification: z.string().trim().optional(),
  experience: z.string().trim().optional(),
  dob: z.string().trim().optional(),
  gender: z.string().trim().optional(),
  address: z.string().trim().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

const DEFAULT_BIO =
  "A dedicated and student-focused mathematics teacher with a strong passion for making complex concepts easier to understand through engaging, interactive, and student-centered learning. Committed to helping students strengthen their analytical thinking, develop effective problem-solving strategies, and build confidence in their mathematical abilities.";

export function normalizeTeacherProfile(
  raw: unknown,
  cachedExtra?: Partial<TeacherProfile> | null,
): TeacherProfile {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;

  const id = typeof obj.id === "string" ? obj.id : "teacher-1";
  const realName =
    typeof obj.realName === "string" && obj.realName.trim()
      ? obj.realName.trim()
      : typeof obj.name === "string" && obj.name.trim()
        ? obj.name.trim()
        : "Teacher";

  const email =
    typeof obj.email === "string" && obj.email.trim()
      ? obj.email.trim()
      : "teacher@school.edu";

  const status =
    typeof obj.status === "string" && obj.status.trim()
      ? obj.status.trim()
      : "Active";

  const avatarUrl =
    typeof obj.avatarUrl === "string" && obj.avatarUrl.trim()
      ? obj.avatarUrl.trim()
      : null;

  const role =
    typeof obj.role === "string" && obj.role.trim()
      ? obj.role.trim()
      : "TEACHER";

  const classCount =
    typeof obj.classCount === "number" && !Number.isNaN(obj.classCount)
      ? obj.classCount
      : 8;

  const studentCount =
    typeof obj.studentCount === "number" && !Number.isNaN(obj.studentCount)
      ? obj.studentCount
      : 240;

  return {
    id,
    realName,
    email,
    status,
    avatarUrl: cachedExtra?.avatarUrl ?? avatarUrl,
    role,
    classCount,
    studentCount,
    phone:
      cachedExtra?.phone ??
      (typeof obj.phone === "string" && obj.phone.trim()
        ? obj.phone.trim()
        : "+1 (555) 123-4567"),
    title:
      cachedExtra?.title ??
      (typeof obj.title === "string" && obj.title.trim()
        ? obj.title.trim()
        : "Senior Mathematics Teacher"),
    bio:
      cachedExtra?.bio ??
      (typeof obj.bio === "string" && obj.bio.trim()
        ? obj.bio.trim()
        : DEFAULT_BIO),
    department:
      cachedExtra?.department ??
      (typeof obj.department === "string" && obj.department.trim()
        ? obj.department.trim()
        : "Mathematics"),
    qualification:
      cachedExtra?.qualification ??
      (typeof obj.qualification === "string" && obj.qualification.trim()
        ? obj.qualification.trim()
        : "M.Sc. in Mathematics"),
    experience:
      cachedExtra?.experience ??
      (typeof obj.experience === "string" && obj.experience.trim()
        ? obj.experience.trim()
        : "8 years"),
    joiningDate:
      cachedExtra?.joiningDate ??
      (typeof obj.joiningDate === "string" && obj.joiningDate.trim()
        ? obj.joiningDate.trim()
        : "August 12, 2018"),
    dob:
      cachedExtra?.dob ??
      (typeof obj.dob === "string" && obj.dob.trim()
        ? obj.dob.trim()
        : "March 15, 1988"),
    gender:
      cachedExtra?.gender ??
      (typeof obj.gender === "string" && obj.gender.trim()
        ? obj.gender.trim()
        : "Female"),
    address:
      cachedExtra?.address ??
      (typeof obj.address === "string" && obj.address.trim()
        ? obj.address.trim()
        : "24 Green Street, New York"),
  };
}
