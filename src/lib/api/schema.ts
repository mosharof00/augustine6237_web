import type {
  AuthSession,
  AuthUser,
  UserProfile,
  UserReview,
  UserPost,
  BetComment,
  Bet,
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
  WalletOverview,
  WalletTransaction,
  DepositInput,
  DepositResult,
  WithdrawInput,
  WithdrawResult,
  PaymentMethod,
  StripeIntentResult,
  ConfirmStripeResult,
  BankInstructions,
  SubmitWireProofInput,
  SubmitWireProofResult,
  CryptoAddressResult,
  VerifyCryptoInput,
  VerifyCryptoResult,
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
  GamingMatchCheck,
  SubmitGamingScoreInput,
  SubmitGamingScoreResult,
  AiBetResearch,
  ResearchBetInput,
  AiChatInput,
  AiChatResult,
  AdminOverview,
  AdminUser,
  UpdateUserStatusInput,
  UpdateUserStatusResult,
  FeatureBetInput,
  FeatureBetResult,
  AdminWithdrawal,
  ReviewWithdrawalInput,
  ReviewWithdrawalResult,
  TrendingTopic,
  DiscoveryCountry,
} from "./types";
import type { Envelope } from "./envelope";

type Json<T> = {
  responses: {
    200: {
      content: {
        "application/json": Envelope<T>;
      };
    };
  };
};

type Body<T> = {
  requestBody: {
    required: true;
    content: {
      "application/json": T;
    };
  };
};

type MethodName =
  | "get"
  | "put"
  | "post"
  | "delete"
  | "options"
  | "head"
  | "patch"
  | "trace";

type Endpoint<Used extends MethodName, Operation> = {
  [Method in Exclude<MethodName, Used>]?: never;
} & Record<Used, Operation>;

/**
 * Staff auth paths from docs/API.md section 1.
 * `npm run openapi:generate` replaces this file when a document exists.
 * No OpenAPI document was available when this task landed.
 */
