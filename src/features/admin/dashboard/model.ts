export const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;

export type WeekDay = (typeof WEEK_DAYS)[number];

export type WeekPoint = {
  day: string;
  readingHours: number;
  listeningHours: number;
};

export type StudentSegment = {
  label: string;
  percent: number;
};

export type AdminDashboard = {
  greetingName?: string;
  attentionCount: number;
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  pendingStudents: number;
  week: WeekPoint[];
  storyCompletionPercent: number;
  quizCompletionPercent: number;
  stories: {
    published: number;
    drafts: number;
    archived: number;
  };
  attention: {
    classRequests: number;
    studentApprovals: number;
    safeSpaceNew: number;
    safeSpaceFollowUp: number;
  };
  topStudents: {
    name: string;
    grade: string;
    points: number;
    kindness: number;
  }[];
  students: {
    total: number;
    segments?: StudentSegment[];
  };
  activity: {
    actor: string;
    sentence: string;
    at: string;
  }[];
};

export const reviewHrefs = {
  classRequests: "/admin/classes/requests",
  studentApprovals: "/admin/users/pending",
  safeSpace: "/admin/safe-space",
  stories: "/admin/stories",
} as const;

export function greeting(name: string, hour: number) {
  const part = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  return `Good ${part}, ${name}.`;
}

export function attentionLine(count: number) {
  if (count === 1) return "1 item needs your attention today.";
  return `${count} items need your attention today.`;
}

export function pendingCountLabel(count: number) {
  return String(count).padStart(2, "0");
}

export function classRequestLine(count: number) {
  const noun = count === 1 ? "class request" : "class requests";
  return `${count} ${noun} waiting for approval`;
}

export function studentApprovalLine(count: number) {
  const noun = count === 1 ? "student is" : "students are";
  return `${count} ${noun} waiting for approval`;
}

export function safeSpaceLine(created: number, followUp: number) {
  const reports = created === 1 ? "new report" : "new reports";
  return `${created} ${reports} • ${followUp} required follow-up`;
}

export function weekBars(week: WeekPoint[]) {
  return WEEK_DAYS.map((day) => {
    const point = week.find((item) => item.day === day);
    return {
      day,
      readingHours: point?.readingHours ?? 0,
      listeningHours: point?.listeningHours ?? 0,
    };
  });
}

export function donutSegments(students: AdminDashboard["students"]) {
  return (students.segments ?? []).filter(
    (segment) => segment.label.trim() && Number.isFinite(segment.percent),
  );
}

export function activityTime(at: string, now = Date.now()) {
  const parsed = Date.parse(at);
  if (Number.isNaN(parsed)) return at;
  const minutes = Math.max(0, Math.round((now - parsed) / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) {
    return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}
