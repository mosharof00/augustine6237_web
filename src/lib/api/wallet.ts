import { api, callApi } from "./client";
import type {
  WalletOverview,
  WalletTransaction,
  DepositInput,
  DepositResult,
  WithdrawInput,
  WithdrawResult,
} from "./types";

export function getWallet() {
  return callApi<WalletOverview>(() => api.GET("/wallet"));
}

export function getWalletTransactions(query?: {
  type?: string;
  status?: string;
}) {
  return callApi<WalletTransaction[]>(() =>
    api.GET("/wallet/transactions", {
      params: query ? { query } : undefined,
    }),
  );
}

export function depositWallet(input: DepositInput) {
  return callApi<DepositResult>(() =>
    api.POST("/wallet/deposit", {
      body: input,
    }),
  );
}

export function withdrawWallet(input: WithdrawInput) {
  return callApi<WithdrawResult>(() =>
    api.POST("/wallet/withdraw", {
      body: input,
    }),
  );
}

