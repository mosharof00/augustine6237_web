export type StaffDestination =
  | "/admin"
  | "/teacher"
  | "/onboarding/school"
  | "/sign-in"
  | "/";

export function userHome(role: string | null | undefined): string {
  if (role === "ADMIN") return "/admin";
  return "/";
}

export function userHasSchool(user: object): boolean {
  if (!("school" in user)) return false;
  const school = (user as { school?: unknown }).school;
  return school != null && school !== "";
}

export function staffHome(input: {
  role: string | null | undefined;
  hasSchool: boolean;
  pendingSchool: boolean;
}): StaffDestination {
  if (input.role === "TEACHER") return "/teacher";
  if (input.role === "ADMIN") {
    if (input.hasSchool) return "/admin";
    if (input.pendingSchool) return "/onboarding/school";
    return "/admin";
  }
  return "/sign-in";
}

export function accessTokenFrom(data: unknown): string | null {
  if (!data || typeof data !== "object" || !("accessToken" in data)) {
    return null;
  }
  const token = (data as { accessToken?: unknown }).accessToken;
  return typeof token === "string" && token.length > 0 ? token : null;
}
