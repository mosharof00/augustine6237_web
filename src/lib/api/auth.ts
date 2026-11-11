import { api, callApi } from "./client";
import type { AuthSession, AuthUser } from "./types";

export function registerUser(body: {
  name: string;
  email: string;
  password: string;
  phone_number?: string;
  type?: string;
}) {
  return callApi(() => api.POST("/auth/register", { body }));
}

export function loginUser(body: {
  email: string;
  password: string;
  fcm_token?: string;
}) {
  return callApi<AuthSession>(() => api.POST("/auth/login", { body }));
}

export function registerAdmin(body: {
  email: string;
  password: string;
  name: string;
}) {
  return callApi(() => api.POST("/auth/admin/register", { body }));
}

export function verifyEmail(body: { email: string; code: string }) {
  return callApi(() => api.POST("/auth/admin/verify-email", { body }));
}

export function adminLogin(body: { email: string; password: string }) {
  return callApi<AuthSession>(() => api.POST("/auth/admin/login", { body }));
}

export function forgotPassword(body: { email: string }) {
  return callApi(() => api.POST("/auth/admin/forgot-password", { body }));
}

export function resetPassword(body: { token: string; password: string }) {
  return callApi(() => api.POST("/auth/admin/reset-password", { body }));
}

export function saveSchool(body: Record<string, unknown>) {
  return callApi(() => api.POST("/auth/school", { body }));
}

export function acceptTeacherInvite(body: {
  token: string;
  password: string;
  name: string;
}) {
  return callApi<AuthUser>(() =>
    api.POST("/auth/teacher/accept-invite", { body }),
  );
}

export function staffLogin(body: { email: string; password: string }) {
  return callApi<AuthSession>(() => api.POST("/auth/staff/login", { body }));
}

export function getMe() {
  return callApi<AuthUser>(() => api.GET("/auth/me"));
}

export function logoutRequest() {
  return callApi(() => api.POST("/auth/logout"));
}

export function changePassword(body: { current: string; next: string }) {
  return callApi(() => api.PATCH("/auth/password", { body }));
}
