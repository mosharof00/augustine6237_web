import { api, callApi } from "@/lib/api/client";
import type { Envelope } from "@/lib/api/envelope";
import type { AdminDashboard } from "./model";

type DashboardGet = (path: "/admin/dashboard") => Promise<{
  data?: Envelope<AdminDashboard>;
  error?: Envelope<AdminDashboard>;
  response: Response;
}>;

export function getAdminDashboard() {
  return callApi<AdminDashboard>(() =>
    (api.GET as unknown as DashboardGet)("/admin/dashboard"),
  );
}