export interface paths {
  "/auth/register": Endpoint<
    "post",
    Body<{
      name: string;
      email: string;
      password: string;
      phone_number?: string;
      type?: string;
    }> &
      Json<{ id: string; name: string; email: string; type?: string }>
  >;
  "/auth/login": Endpoint<
    "post",
    Body<{ email: string; password: string; fcm_token?: string }> &
      Json<AuthSession>
  >;
  "/auth/admin/register": Endpoint<
    "post",
    Body<{ email: string; password: string; name: string }> & Json<unknown>
  >;
  "/auth/admin/verify-email": Endpoint<
    "post",
    Body<{ email: string; code: string }> & Json<unknown>
  >;
  "/auth/admin/login": Endpoint<
    "post",
    Body<{ email: string; password: string }> & Json<AuthSession>
  >;
  "/auth/admin/forgot-password": Endpoint<
    "post",
    Body<{ email: string }> & Json<unknown>
  >;
  "/auth/admin/reset-password": Endpoint<
    "post",
    Body<{ token: string; password: string }> & Json<unknown>
  >;
  "/auth/school": Endpoint<
    "post",
    Body<Record<string, unknown>> & Json<unknown>
  >;
  "/auth/teacher/accept-invite": Endpoint<
    "post",
    Body<{ token: string; password: string; name: string }> & Json<AuthUser>
  >;
  "/auth/staff/login": Endpoint<
    "post",
    Body<{ email: string; password: string }> & Json<AuthSession>
  >;
  "/auth/me": Endpoint<"get", Json<AuthUser>>;
  "/auth/logout": Endpoint<"post", Json<unknown>>;
  "/auth/password": Endpoint<
    "patch",
    Body<{ current: string; next: string }> & Json<unknown>
  >;
  "/users/{id}/profile": {
    get: {
      parameters: { path: { id: string } };
      responses: {
        200: {
          content: {
            "application/json": Envelope<UserProfile>;
          };
        };
      };
    };
  };
  "/users/{id}/follow": {
    post: {
      parameters: { path: { id: string } };
      responses: {
        200: {
          content: {
            "application/json": Envelope<{
              is_following: boolean;
              followers_count: number;
            }>;
          };
        };
      };
    };
  };
  "/users/{id}/reviews": {
    get: {
      parameters: { path: { id: string } };
      responses: {
        200: {
          content: {
            "application/json": Envelope<UserReview[]>;
          };
        };
      };
    };
    post: {
      parameters: { path: { id: string } };
      requestBody: {
        required: true;
        content: {
          "application/json": { rating: number; comment?: string };
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Envelope<unknown>;
          };
        };
      };
    };
  };
  "/users/{id}/posts": {
    get: {
      parameters: { path: { id: string } };
      responses: {
        200: {
          content: {
            "application/json": Envelope<UserPost[]>;
          };
        };
      };
    };
  };
  "/posts": {
    post: {
      requestBody: {
        required: true;
        content: {
          "application/json": {
            caption?: string;
            image_url?: string;
            location_tag?: string;
          };
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Envelope<UserPost>;
          };
        };
      };
    };
  };
  "/posts/{id}": {
    delete: {
      parameters: { path: { id: string } };
      responses: {
        200: {
          content: {
            "application/json": Envelope<unknown>;
          };
        };
      };
    };
  };
  "/posts/{id}/like": {
    post: {
      parameters: { path: { id: string } };
      responses: {
        200: {
          content: {
            "application/json": Envelope<{
              is_liked: boolean;
              likes_count: number;
            }>;
          };
        };
      };
    };
  };
  "/bets": {
    get: {
      parameters?: {
        query?: {
          category?: string;
          status?: string;
          sort?: string;
          search?: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Envelope<Bet[]>;
          };
        };
      };
    };
    post: {
      requestBody: {
        required: true;
        content: {
          "application/json": CreateBetInput;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Envelope<Bet>;
          };
        };
        201: {
          content: {
            "application/json": Envelope<Bet>;
          };
        };
      };
    };
  };
  "/bets/invite/{code}": {
    get: {
      parameters: { path: { code: string } };
      responses: {
        200: {
          content: {
            "application/json": Envelope<Bet>;
          };
        };
      };
    };
  };
  "/bets/invite/{code}/join": {
    post: {
      parameters: { path: { code: string } };
      requestBody: {
        required: true;
        content: {
          "application/json": JoinBetInput;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Envelope<JoinBetResult>;
          };
        };
      };
    };
  };
  "/bets/{id}/participants": {
    get: {
      parameters: { path: { id: string } };
      responses: {
        200: {
          content: {
            "application/json": Envelope<BetParticipant[]>;
          };
        };
      };
    };
  };
  "/bets/{id}": {
    get: {
      parameters: { path: { id: string } };
      responses: {
        200: {
          content: {
            "application/json": Envelope<Bet>;
          };
        };
      };
    };
  };
  "/bets/{id}/comments": {
    get: {
      parameters: { path: { id: string } };
      responses: {
        200: {
          content: {
            "application/json": Envelope<BetComment[]>;
          };
        };
      };
    };
    post: {
      parameters: { path: { id: string } };
      requestBody: {
        required: true;
        content: {
          "application/json": {
            content: string;
            stance?: string;
          };
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Envelope<BetComment>;
          };
        };
      };
    };
  };
  "/bets/{betId}/comments/{commentId}": {
    delete: {
      parameters: { path: { betId: string; commentId: string } };
      responses: {
        200: {
          content: {
            "application/json": Envelope<unknown>;
          };
        };
      };
    };
  };
  "/bets/{id}/stake": {
    post: {
      parameters: { path: { id: string } };
      requestBody: {
        required: true;
        content: {
          "application/json": PlaceStakeInput;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Envelope<PlaceStakeResult>;
          };
        };
      };
    };
  };
  "/bets/{id}/outcomes": {
    get: {
      parameters: { path: { id: string } };
      responses: {
        200: {
          content: {
            "application/json": Envelope<BetOutcome[]>;
          };
        };
      };
    };
  };
  "/bets/{id}/matched-status": {
    get: {
      parameters: { path: { id: string } };
      responses: {
        200: {
          content: {
            "application/json": Envelope<BetMatchedStatus>;
          };
        };
      };
    };
  };
  "/bets/{id}/refund-unmatched": {
    post: {
      parameters: { path: { id: string } };
      responses: {
        200: {
          content: {
            "application/json": Envelope<RefundUnmatchedResult>;
          };
        };
      };
    };
  };
  "/bets/{id}/escrow": {
    get: {
      parameters: { path: { id: string } };
      responses: {
        200: {
          content: {
            "application/json": Envelope<BetEscrowStatus>;
          };
        };
      };
    };
  };
  "/bets/{id}/resolve": {
    post: {
      parameters: { path: { id: string } };
      requestBody: {
        required: true;
        content: {
          "application/json": ResolveBetInput;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Envelope<ResolveBetResult>;
          };
        };
      };
    };
  };
  "/fees/config": {
    get: {
      responses: {
        200: {
          content: {
            "application/json": Envelope<FeeConfig>;
          };
        };
      };
    };
    put: {
      requestBody: {
        required: true;
        content: {
          "application/json": UpdateFeeConfigInput;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Envelope<FeeConfig>;
          };
        };
      };
    };
  };
  "/bets/{id}/commission": {
    get: {
      parameters: { path: { id: string } };
      responses: {
        200: {
          content: {
            "application/json": Envelope<BetCommissionStatus>;
          };
        };
      };
    };
  };
  "/wallet": {
    get: {
      responses: {
        200: {
          content: {
            "application/json": Envelope<WalletOverview>;
          };
        };
      };
    };
  };
  "/wallet/transactions": {
    get: {
      parameters?: {
        query?: {
          type?: string;
          status?: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Envelope<WalletTransaction[]>;
          };
        };
      };
    };
  };
  "/wallet/deposit": {
    post: {
      requestBody: {
        required: true;
        content: {
          "application/json": DepositInput;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Envelope<DepositResult>;
          };
        };
      };
    };
  };
  "/wallet/withdraw": {
    post: {
      requestBody: {
        required: true;
        content: {
          "application/json": WithdrawInput;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Envelope<WithdrawResult>;
          };
        };
      };
    };
  };
  "/payments/methods": {
    get: {
      responses: {
        200: {
          content: {
            "application/json": Envelope<{ methods: PaymentMethod[] }>;
          };
        };
      };
    };
  };
  "/payments/stripe/create-payment-intent": {
    post: {
      requestBody: {
        required: true;
        content: {
          "application/json": { amount: number; currency?: string };
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Envelope<StripeIntentResult>;
          };
        };
      };
    };
  };
  "/payments/stripe/confirm": {
    post: {
      requestBody: {
        required: true;
        content: {
          "application/json": { payment_intent_id: string };
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Envelope<ConfirmStripeResult>;
          };
        };
      };
    };
  };
  "/payments/bank/instructions": {
    get: {
      responses: {
        200: {
          content: {
            "application/json": Envelope<BankInstructions>;
          };
        };
      };
    };
  };
  "/payments/bank/submit-wire-proof": {
    post: {
      requestBody: {
        required: true;
        content: {
          "application/json": SubmitWireProofInput;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Envelope<SubmitWireProofResult>;
          };
        };
      };
    };
  };
  "/payments/crypto/create-deposit-address": {
    post: {
      requestBody: {
        required: true;
        content: {
          "application/json": { cryptocurrency: string; network: string };
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Envelope<CryptoAddressResult>;
          };
        };
      };
    };
  };
  "/payments/crypto/verify-deposit": {
    post: {
      requestBody: {
        required: true;
        content: {
          "application/json": VerifyCryptoInput;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Envelope<VerifyCryptoResult>;
          };
        };
      };
    };
  };
  "/kyc/status": {
    get: {
      responses: {
        200: {
          content: {
            "application/json": Envelope<KycStatus>;
          };
        };
      };
    };
  };
  "/kyc/submit": {
    post: {
      requestBody: {
        required: true;
        content: {
          "application/json": SubmitKycInput;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Envelope<SubmitKycResult>;
          };
        };
      };
    };
  };
  "/kyc/admin/review": {
    post: {
      requestBody: {
        required: true;
        content: {
          "application/json": ReviewKycInput;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Envelope<ReviewKycResult>;
          };
        };
      };
    };
  };
  "/disputes": {
    get: {
      parameters?: {
        query?: {
          bet_id?: string;
          status?: string;
          my_disputes?: boolean;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Envelope<BetDispute[]>;
          };
        };
      };
    };
    post: {
      requestBody: {
        required: true;
        content: {
          "application/json": CreateDisputeInput;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Envelope<CreateDisputeResult>;
          };
        };
      };
    };
  };
  "/disputes/{id}": {
    get: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Envelope<BetDispute>;
          };
        };
      };
    };
  };
  "/disputes/{id}/resolve": {
    post: {
      parameters: {
        path: {
          id: string;
        };
      };
      requestBody: {
        required: true;
        content: {
          "application/json": ResolveDisputeInput;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Envelope<ResolveDisputeResult>;
          };
        };
      };
    };
  };
  "/gaming/{bet_id}/submit-score": {
    post: {
      parameters: {
        path: {
          bet_id: string;
        };
      };
      requestBody: {
        required: true;
        content: {
          "application/json": SubmitGamingScoreInput;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Envelope<SubmitGamingScoreResult>;
          };
        };
      };
    };
  };
  "/gaming/{bet_id}/match-check": {
    get: {
      parameters: {
        path: {
          bet_id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Envelope<GamingMatchCheck>;
          };
        };
      };
    };
  };
  "/ai/research-bet": {
    post: {
      requestBody: {
        required: true;
        content: {
          "application/json": ResearchBetInput;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Envelope<AiBetResearch>;
          };
        };
      };
    };
  };
  "/ai/chat": {
    post: {
      requestBody: {
        required: true;
        content: {
          "application/json": AiChatInput;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Envelope<AiChatResult>;
          };
        };
      };
    };
  };
  "/ai/bet-insights/{bet_id}": {
    get: {
      parameters: {
        path: {
          bet_id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Envelope<AiBetResearch>;
          };
        };
      };
    };
  };
  "/admin/overview": {
    get: {
      responses: {
        200: {
          content: {
            "application/json": Envelope<AdminOverview>;
          };
        };
      };
    };
  };
  "/admin/users": {
    get: {
      parameters?: {
        query?: {
          search?: string;
          status?: string;
          limit?: number;
          page?: number;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Envelope<AdminUser[]>;
          };
        };
      };
    };
  };
  "/admin/users/{id}/status": {
    patch: {
      parameters: {
        path: {
          id: string;
        };
      };
      requestBody: {
        required: true;
        content: {
          "application/json": UpdateUserStatusInput;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Envelope<UpdateUserStatusResult>;
          };
        };
      };
    };
  };
  "/admin/bets/{id}/feature": {
    post: {
      parameters: {
        path: {
          id: string;
        };
      };
      requestBody: {
        required: true;
        content: {
          "application/json": FeatureBetInput;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Envelope<FeatureBetResult>;
          };
        };
      };
    };
  };
  "/admin/withdrawals": {
    get: {
      responses: {
        200: {
          content: {
            "application/json": Envelope<AdminWithdrawal[]>;
          };
        };
      };
    };
  };
  "/admin/withdrawals/{id}/review": {
    post: {
      parameters: {
        path: {
          id: string;
        };
      };
      requestBody: {
        required: true;
        content: {
          "application/json": ReviewWithdrawalInput;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Envelope<ReviewWithdrawalResult>;
          };
        };
      };
    };
  };
  "/bets/explore": {
    get: {
      parameters?: {
        query?: {
          category?: string;
          status?: string;
          sort?: string;
          search?: string;
          country?: string;
          is_featured?: boolean;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Envelope<Bet[]>;
          };
        };
      };
    };
  };
  "/bets/trending-topics": {
    get: {
      responses: {
        200: {
          content: {
            "application/json": Envelope<TrendingTopic[]>;
          };
        };
      };
    };
  };
  "/bets/countries": {
    get: {
      responses: {
        200: {
          content: {
            "application/json": Envelope<DiscoveryCountry[]>;
          };
        };
      };
    };
  };
}
