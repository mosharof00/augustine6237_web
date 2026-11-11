import { api, callApi } from "./client";
import type {
  GamingMatchCheck,
  SubmitGamingScoreInput,
  SubmitGamingScoreResult,
} from "./types";

export function submitGamingScore(betId: string, input: SubmitGamingScoreInput) {
  return callApi<SubmitGamingScoreResult>(() =>
    api.POST("/gaming/{bet_id}/submit-score", {
      params: {
        path: { bet_id: betId },
      },
      body: input,
    }),
  );
}

export function getGamingMatchCheck(betId: string) {
  return callApi<GamingMatchCheck>(() =>
    api.GET("/gaming/{bet_id}/match-check", {
      params: {
        path: { bet_id: betId },
      },
    }),
  );
}

