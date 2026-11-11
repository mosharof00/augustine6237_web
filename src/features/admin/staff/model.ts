import { z } from "zod";
import type { StatusBadgeVariant } from "@/components/feedback/status-badge";

export type StaffStatus = "ACTIVE" | "INVITED" | "INACTIVE";

export type StaffClass = {
  id: string;
  name: string;
  code: string;
  assignedOn: string;
  studentCount: number;
};

export type StaffMember = {
  id: string;
  name: string;
  handle: string;
  email: string;
  phone: string;
  staffCode: string;
  role: string;
  canAccessSafeSpace: boolean;
  assignedClass: string;
  studentCount: number;
  status: StaffStatus | string;
  joinedAt?: string;
  classes?: StaffClass[];
};

export const STAFF_PER_PAGE = 12;

export function staffRoleLabel(member: {
  role: string;
  canAccessSafeSpace: boolean;
}) {
  if (member.role === "TEACHER" && member.canAccessSafeSpace) return "Counselor";
  if (member.role === "TEACHER") return "Teacher";
  if (member.role === "ADMIN") return "Admin";
  return member.role;
}

export function staffStatusVariant(status: string): StatusBadgeVariant {
  if (status === "INVITED" || status === "INVITATION_SENT") return "invitation";
  if (status === "INACTIVE") return "inactive";
  return "active";
}

export function invitePayload(values: {
  email: string;
  canAccessSafeSpace: boolean;
}) {
  return {
    email: values.email.trim(),
    canAccessSafeSpace: values.canAccessSafeSpace,
  };
}

export function staffPatch(values: {
  name: string;
  email: string;
  canAccessSafeSpace: boolean;
  assignedClass: string;
}) {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    canAccessSafeSpace: values.canAccessSafeSpace,
    assignedClass: values.assignedClass,
  };
}

function emailField(emptyMessage: string) {
  return z.string().superRefine((value, ctx) => {
    const trimmed = value.trim();
    if (!trimmed) {
      ctx.addIssue({ code: "custom", message: emptyMessage });
      return;
    }
    if (!z.email().safeParse(trimmed).success) {
      ctx.addIssue({ code: "custom", message: "Enter a valid email address" });
    }
  });
}

export const inviteSchema = z.object({
  name: z.string(),
  email: emailField("Work email is required"),
  assignedClass: z.string(),
  canAccessSafeSpace: z.boolean(),
});

export const editStaffSchema = z.object({
  name: z.string().trim().min(1, "Full name is required"),
  email: emailField("Work email is required"),
  assignedClass: z.string(),
  canAccessSafeSpace: z.boolean(),
});

export type InviteValues = z.infer<typeof inviteSchema>;
export type EditStaffValues = z.infer<typeof editStaffSchema>;
