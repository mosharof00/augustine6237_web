export type AuthUser = {
  id?: string;
  name?: string;
  username?: string;
  email?: string;
  phone_number?: string;
  avatar?: string;
  avatar_url?: string;
  balance?: string | number;
  type?: string;
  role?: string;
  status?: string | number;
};

export type AuthSession = {
  accessToken: string;
  refreshToken?: string;
  userId?: string;
  type?: string;
  user: AuthUser;
};

export type UserStats = {
  wins: number;
  losses: number;
  total_bets: number;
  win_rate: number;
  roi: number;
};

export type UserRatingAggregate = {
  average: number;
  count: number;
};

export type UserProfile = {
  id: string;
  name: string;
  username?: string;
  avatar?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  location?: string | null;
  type?: string;
  balance?: string | number;
  followers_count: number;
  following_count: number;
  is_following: boolean;
  stats: UserStats;
  rating: UserRatingAggregate;
};

export type UserReviewAuthor = {
  id: string;
  name: string;
  username?: string;
  avatar_url?: string | null;
};

export type UserReview = {
  id: string;
  rating: number;
  comment?: string | null;
  created_at: string;
  author?: UserReviewAuthor;
};

export type PostAuthor = {
  id: string;
  name: string;
  username?: string;
  avatar_url?: string | null;
};

export type UserPost = {
  id: string;
  caption: string;
  image_url?: string | null;
  location_tag?: string | null;
  created_at: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  author?: PostAuthor;
};

export type BetCommentAuthor = {
  id: string;
  name: string;
  username?: string;
  avatar_url?: string | null;
};

export type BetComment = {
  id: string;
  bet_id: string;
  content: string;
  stance: "BACK" | "OPPOSE" | "SPECTATOR";
  created_at: string;
  author?: BetCommentAuthor;
};

export type BetOutcome = {
  id: string;
  bet_id?: string;
  title: string;
  pool: string;
  percent: number;
  is_winner?: boolean | null;
};

export type BetCreator = {
  id: string;
  name: string;
  username?: string;
  avatar_url?: string | null;
};

export type BetParticipant = {
  id: string;
  bet_id?: string;
  user_id: string;
  outcome_id?: string | null;
  side: "BACK" | "OPPOSE" | string;
  stake: string;
  matched_stake?: string;
  unmatched_stake?: string;
  match_status?: "UNMATCHED" | "PARTIALLY_MATCHED" | "MATCHED" | "REFUNDED" | string;
  refunded_amount?: string;
  is_winner?: boolean | null;
  payout_amount?: string;
  payout_status?: "PENDING" | "PAID" | "LOST" | "REFUNDED" | string;
  gross_payout?: string;
  commission_deducted?: string;
  net_payout?: string;
  created_at: string;
  user?: BetCreator;
};

export type Bet = {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  bet_type?: "BINARY" | "CUSTOM";
  creator_id: string;
  status: string;
  is_private: boolean;
  invite_code?: string | null;
  deadline?: string | null;
  total_pool: string;
  back_pool: string;
  oppose_pool: string;
  matched_pool?: string;
  unmatched_pool?: string;
  winning_side?: string | null;
  winning_outcome_id?: string | null;
  resolved_at?: string | null;
  payout_pool?: string;
  escrow_status?: "LOCKED" | "SETTLED" | "REFUNDED" | "DISPUTED" | string;
  commission_rate?: string | number;
  commission_amount?: string | number;
  is_featured?: boolean;
  country?: string | null;
  comments_count: number;
  created_at: string;
  creator?: BetCreator;
  participants?: BetParticipant[];
  outcomes?: BetOutcome[];
};

export type BetQuery = {
  category?: string;
  status?: string;
  sort?: "trending" | "ending_soon" | "newest" | string;
  search?: string;
  country?: string;
  is_featured?: boolean;
};

