import { api, callApi } from "./client";
import type {
  AiBetResearch,
  ResearchBetInput,
  AiChatInput,
  AiChatResult,
} from "./types";

export function researchBet(input: ResearchBetInput) {
  return callApi<AiBetResearch>(() =>
    api.POST("/ai/research-bet", {
      body: input,
    }),
  );
}

export function sendAiChat(input: AiChatInput) {
  return callApi<AiChatResult>(() =>
    api.POST("/ai/chat", {
      body: input,
    }),
  );
}

export function getBetInsights(betId: string) {
  return callApi<AiBetResearch>(() =>
    api.GET("/ai/bet-insights/{bet_id}", {
      params: {
        path: { bet_id: betId },
      },
    }),
  );
}

