import { api, callApi } from "./client";
import type {
  Bet,
  BetComment,
  BetQuery,
  CreateBetInput,
  BetParticipant,
  JoinBetInput,
  JoinBetResult,
  BetOutcome,
  PlaceStakeInput,
  PlaceStakeResult,
  BetMatchedStatus,
  RefundUnmatchedResult,
  BetEscrowStatus,
  ResolveBetInput,
  ResolveBetResult,
  FeeConfig,
  UpdateFeeConfigInput,
  BetCommissionStatus,
  TrendingTopic,
  DiscoveryCountry,
} from "./types";

export function getPublicBets(query?: BetQuery) {
  return callApi<Bet[]>(() =>
    api.GET("/bets", {
      params: query ? { query } : undefined,
    }),
  );
}

export function getBetById(id: string) {
  return callApi<Bet>(() =>
    api.GET("/bets/{id}", {
      params: { path: { id } },
    }),
  );
}

export function getBetByInviteCode(code: string) {
  return callApi<Bet>(() =>
    api.GET("/bets/invite/{code}", {
      params: { path: { code } },
    }),
  );
}

export function joinBetByInviteCode(code: string, body: JoinBetInput) {
  return callApi<JoinBetResult>(() =>
    api.POST("/bets/invite/{code}/join", {
      params: { path: { code } },
      body,
    }),
  );
}

export function getBetParticipants(betId: string) {
  return callApi<BetParticipant[]>(() =>
    api.GET("/bets/{id}/participants", {
      params: { path: { id: betId } },
    }),
  );
}

export function createBet(body: CreateBetInput) {
  return callApi<Bet>(() =>
    api.POST("/bets", {
      body,
    }),
  );
}

export function getBetComments(betId: string) {
  return callApi<BetComment[]>(() =>
    api.GET("/bets/{id}/comments", {
      params: { path: { id: betId } },
    }),
  );
}

export function createBetComment(
  betId: string,
  body: { content: string; stance?: string },
) {
  return callApi<BetComment>(() =>
    api.POST("/bets/{id}/comments", {
      params: { path: { id: betId } },
      body,
    }),
  );
}

export function deleteBetComment(betId: string, commentId: string) {
  return callApi<unknown>(() =>
    api.DELETE("/bets/{betId}/comments/{commentId}", {
      params: { path: { betId, commentId } },
    }),
  );
}

export function placeStake(betId: string, body: PlaceStakeInput) {
  return callApi<PlaceStakeResult>(() =>
    api.POST("/bets/{id}/stake", {
      params: { path: { id: betId } },
      body,
    }),
  );
}

export function getBetOutcomes(betId: string) {
  return callApi<BetOutcome[]>(() =>
    api.GET("/bets/{id}/outcomes", {
      params: { path: { id: betId } },
    }),
  );
}

export function getBetMatchedStatus(betId: string) {
  return callApi<BetMatchedStatus>(() =>
    api.GET("/bets/{id}/matched-status", {
      params: { path: { id: betId } },
    }),
  );
}

export function refundUnmatchedStakes(betId: string) {
  return callApi<RefundUnmatchedResult>(() =>
    api.POST("/bets/{id}/refund-unmatched", {
      params: { path: { id: betId } },
    }),
  );
}

export function getBetEscrowStatus(betId: string) {
  return callApi<BetEscrowStatus>(() =>
    api.GET("/bets/{id}/escrow", {
      params: { path: { id: betId } },
    }),
  );
}

export function resolveBet(betId: string, input: ResolveBetInput) {
  return callApi<ResolveBetResult>(() =>
    api.POST("/bets/{id}/resolve", {
      params: { path: { id: betId } },
      body: input,
    }),
  );
}

export function getFeeConfig() {
  return callApi<FeeConfig>(() => api.GET("/fees/config"));
}

export function updateFeeConfig(input: UpdateFeeConfigInput) {
  return callApi<FeeConfig>(() =>
    api.PUT("/fees/config", {
      body: input,
    }),
  );
}

export function getBetCommission(betId: string) {
  return callApi<BetCommissionStatus>(() =>
    api.GET("/bets/{id}/commission", {
      params: { path: { id: betId } },
    }),
  );
}

export function getExploreBets(query?: BetQuery) {
  return callApi<Bet[]>(() =>
    api.GET("/bets/explore", {
      params: query ? { query } : undefined,
    }),
  );
}

export function getTrendingTopics() {
  return callApi<TrendingTopic[]>(() => api.GET("/bets/trending-topics"));
}

export function getSupportedCountries() {
  return callApi<DiscoveryCountry[]>(() => api.GET("/bets/countries"));
}