export type CreateBetInput = {
  title: string;
  description?: string;
  category?: string;
  bet_type?: "BINARY" | "CUSTOM";
  outcomes?: string[];
  initial_outcome?: string;
  deadline: string;
  is_private?: boolean;
  initial_stake?: number;
  initial_side?: "BACK" | "OPPOSE";
};

export type JoinBetInput = {
  side?: "BACK" | "OPPOSE" | string;
  outcome_id?: string;
  stake: number;
};

export type PlaceStakeInput = {
  outcome_id?: string;
  side?: "BACK" | "OPPOSE" | string;
  stake: number;
};

export type PlaceStakeResult = {
  bet: {
    id: string;
    total_pool: string;
    back_pool?: string;
    oppose_pool?: string;
    outcomes?: BetOutcome[];
  };
  participant: BetParticipant;
};

export type JoinBetResult = {
  bet: {
    id: string;
    total_pool: string;
    back_pool?: string;
    oppose_pool?: string;
    outcomes?: BetOutcome[];
  };
  participant: BetParticipant;
};

export type BetMatchedStatus = {
  bet_id: string;
  bet_type?: "BINARY" | "CUSTOM";
  total_pool: string;
  matched_pool: string;
  unmatched_pool: string;
  back_pool: string;
  oppose_pool: string;
  back_matched: string;
  oppose_matched: string;
  back_unmatched: string;
  oppose_unmatched: string;
  back_odds: string;
  oppose_odds: string;
  odds?: Record<string, number | string>;
  participants: BetParticipant[];
};

export type RefundUnmatchedResult = {
  bet_id: string;
  refunded_count: number;
  total_refunded: string;
  message?: string;
};

export type EscrowPayoutItem = {
  participant_id: string;
  user_id: string;
  user_name: string;
  side: string;
  outcome_id?: string | null;
  outcome_title?: string | null;
  stake: string;
  matched_stake: string;
  payout_amount: string;
  profit: string;
  roi_percent: number;
  is_winner?: boolean | null;
  payout_status: string;
  gross_payout?: string;
  commission_deducted?: string;
  net_payout?: string;
};

export type BetEscrowStatus = {
  bet_id: string;
  title: string;
  status: string;
  escrow_status: string;
  total_escrow: string;
  matched_pool: string;
  unmatched_pool: string;
  payout_pool: string;
  commission_rate?: string | number;
  commission_amount?: string | number;
  winning_side?: string | null;
  winning_outcome_id?: string | null;
  resolved_at?: string | null;
  winners_count: number;
  losers_count: number;
  payouts: EscrowPayoutItem[];
};

export type ResolveBetInput = {
  winning_side?: "BACK" | "OPPOSE";
  winning_outcome_id?: string;
};

export type ResolveBetResult = {
  bet_id: string;
  status: string;
  escrow_status: string;
  winning_side?: string;
  winning_outcome_id?: string;
  total_payout: string;
  total_refunded_unmatched: string;
  winners_count: number;
  payouts: Array<{
    participant_id: string;
    user_id: string;
    matched_stake: string;
    payout_amount: string;
    is_winner: boolean;
  }>;
};

export type FeeConfig = {
  commission_rate: string;
  applies_to_profit: boolean;
  description?: string | null;
  updated_at?: string;
};

export type UpdateFeeConfigInput = {
  commission_rate: number;
  description?: string;
};

export type ParticipantFeeItem = {
  participant_id: string;
  user_id: string;
  user_name: string;
  side: string;
  matched_stake: string;
  gross_payout: string;
  net_profit: string;
  commission_deducted: string;
  net_payout: string;
};

export type BetCommissionStatus = {
  bet_id: string;
  title: string;
  status: string;
  commission_rate: string;
  gross_payout_pool: string;
  total_commission_collected: string;
  net_payout_pool: string;
  participant_fees: ParticipantFeeItem[];
};

export type WalletOverview = {
  user_id: string;
  balance: string;
  escrow_locked: string;
  total_deposited: string;
  total_withdrawn: string;
  currency: string;
};

