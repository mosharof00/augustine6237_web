import { api, callApi } from "./client";
import type {
  PaymentMethod,
  StripeIntentResult,
  ConfirmStripeResult,
  BankInstructions,
  SubmitWireProofInput,
  SubmitWireProofResult,
  CryptoAddressResult,
  VerifyCryptoInput,
  VerifyCryptoResult,
} from "./types";

export function getPaymentMethods() {
  return callApi<{ methods: PaymentMethod[] }>(() =>
    api.GET("/payments/methods"),
  );
}

export function createStripePaymentIntent(amount: number, currency?: string) {
  return callApi<StripeIntentResult>(() =>
    api.POST("/payments/stripe/create-payment-intent", {
      body: { amount, currency },
    }),
  );
}

export function confirmStripePayment(paymentIntentId: string) {
  return callApi<ConfirmStripeResult>(() =>
    api.POST("/payments/stripe/confirm", {
      body: { payment_intent_id: paymentIntentId },
    }),
  );
}

export function getBankInstructions() {
  return callApi<BankInstructions>(() =>
    api.GET("/payments/bank/instructions"),
  );
}

export function submitWireProof(input: SubmitWireProofInput) {
  return callApi<SubmitWireProofResult>(() =>
    api.POST("/payments/bank/submit-wire-proof", {
      body: input,
    }),
  );
}

export function createCryptoDepositAddress(
  cryptocurrency: string,
  network: string,
) {
  return callApi<CryptoAddressResult>(() =>
    api.POST("/payments/crypto/create-deposit-address", {
      body: { cryptocurrency, network },
    }),
  );
}

export function verifyCryptoDeposit(input: VerifyCryptoInput) {
  return callApi<VerifyCryptoResult>(() =>
    api.POST("/payments/crypto/verify-deposit", {
      body: input,
    }),
  );
}

