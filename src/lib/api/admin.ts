import { api, callApi } from "./client";
import type {
  AdminOverview,
  AdminUser,
  UpdateUserStatusInput,
  UpdateUserStatusResult,
  FeatureBetInput,
  FeatureBetResult,
  AdminWithdrawal,
  ReviewWithdrawalInput,
  ReviewWithdrawalResult,
} from "./types";

export function getAdminOverview() {
  return callApi<AdminOverview>(() => api.GET("/admin/overview"));
}

export function getAdminUsers(params?: {
  search?: string;
  status?: string;
  limit?: number;
  page?: number;
}) {
  return callApi<AdminUser[]>(() =>
    api.GET("/admin/users", {
      params: {
        query: params,
      },
    }),
  );
}

export function updateUserStatus(userId: string, input: UpdateUserStatusInput) {
  return callApi<UpdateUserStatusResult>(() =>
    api.PATCH("/admin/users/{id}/status", {
      params: {
        path: { id: userId },
      },
      body: input,
    }),
  );
}

export function featureBet(betId: string, input: FeatureBetInput) {
  return callApi<FeatureBetResult>(() =>
    api.POST("/admin/bets/{id}/feature", {
      params: {
        path: { id: betId },
      },
      body: input,
    }),
  );
}

export function getAdminWithdrawals() {
  return callApi<AdminWithdrawal[]>(() => api.GET("/admin/withdrawals"));
}

export function reviewWithdrawal(
  transactionId: string,
  input: ReviewWithdrawalInput,
) {
  return callApi<ReviewWithdrawalResult>(() =>
    api.POST("/admin/withdrawals/{id}/review", {
      params: {
        path: { id: transactionId },
      },
      body: input,
    }),
  );
}

