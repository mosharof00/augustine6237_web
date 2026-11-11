import { api, callApi } from "./client";
import type {
  KycStatus,
  SubmitKycInput,
  SubmitKycResult,
  ReviewKycInput,
  ReviewKycResult,
  BetDispute,
  CreateDisputeInput,
  CreateDisputeResult,
  ResolveDisputeInput,
  ResolveDisputeResult,
} from "./types";

export function getKycStatus() {
  return callApi<KycStatus>(() => api.GET("/kyc/status"));
}

export function submitKyc(input: SubmitKycInput) {
  return callApi<SubmitKycResult>(() =>
    api.POST("/kyc/submit", {
      body: input,
    }),
  );
}

export function reviewKyc(input: ReviewKycInput) {
  return callApi<ReviewKycResult>(() =>
    api.POST("/kyc/admin/review", {
      body: input,
    }),
  );
}

export function getDisputes(query?: {
  bet_id?: string;
  status?: string;
  my_disputes?: boolean;
}) {
  return callApi<BetDispute[]>(() =>
    api.GET("/disputes", {
      params: query ? { query } : undefined,
    }),
  );
}

export function getDisputeById(id: string) {
  return callApi<BetDispute>(() =>
    api.GET("/disputes/{id}", {
      params: {
        path: { id },
      },
    }),
  );
}

export function createDispute(input: CreateDisputeInput) {
  return callApi<CreateDisputeResult>(() =>
    api.POST("/disputes", {
      body: input,
    }),
  );
}

export function resolveDispute(id: string, input: ResolveDisputeInput) {
  return callApi<ResolveDisputeResult>(() =>
    api.POST("/disputes/{id}/resolve", {
      params: {
        path: { id },
      },
      body: input,
    }),
  );
}