export type WalletTransaction = {
  id: string;
  user_id: string;
  type: string;
  amount: string;
  currency: string;
  status: string;
  description: string;
  reference_id?: string;
  destination_details?: string | null;
  created_at: string;
};

export type DepositInput = {
  amount: number;
  payment_method?: string;
  description?: string;
};

export type DepositResult = {
  transaction_id: string;
  amount: string;
  new_balance: string;
  currency: string;
  status: string;
  created_at: string;
};

export type WithdrawInput = {
  amount: number;
  payout_method?: string;
  destination_details?: string;
};

export type WithdrawResult = {
  transaction_id: string;
  amount: string;
  new_balance: string;
  currency: string;
  status: string;
  destination_details?: string | null;
  created_at: string;
};

export type PaymentMethod = {
  id: string;
  name: string;
  provider: string;
  type: string;
  currencies: string[];
  min_deposit: number;
  max_deposit: number;
  fee_percent: string;
  processing_time: string;
  is_enabled: boolean;
};

export type StripeIntentResult = {
  payment_intent_id: string;
  client_secret: string;
  amount: string;
  currency: string;
  transaction_id: string;
};

export type ConfirmStripeResult = {
  transaction_id: string;
  amount: string;
  new_balance: string;
  currency: string;
  status: string;
  reference_number: string;
};

export type BankInstructions = {
  beneficiary_name: string;
  bank_name: string;
  swift_bic: string;
  iban: string;
  account_number: string;
  routing_number: string;
  reference_prefix: string;
  notes: string;
};

export type SubmitWireProofInput = {
  amount: number;
  currency?: string;
  sender_bank: string;
  reference_number: string;
  proof_url?: string;
  notes?: string;
};

export type SubmitWireProofResult = {
  transaction_id: string;
  amount: string;
  currency: string;
  status: string;
  reference_number: string;
  created_at: string;
};

export type CryptoAddressResult = {
  cryptocurrency: string;
  network: string;
  deposit_address: string;
  memo_or_tag?: string | null;
  min_deposit: string;
  estimated_confirmations: number;
};

export type VerifyCryptoInput = {
  tx_hash: string;
  cryptocurrency: string;
  network: string;
  amount: number;
};

export type VerifyCryptoResult = {
  transaction_id: string;
  amount: string;
  new_balance: string;
  currency: string;
  status: string;
  reference_number: string;
};

export type KycStatus = {
  user_id: string;
  kyc_status: string; // UNVERIFIED, PENDING, VERIFIED, REJECTED
  document_type?: string | null;
  document_url?: string | null;
  submitted_at?: string | null;
  verified_at?: string | null;
  rejection_reason?: string | null;
  can_deposit_large: boolean;
  can_create_high_stakes: boolean;
};

export type SubmitKycInput = {
  document_type: string;
  document_number: string;
  document_url: string;
  full_name?: string;
  country?: string;
  date_of_birth?: string;
};

export type SubmitKycResult = {
  kyc_status: string;
  document_type: string;
  submitted_at: string;
};

export type ReviewKycInput = {
  user_id: string;
  status: "VERIFIED" | "REJECTED";
  rejection_reason?: string;
};

export type ReviewKycResult = {
  user_id: string;
  kyc_status: string;
  verified_at?: string | null;
};

export type BetDispute = {
  id: string;
  bet_id: string;
  creator_id: string;
  reason: string;
  description: string;
  evidence_url?: string | null;
  status: string; // OPEN, UNDER_REVIEW, RESOLVED, REJECTED
  resolution?: string | null;
  resolution_notes?: string | null;
  created_at: string;
  bet?: {
    id: string;
    title: string;
  };
  creator?: {
    id: string;
    username?: string;
    name?: string;
  };
};

export type CreateDisputeInput = {
  bet_id: string;
  reason: string;
  description: string;
  evidence_url?: string;
};

export type CreateDisputeResult = {
  dispute_id: string;
  bet_id: string;
  reason: string;
  status: string;
  evidence_url?: string | null;
  created_at: string;
};

export type ResolveDisputeInput = {
  resolution: "UPHOLD_ORIGINAL" | "OVERTURN_RESULT" | "REFUND_ALL";
  resolution_notes: string;
  new_winning_side?: string;
  new_winning_outcome_id?: string;
};

export type ResolveDisputeResult = {
  dispute_id: string;
  bet_id: string;
  status: string;
  resolution: string;
  resolution_notes: string;
  resolved_at: string;
};

export type GamingSubmission = {
  player_id: string;
  gamertag?: string | null;
  platform: string;
  my_score: number;
  opponent_score: number;
  proof_url?: string | null;
  submitted_at?: string;
  player_name?: string;
};

export type GamingMatchCheck = {
  bet_id: string;
  match_status: "AWAITING_SUBMISSIONS" | "AWAITING_OPPONENT" | "MATCHED" | "MISMATCH";
  submissions: GamingSubmission[];
  dispute_id?: string | null;
  winner_id?: string | null;
  is_auto_resolved?: boolean;
  is_auto_disputed?: boolean;
};

export type SubmitGamingScoreInput = {
  my_score: number;
  opponent_score: number;
  platform?: string;
  gamertag?: string;
  proof_url?: string;
};

export type SubmitGamingScoreResult = {
  bet_id: string;
  status: "MATCHED" | "MISMATCH" | "AWAITING_OPPONENT";
  is_auto_resolved?: boolean;
  is_auto_disputed?: boolean;
  winner_id?: string | null;
  dispute_id?: string | null;
  scores?: {
    player_1_score: number;
    player_2_score: number;
  };
  conflict?: {
    player_1_claim: string;
    player_2_claim: string;
  };
};

export type AiMarketSentiment = {
  back_percentage: number;
  oppose_percentage: number;
  consensus: string;
};

export type AiBetResearch = {
  bet_id: string;
  topic: string;
  summary: string;
  key_factors: string[];
  market_sentiment: AiMarketSentiment;
  suggested_stance: "BACK" | "OPPOSE" | "NEUTRAL";
  confidence_score: number;
  risk_level: "LOW" | "MODERATE" | "HIGH";
  sources: string[];
  generated_at?: string;
};

export type ResearchBetInput = {
  bet_id: string;
  prompt?: string;
};

export type AiChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AiChatInput = {
  query: string;
  bet_id?: string;
  history?: AiChatMessage[];
};

export type AiChatResult = {
  reply: string;
  suggestions: string[];
  sources?: string[];
};

export type AdminOverview = {
  total_users: number;
  active_bets: number;
  total_escrow_locked: number;
  total_volume_traded: number;
  total_commissions_earned: number;
  pending_withdrawals_count: number;
  open_disputes_count: number;
  unverified_kyc_count: number;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  username?: string;
  role: string;
  status: string;
  kyc_status: string;
  wallet_balance: number;
  escrow_locked: number;
  created_at: string;
};

export type UpdateUserStatusInput = {
  status: string;
  reason?: string;
};

export type UpdateUserStatusResult = {
  user_id: string;
  status: string;
  updated_at: string;
};

export type FeatureBetInput = {
  is_featured: boolean;
};

export type FeatureBetResult = {
  bet_id: string;
  is_featured: boolean;
};

export type AdminWithdrawal = {
  id: string;
  user_id: string;
  user_name: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  destination: string;
  created_at: string;
};

export type ReviewWithdrawalInput = {
  action: "APPROVED" | "REJECTED";
  notes?: string;
};

export type ReviewWithdrawalResult = {
  transaction_id: string;
  status: string;
  action: string;
  processed_at: string;
};

export type TrendingTopic = {
  tag: string;
  category: string;
  active_bets_count: number;
  total_volume: number;
};

export type DiscoveryCountry = {
  code: string;
  name: string;
  count: number;
};


