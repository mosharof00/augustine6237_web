"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getExploreBets,
  getTrendingTopics,
  getSupportedCountries,
  placeStake,
  getBetMatchedStatus,
  refundUnmatchedStakes,
  getBetEscrowStatus,
  resolveBet,
  getBetCommission,
} from "@/lib/api/bets";
import {
  getWallet,
  getWalletTransactions,
  depositWallet,
  withdrawWallet,
} from "@/lib/api/wallet";
import {
  createStripePaymentIntent,
  confirmStripePayment,
  submitWireProof,
  verifyCryptoDeposit,
} from "@/lib/api/payments";
import {
  getKycStatus,
  submitKyc,
  getDisputes,
  createDispute,
  resolveDispute,
} from "@/lib/api/kyc-disputes";
import {
  submitGamingScore,
  getGamingMatchCheck,
} from "@/lib/api/gaming";
import {
  researchBet,
  sendAiChat,
  getBetInsights,
} from "@/lib/api/ai";
import {
  getAdminOverview,
  getAdminUsers,
  updateUserStatus,
  featureBet,
  getAdminWithdrawals,
  reviewWithdrawal,
} from "@/lib/api/admin";
import type { Bet, AiChatMessage } from "@/lib/api/types";
import { BetCard } from "./bet-card";
import { CreateBetModal } from "./create-bet-modal";
import { JoinInviteModal } from "./join-invite-modal";
import { BetDiscussionThread } from "./bet-discussion-thread";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Search,
  Flame,
  Clock,
  Sparkles,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Coins,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Scale,
  Undo2,
  User,
  Trophy,
  ShieldCheck,
  Gavel,
  Gamepad2,
  Lock,
  Percent,
  Wallet,
  Send,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";

const CATEGORY_TABS = [
  { id: "ALL", label: "All Markets" },
  { id: "SPORTS", label: "Sports" },
  { id: "POLITICS", label: "Politics" },
  { id: "CRYPTO", label: "Crypto" },
  { id: "ENTERTAINMENT", label: "Entertainment" },
  { id: "PUBLIC_ISSUES", label: "Public Issues" },
];

export function BetsFeed() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedSort, setSelectedSort] = useState<"trending" | "ending_soon" | "newest">("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("GLOBAL");
  const [onlyFeatured, setOnlyFeatured] = useState(false);

  // Discussion state
  const [activeDiscussionBet, setActiveDiscussionBet] = useState<Bet | null>(null);

  // Matched Betting Engine modal state
  const [matchedStatusBet, setMatchedStatusBet] = useState<Bet | null>(null);
  const [isRefunding, setIsRefunding] = useState(false);

  // Escrow & Automated Payout Pool modal state
  const [escrowBet, setEscrowBet] = useState<Bet | null>(null);
  const [commissionBet, setCommissionBet] = useState<Bet | null>(null);
  const [resolveBetTarget, setResolveBetTarget] = useState<Bet | null>(null);
  const [resolveWinningSide, setResolveWinningSide] = useState<"BACK" | "OPPOSE">("BACK");
  const [resolveOutcomeId, setResolveOutcomeId] = useState<string>("");
  const [isResolving, setIsResolving] = useState(false);

  // User Wallet modal state
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(100);
  const [depositMethod, setDepositMethod] = useState<string>("CARD");
  const [wireSenderBank, setWireSenderBank] = useState<string>("Chase Bank");
  const [wireReference, setWireReference] = useState<string>("BS-DEPOSIT-98213");
  const [cryptoAsset, setCryptoAsset] = useState<string>("USDT");
  const [cryptoNetwork, setCryptoNetwork] = useState<string>("POLYGON");
  const [cryptoTxHash, setCryptoTxHash] = useState<string>("0x98fe142bcda9871101fa23");
  const [isDepositing, setIsDepositing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(50);
  const [withdrawMethod, setWithdrawMethod] = useState<string>("BANK_TRANSFER");
  const [withdrawDestination, setWithdrawDestination] = useState<string>(
    "IBAN GB82WEST12345698765432",
  );
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // KYC Verification state
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [kycDocType, setKycDocType] = useState<string>("PASSPORT");
  const [kycDocNumber, setKycDocNumber] = useState<string>("P12345678");
  const [kycDocUrl, setKycDocUrl] = useState<string>(
    "https://storage.betsocial.app/kyc/doc_passport_123.jpg",
  );
  const [kycFullName, setKycFullName] = useState<string>("Alex Mercer");
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);

  // Disputes state
  const [isDisputesModalOpen, setIsDisputesModalOpen] = useState(false);
  const [disputeTargetBet, setDisputeTargetBet] = useState<Bet | null>(null);
  const [disputeReason, setDisputeReason] = useState<string>("INCORRECT_RESULT");
  const [disputeDescription, setDisputeDescription] = useState<string>(
    "Official match referee report confirms Arsenal scored in the 94th minute.",
  );
  const [disputeEvidenceUrl, setDisputeEvidenceUrl] = useState<string>(
    "https://storage.betsocial.app/evidence/referee_report_94.pdf",
  );
  const [isFilingDispute, setIsFilingDispute] = useState(false);

  // Gaming Result Check state
  const [gamingTargetBet, setGamingTargetBet] = useState<Bet | null>(null);
  const [gamingPlatform, setGamingPlatform] = useState<string>("PLAYSTATION");
  const [gamingGamertag, setGamingGamertag] = useState<string>("Player_1");
  const [gamingMyScore, setGamingMyScore] = useState<number>(3);
  const [gamingOpponentScore, setGamingOpponentScore] = useState<number>(1);
  const [gamingProofUrl, setGamingProofUrl] = useState<string>(
    "https://storage.betsocial.app/gaming/ps5_match.png",
  );
  const [isSubmittingGaming, setIsSubmittingGaming] = useState<boolean>(false);

  // AI Research Assistant modal state
  const [aiTargetBet, setAiTargetBet] = useState<Bet | null>(null);
  const [aiChatQuery, setAiChatQuery] = useState<string>("");
  const [aiChatHistory, setAiChatHistory] = useState<AiChatMessage[]>([]);
  const [isAiChatLoading, setIsAiChatLoading] = useState<boolean>(false);

  // Admin Control Panel state
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminTab, setAdminTab] = useState<"overview" | "users" | "withdrawals">("overview");
  const [adminUserSearch, setAdminUserSearch] = useState("");
  const [isAdminActionLoading, setIsAdminActionLoading] = useState(false);

  // Quick Stake confirmation dialog state
  const [stakeTargetBet, setStakeTargetBet] = useState<Bet | null>(null);
  const [stakeStance, setStakeStance] = useState<"BACK" | "OPPOSE">("BACK");
  const [selectedOutcomeId, setSelectedOutcomeId] = useState<string>("");
  const [stakeAmount, setStakeAmount] = useState<number>(25);
  const [isStaking, setIsStaking] = useState(false);

  const {
    data: bets = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Bet[]>({
    queryKey: [
      "public-bets",
      selectedCategory,
      selectedSort,
      searchQuery,
      selectedCountry,
      onlyFeatured,
    ],
    queryFn: () =>
      getExploreBets({
        category: selectedCategory === "ALL" ? undefined : selectedCategory,
        sort: selectedSort,
        search: searchQuery.trim() || undefined,
        country: selectedCountry === "GLOBAL" ? undefined : selectedCountry,
        is_featured: onlyFeatured ? true : undefined,
      }),
  });

  const { data: trendingTopics = [] } = useQuery({
    queryKey: ["trending-topics"],
    queryFn: () => getTrendingTopics(),
  });

  const { data: supportedCountries = [] } = useQuery({
    queryKey: ["supported-countries"],
    queryFn: () => getSupportedCountries(),
  });

  const {
    data: matchedStatus,
    isLoading: isMatchedLoading,
    refetch: refetchMatchedStatus,
  } = useQuery({
    queryKey: ["bet-matched-status", matchedStatusBet?.id],
    queryFn: () => getBetMatchedStatus(matchedStatusBet!.id),
    enabled: Boolean(matchedStatusBet),
  });

  const {
    data: escrowStatus,
    isLoading: isEscrowLoading,
    refetch: refetchEscrowStatus,
  } = useQuery({
    queryKey: ["bet-escrow-status", escrowBet?.id],
    queryFn: () => getBetEscrowStatus(escrowBet!.id),
    enabled: Boolean(escrowBet),
  });

  const {
    data: commissionStatus,
    isLoading: isCommissionLoading,
  } = useQuery({
    queryKey: ["bet-commission-status", commissionBet?.id],
    queryFn: () => getBetCommission(commissionBet!.id),
    enabled: Boolean(commissionBet),
  });

  const {
    data: walletOverview,
    refetch: refetchWallet,
  } = useQuery({
    queryKey: ["user-wallet"],
    queryFn: () => getWallet(),
  });

  const {
    data: transactions = [],
    isLoading: isTransactionsLoading,
    refetch: refetchTransactions,
  } = useQuery({
    queryKey: ["user-transactions"],
    queryFn: () => getWalletTransactions(),
    enabled: isWalletOpen,
  });

  const {
    data: kycStatusData,
    refetch: refetchKyc,
  } = useQuery({
    queryKey: ["user-kyc-status"],
    queryFn: () => getKycStatus(),
  });

  const {
    data: disputesList = [],
    isLoading: isDisputesLoading,
    refetch: refetchDisputes,
  } = useQuery({
    queryKey: ["bet-disputes"],
    queryFn: () => getDisputes(),
    enabled: isDisputesModalOpen,
  });

  const {
    data: gamingMatchStatus,
    isLoading: isGamingMatchLoading,
    refetch: refetchGamingMatch,
  } = useQuery({
    queryKey: ["gaming-match-check", gamingTargetBet?.id],
    queryFn: () => getGamingMatchCheck(gamingTargetBet!.id),
    enabled: Boolean(gamingTargetBet),
  });

  async function handleGamingSubmitScore(e: React.FormEvent) {
    e.preventDefault();
    if (!gamingTargetBet) return;
    setIsSubmittingGaming(true);
    try {
      const res = await submitGamingScore(gamingTargetBet.id, {
        my_score: Number(gamingMyScore),
        opponent_score: Number(gamingOpponentScore),
        platform: gamingPlatform,
        gamertag: gamingGamertag,
        proof_url: gamingProofUrl,
      });

      if (res.status === "MATCHED") {
        toast.success("Scores matched! Dual-player verification succeeded and payouts distributed.");
      } else if (res.status === "MISMATCH") {
        toast.error(`Score mismatch detected! Escalated to dispute #${res.dispute_id}. Escrow locked.`);
      } else {
        toast.success("Score submitted! Awaiting opponent confirmation.");
      }
      refetchGamingMatch();
      refetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit gaming score");
    } finally {
      setIsSubmittingGaming(false);
    }
  }

  const {
    data: aiResearchData,
    isLoading: isAiResearchLoading,
    refetch: refetchAiResearch,
  } = useQuery({
    queryKey: ["ai-bet-research", aiTargetBet?.id],
    queryFn: () => getBetInsights(aiTargetBet!.id),
    enabled: Boolean(aiTargetBet),
  });

  async function handleRunAiResearch(prompt?: string) {
    if (!aiTargetBet) return;
    try {
      await researchBet({
        bet_id: aiTargetBet.id,
        prompt: prompt || undefined,
      });
      toast.success("AI research intelligence updated!");
      refetchAiResearch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "AI research failed");
    }
  }

  async function handleSendAiChat(e: React.FormEvent) {
    e.preventDefault();
    if (!aiChatQuery.trim()) return;
    const userQuery = aiChatQuery.trim();
    setAiChatQuery("");
    const newHistory: AiChatMessage[] = [
      ...aiChatHistory,
      { role: "user", content: userQuery },
    ];
    setAiChatHistory(newHistory);
    setIsAiChatLoading(true);

    try {
      const res = await sendAiChat({
        query: userQuery,
        bet_id: aiTargetBet?.id,
        history: newHistory,
      });
      setAiChatHistory([
        ...newHistory,
        { role: "assistant", content: res.reply },
      ]);
    } catch {
      setAiChatHistory([
        ...newHistory,
        { role: "assistant", content: "Error generating AI response. Please try again." },
      ]);
    } finally {
      setIsAiChatLoading(false);
    }
  }

  const {
    data: adminOverview,
    isLoading: isAdminOverviewLoading,
    refetch: refetchAdminOverview,
  } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => getAdminOverview(),
    enabled: isAdminModalOpen,
  });

  const {
    data: adminUsers = [],
    isLoading: isAdminUsersLoading,
    refetch: refetchAdminUsers,
  } = useQuery({
    queryKey: ["admin-users", adminUserSearch],
    queryFn: () => getAdminUsers({ search: adminUserSearch || undefined }),
    enabled: isAdminModalOpen && adminTab === "users",
  });

  const {
    data: adminWithdrawals = [],
    isLoading: isAdminWithdrawalsLoading,
    refetch: refetchAdminWithdrawals,
  } = useQuery({
    queryKey: ["admin-withdrawals"],
    queryFn: () => getAdminWithdrawals(),
    enabled: isAdminModalOpen && adminTab === "withdrawals",
  });

  async function handleToggleUserStatus(userId: string, currentStatus: string) {
    setIsAdminActionLoading(true);
    try {
      const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
      await updateUserStatus(userId, {
        status: nextStatus,
        reason: nextStatus === "SUSPENDED" ? "Account flagged for administrative review" : "Account reactivated by administrator",
      });
      toast.success(`User status updated to ${nextStatus}`);
      refetchAdminUsers();
      refetchAdminOverview();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update user status");
    } finally {
      setIsAdminActionLoading(false);
    }
  }

  async function handleToggleBetFeature(betId: string, currentFeatured: boolean) {
    try {
      await featureBet(betId, { is_featured: !currentFeatured });
      toast.success(!currentFeatured ? "Bet promoted as featured!" : "Bet removed from featured");
      refetch();
      refetchAdminOverview();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update bet feature status");
    }
  }

  async function handleReviewWithdrawalAction(txId: string, action: "APPROVED" | "REJECTED") {
    setIsAdminActionLoading(true);
    try {
      await reviewWithdrawal(txId, {
        action,
        notes: action === "APPROVED" ? "Release confirmed via bank settlement" : "Payout rejected and refunded to wallet",
      });
      toast.success(action === "APPROVED" ? "Withdrawal payout approved!" : "Withdrawal rejected and refunded");
      refetchAdminWithdrawals();
      refetchAdminOverview();
      refetchWallet();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to process withdrawal");
    } finally {
      setIsAdminActionLoading(false);
    }
  }

  async function handleKycSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setIsSubmittingKyc(true);
      const res = await submitKyc({
        document_type: kycDocType,
        document_number: kycDocNumber,
        document_url: kycDocUrl,
        full_name: kycFullName,
      });
      toast.success(
        `KYC document submitted (${res.document_type}). Status: ${res.kyc_status}!`,
      );
      refetchKyc();
      setIsKycModalOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "KYC submission failed");
    } finally {
      setIsSubmittingKyc(false);
    }
  }

  async function handleDisputeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!disputeTargetBet) return;
    try {
      setIsFilingDispute(true);
      const res = await createDispute({
        bet_id: disputeTargetBet.id,
        reason: disputeReason,
        description: disputeDescription,
        evidence_url: disputeEvidenceUrl,
      });
      toast.success(`Dispute #${res.dispute_id} filed! Escrow frozen for review.`);
      setDisputeTargetBet(null);
      refetch();
      refetchDisputes();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to file dispute");
    } finally {
      setIsFilingDispute(false);
    }
  }

  async function handleResolveDispute(disputeId: string, resolution: "UPHOLD_ORIGINAL" | "OVERTURN_RESULT" | "REFUND_ALL") {
    try {
      const res = await resolveDispute(disputeId, {
        resolution,
        resolution_notes: `Dispute adjudicated: ${resolution}`,
        new_winning_side: "BACK",
      });
      toast.success(`Dispute #${res.dispute_id} resolved with ${res.resolution}!`);
      refetchDisputes();
      refetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Dispute adjudication failed");
    }
  }

  async function handleDepositSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (depositAmount <= 0) {
      toast.error("Deposit amount must be greater than zero");
      return;
    }
    try {
      setIsDepositing(true);
      if (depositMethod === "CARD") {
        const intent = await createStripePaymentIntent(depositAmount, "USD");
        const confirmed = await confirmStripePayment(intent.payment_intent_id);
        toast.success(
          `Card deposit of $${confirmed.amount} confirmed via Stripe! New balance: $${confirmed.new_balance}`,
        );
      } else if (depositMethod === "BANK_TRANSFER") {
        const wire = await submitWireProof({
          amount: depositAmount,
          sender_bank: wireSenderBank,
          reference_number: wireReference,
          notes: "Wire transferred via web client",
        });
        toast.success(
          `Bank wire proof submitted (${wire.reference_number}). Awaiting confirmation!`,
        );
      } else if (depositMethod === "CRYPTO") {
        const cryptoRes = await verifyCryptoDeposit({
          tx_hash: cryptoTxHash,
          cryptocurrency: cryptoAsset,
          network: cryptoNetwork,
          amount: depositAmount,
        });
        toast.success(
          `Crypto deposit verified! Credited $${cryptoRes.amount}. New balance: $${cryptoRes.new_balance}`,
        );
      } else {
        const res = await depositWallet({
          amount: depositAmount,
          payment_method: depositMethod,
          description: `Deposit via ${depositMethod}`,
        });
        toast.success(
          `Successfully deposited $${res.amount}! New balance: $${res.new_balance}`,
        );
      }
      refetchWallet();
      refetchTransactions();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Deposit failed");
    } finally {
      setIsDepositing(false);
    }
  }

  async function handleWithdrawSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (withdrawAmount <= 0) {
      toast.error("Withdrawal amount must be greater than zero");
      return;
    }
    try {
      setIsWithdrawing(true);
      const res = await withdrawWallet({
        amount: withdrawAmount,
        payout_method: withdrawMethod,
        destination_details: withdrawDestination,
      });
      toast.success(
        `Withdrawal of $${res.amount} submitted! Remaining balance: $${res.new_balance}`,
      );
      refetchWallet();
      refetchTransactions();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Withdrawal failed");
    } finally {
      setIsWithdrawing(false);
    }
  }

  async function handleRefundUnmatched() {
    if (!matchedStatusBet) return;
    try {
      setIsRefunding(true);
      const res = await refundUnmatchedStakes(matchedStatusBet.id);
      toast.success(res.message || `Refunded $${res.total_refunded} unmatched stakes!`);
      refetchMatchedStatus();
      queryClient.invalidateQueries({ queryKey: ["public-bets"] });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Refund failed";
      toast.error(msg);
    } finally {
      setIsRefunding(false);
    }
  }

  async function handleResolveSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!resolveBetTarget) return;

    const isCustom =
      resolveBetTarget.bet_type === "CUSTOM" &&
      resolveBetTarget.outcomes &&
      resolveBetTarget.outcomes.length > 0;
    const outcomeId = isCustom
      ? resolveOutcomeId || resolveBetTarget.outcomes?.[0]?.id
      : undefined;

    try {
      setIsResolving(true);
      const res = await resolveBet(resolveBetTarget.id, {
        winning_side: isCustom ? undefined : resolveWinningSide,
        winning_outcome_id: outcomeId,
      });

      toast.success(
        `Bet resolved! Paid $${res.total_payout} to ${res.winners_count} winner(s). Wallet credited.`,
      );
      queryClient.invalidateQueries({ queryKey: ["public-bets"] });
      refetchEscrowStatus();
      setResolveBetTarget(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Resolution failed";
      toast.error(msg);
    } finally {
      setIsResolving(false);
    }
  }

  async function handleStakeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stakeTargetBet) return;
    if (stakeAmount <= 0) {
      toast.error("Please enter a valid stake amount");
      return;
    }

    const isCustom =
      stakeTargetBet.bet_type === "CUSTOM" && stakeTargetBet.outcomes?.length;
    const outcomeId = isCustom
      ? selectedOutcomeId || stakeTargetBet.outcomes?.[0]?.id
      : undefined;

    try {
      setIsStaking(true);
      await placeStake(stakeTargetBet.id, {
        outcome_id: outcomeId,
        side: isCustom ? undefined : stakeStance,
        stake: stakeAmount,
      });

      toast.success(
        `Successfully placed $${stakeAmount} on "${stakeTargetBet.title}"! Escrow locked.`,
      );
      queryClient.invalidateQueries({ queryKey: ["public-bets"] });
      setStakeTargetBet(null);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to place stake",
      );
    } finally {
      setIsStaking(false);
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Top Banner / Controls */}
      <div className="rounded-2xl border border-[#233044] bg-[#162032]/70 p-5 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
              <Flame className="size-6 text-[#0EA5E9]" />
              Public Prediction Markets
            </h1>
            <p className="mt-1 text-xs md:text-sm text-slate-400">
              Back or Oppose real-world outcomes across Sports, Politics, Crypto, and Global Events.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsWalletOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all shadow-md shadow-emerald-950/20"
              title="Open User Wallet & Ledger"
            >
              <Wallet className="size-4" />
              <span>
                ${walletOverview ? parseFloat(walletOverview.balance).toFixed(2) : "0.00"}
              </span>
            </button>
            <button
              onClick={() => setIsKycModalOpen(true)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all shadow-md ${
                kycStatusData?.kyc_status === "VERIFIED"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                  : kycStatusData?.kyc_status === "PENDING"
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                    : "border-sky-500/30 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20"
              }`}
              title="Identity & KYC Status"
            >
              <ShieldCheck className="size-4" />
              <span>
                {kycStatusData?.kyc_status === "VERIFIED"
                  ? "KYC Verified"
                  : kycStatusData?.kyc_status === "PENDING"
                    ? "KYC Pending"
                    : "Verify KYC"}
              </span>
            </button>
            <button
              onClick={() => setIsDisputesModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-all shadow-md"
              title="Disputes & Arbitration"
            >
              <Gavel className="size-4" />
              <span>Disputes</span>
            </button>
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-xs font-bold text-indigo-400 hover:bg-indigo-500/20 transition-all shadow-md"
              title="Admin Control Panel"
            >
              <ShieldAlert className="size-4" />
              <span>Admin Panel</span>
            </button>
            <JoinInviteModal />
            <CreateBetModal />
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-5 flex flex-col gap-3 pt-3 border-t border-[#233044]/80 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search markets or topics..."
              className="w-full rounded-lg border border-[#233044] bg-[#0B1222] pl-9 pr-3.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
            />
          </div>

          {/* Sort Buttons */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
              Sort:
            </span>
            <button
              onClick={() => setSelectedSort("trending")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedSort === "trending"
                  ? "bg-[#0EA5E9]/20 text-sky-400 border border-sky-500/30"
                  : "bg-slate-800/60 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Flame className="size-3.5" />
              Trending
            </button>
            <button
              onClick={() => setSelectedSort("ending_soon")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedSort === "ending_soon"
                  ? "bg-[#0EA5E9]/20 text-sky-400 border border-sky-500/30"
                  : "bg-slate-800/60 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Clock className="size-3.5" />
              Ending Soon
            </button>
            <button
              onClick={() => setSelectedSort("newest")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedSort === "newest"
                  ? "bg-[#0EA5E9]/20 text-sky-400 border border-sky-500/30"
                  : "bg-slate-800/60 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="size-3.5" />
              Newest
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === tab.id
                  ? "bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] text-white shadow-md shadow-sky-500/20"
                  : "bg-[#0B1222] text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-[#233044]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Country Filter & Featured Toggle */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#233044]/60 pt-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 hidden sm:inline">
              Region:
            </span>
            {(supportedCountries.length > 0
              ? supportedCountries
              : [
                  { code: "GLOBAL", name: "🌐 Global", count: 0 },
                  { code: "US", name: "🇺🇸 USA", count: 0 },
                  { code: "GB", name: "🇬🇧 UK", count: 0 },
                  { code: "NG", name: "🇳🇬 Nigeria", count: 0 },
                  { code: "CA", name: "🇨🇦 Canada", count: 0 },
                ]
            ).map((c) => (
              <button
                key={c.code}
                onClick={() => setSelectedCountry(c.code)}
                className={`whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedCountry === c.code
                    ? "bg-[#1E293B] text-sky-400 border border-sky-400/40"
                    : "bg-[#0B1222] text-slate-400 hover:text-slate-200 border border-[#233044]"
                }`}
              >
                {c.name.startsWith("🌐") || c.name.startsWith("🇺🇸") || c.name.startsWith("🇬🇧") || c.name.startsWith("🇳🇬") || c.name.startsWith("🇨🇦")
                  ? c.name
                  : `${c.name} (${c.code})`}
              </button>
            ))}
          </div>

          <button
            onClick={() => setOnlyFeatured((prev) => !prev)}
            className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              onlyFeatured
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10"
                : "bg-[#0B1222] text-slate-400 hover:text-slate-200 border border-[#233044]"
            }`}
          >
            <Sparkles className="size-3 text-amber-400" />
            <span>Featured Only</span>
          </button>
        </div>

        {/* Trending Topics Badges */}
        {trendingTopics.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-[#233044]/40 flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 shrink-0">
              <TrendingUp className="size-3 text-sky-400" />
              Trending:
            </span>
            {trendingTopics.map((topic, i) => (
              <button
                key={i}
                onClick={() => setSearchQuery(topic.tag)}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#233044] bg-[#0B1222] px-2.5 py-1 text-xs text-slate-300 hover:border-slate-600 hover:text-white transition-all shrink-0"
              >
                <span className="font-medium">{topic.tag}</span>
                <span className="rounded bg-[#162032] px-1.5 py-0.2 text-[10px] font-bold text-slate-400">
                  {topic.active_bets_count}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        /* Loading Skeletons */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-xl border border-[#233044] bg-[#162032] p-5"
            >
              <div className="flex justify-between">
                <div className="h-4 w-20 rounded bg-slate-800" />
                <div className="h-4 w-16 rounded bg-slate-800" />
              </div>
              <div className="mt-4 h-5 w-3/4 rounded bg-slate-800" />
              <div className="mt-2 h-4 w-1/2 rounded bg-slate-800" />
              <div className="mt-6 h-3 w-full rounded-full bg-slate-800" />
              <div className="mt-8 grid grid-cols-2 gap-2">
                <div className="h-8 rounded bg-slate-800" />
                <div className="h-8 rounded bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        /* Error State */
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-8 text-center text-slate-200">
          <AlertCircle className="mx-auto size-8 text-rose-400" />
          <h3 className="mt-2 text-base font-bold">Failed to load prediction markets</h3>
          <p className="mt-1 text-xs text-rose-300">
            {error instanceof Error ? error.message : "Network error"}
          </p>
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="mt-4 border-rose-500/40 text-rose-200 hover:bg-rose-500/20"
          >
            <RefreshCw className="mr-1.5 size-3.5" />
            Try Again
          </Button>
        </div>
      ) : bets.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-[#233044] bg-[#162032]/40 p-12 text-center">
          <Coins className="mx-auto size-12 text-slate-500" />
          <h3 className="mt-4 text-base font-bold text-slate-200">
            No bets found in {selectedCategory === "ALL" ? "any market" : selectedCategory}
          </h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
            Be the first bettor to open a prediction market in this category and challenge the community.
          </p>
          <div className="mt-5">
            <CreateBetModal />
          </div>
        </div>
      ) : (
        /* Active Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {bets.map((bet) => (
            <BetCard
              key={bet.id}
              bet={bet}
              onOpenDiscussion={(b) => setActiveDiscussionBet(b)}
              onSelectStance={(b, stance) => {
                setStakeTargetBet(b);
                setStakeStance(stance);
                if (b.outcomes?.length) {
                  setSelectedOutcomeId(b.outcomes[0].id);
                }
              }}
              onSelectOutcome={(b, outcomeId) => {
                setStakeTargetBet(b);
                setSelectedOutcomeId(outcomeId || b.outcomes?.[0]?.id || "");
              }}
              onOpenMatchedStatus={(b) => setMatchedStatusBet(b)}
              onOpenEscrow={(b) => setEscrowBet(b)}
              onOpenCommission={(b) => setCommissionBet(b)}
            />
          ))}
        </div>
      )}

      {/* Discussion Dialog */}
      {activeDiscussionBet && (
        <Dialog
          open={Boolean(activeDiscussionBet)}
          onOpenChange={(open) => !open && setActiveDiscussionBet(null)}
        >
          <DialogContent className="border border-[#233044] bg-[#0B1222] text-slate-100 sm:max-w-2xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2 text-sky-400">
                <MessageSquare className="size-5" />
                <DialogTitle className="text-base font-bold text-slate-100">
                  Bettor Discussion: {activeDiscussionBet.title}
                </DialogTitle>
              </div>
            </DialogHeader>

            <div className="pt-2">
              <BetDiscussionThread
                betId={activeDiscussionBet.id}
                betTitle={activeDiscussionBet.title}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Matched Betting Engine Dialog */}
      {matchedStatusBet && (
        <Dialog
          open={Boolean(matchedStatusBet)}
          onOpenChange={(open) => !open && setMatchedStatusBet(null)}
        >
          <DialogContent className="border border-[#233044] bg-[#162032] text-slate-100 sm:max-w-xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2 text-sky-400">
                <Scale className="size-5" />
                <DialogTitle className="text-base font-bold text-slate-100">
                  Matched Engine & Order Book
                </DialogTitle>
              </div>
              <p className="text-xs text-slate-400 line-clamp-1">
                {matchedStatusBet.title}
              </p>
            </DialogHeader>

            {isMatchedLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="size-6 animate-spin text-sky-400" />
              </div>
            ) : matchedStatus ? (
              <div className="space-y-4 pt-2">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 className="size-4" />
                      Matched Escrow Pool
                    </div>
                    <div className="mt-1 text-xl font-bold text-slate-100">
                      ${parseFloat(matchedStatus.matched_pool).toFixed(2)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Locked & ready for automated payout
                    </div>
                  </div>

                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                      <Clock className="size-4" />
                      Unmatched Stakes
                    </div>
                    <div className="mt-1 text-xl font-bold text-slate-100">
                      ${parseFloat(matchedStatus.unmatched_pool).toFixed(2)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Awaiting counter-parties or refund
                    </div>
                  </div>
                </div>

                {/* Decimal Odds Banner */}
                <div className="rounded-xl border border-[#233044] bg-[#0B1222] p-3.5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 pb-2">
                    Live Dynamic Decimal Odds
                  </div>
                  {matchedStatus.bet_type === "CUSTOM" && matchedStatus.odds ? (
                    <div className="space-y-1.5">
                      {Object.entries(matchedStatus.odds).map(([title, odds]) => (
                        <div
                          key={title}
                          className="flex items-center justify-between text-xs rounded bg-slate-800/40 px-2 py-1.5"
                        >
                          <span className="font-medium text-slate-200">{title}</span>
                          <span className="font-bold text-sky-400">{String(odds)}x</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="rounded-lg border border-sky-500/20 bg-sky-500/10 p-2">
                        <div className="text-[11px] font-semibold text-sky-400 uppercase">
                          Back Odds
                        </div>
                        <div className="text-lg font-bold text-slate-100">
                          {matchedStatus.back_odds ? `${matchedStatus.back_odds}x` : `${matchedStatus.odds?.["BACK"] || "2.00"}x`}
                        </div>
                      </div>
                      <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-2">
                        <div className="text-[11px] font-semibold text-rose-400 uppercase">
                          Oppose Odds
                        </div>
                        <div className="text-lg font-bold text-slate-100">
                          {matchedStatus.oppose_odds ? `${matchedStatus.oppose_odds}x` : `${matchedStatus.odds?.["OPPOSE"] || "2.00"}x`}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Unmatched Refund Callout */}
                {parseFloat(matchedStatus.unmatched_pool) > 0 && (
                  <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                    <div className="text-xs text-amber-200">
                      <div className="font-semibold">Unmatched stakes detected</div>
                      <div className="text-[11px] text-amber-300/80">
                        Refund available for un-countered bets.
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleRefundUnmatched}
                      disabled={isRefunding}
                      className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center gap-1.5"
                    >
                      <Undo2 className="size-3.5" />
                      {isRefunding ? "Refunding..." : "Refund Unmatched"}
                    </Button>
                  </div>
                )}

                {/* Participant Orders Roster */}
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 pb-2">
                    Order Book & Participant Stakes ({matchedStatus.participants?.length || 0})
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {matchedStatus.participants && matchedStatus.participants.length > 0 ? (
                      matchedStatus.participants.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between rounded-lg border border-[#233044] bg-[#0B1222] p-2.5 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex size-6 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-300">
                              {p.user?.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={p.user.avatar_url}
                                  alt={p.user.name}
                                  className="size-full rounded-full object-cover"
                                />
                              ) : (
                                <User className="size-3 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-slate-200">
                                {p.user?.name || "Bettor"}
                              </div>
                              <span
                                className={`text-[10px] font-bold ${
                                  p.side === "BACK"
                                    ? "text-sky-400"
                                    : p.side === "OPPOSE"
                                      ? "text-rose-400"
                                      : "text-amber-400"
                                }`}
                              >
                                {p.side || "CUSTOM"}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-bold text-slate-100">
                              ${parseFloat(p.stake).toFixed(2)}
                            </div>
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                p.match_status === "MATCHED"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : p.match_status === "PARTIALLY_MATCHED"
                                    ? "bg-sky-500/20 text-sky-400"
                                    : p.match_status === "REFUNDED"
                                      ? "bg-purple-500/20 text-purple-400"
                                      : "bg-amber-500/20 text-amber-400"
                              }`}
                            >
                              {p.match_status || "UNMATCHED"}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-xs text-slate-400">
                        No participant orders in this pool yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                Failed to load matched status.
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Quick Stake Modal */}
      {stakeTargetBet && (
        <Dialog
          open={Boolean(stakeTargetBet)}
          onOpenChange={(open) => !open && setStakeTargetBet(null)}
        >
          <DialogContent className="border border-[#233044] bg-[#162032] text-slate-100 sm:max-w-md p-6 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-100">
                Place Stake on Prediction
              </DialogTitle>
              <p className="text-xs text-slate-400 line-clamp-2">
                {stakeTargetBet.title}
              </p>
            </DialogHeader>

            <form onSubmit={handleStakeSubmit} className="space-y-4 pt-3">
              {/* Stance or Candidate Choice */}
              {stakeTargetBet.bet_type === "CUSTOM" &&
              stakeTargetBet.outcomes &&
              stakeTargetBet.outcomes.length > 0 ? (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Candidate Outcome
                  </label>
                  <select
                    value={
                      selectedOutcomeId || stakeTargetBet.outcomes[0]?.id
                    }
                    onChange={(e) => setSelectedOutcomeId(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[#233044] bg-[#0B1222] px-3 py-2 text-xs font-semibold text-slate-100 focus:border-sky-400 focus:outline-none"
                  >
                    {stakeTargetBet.outcomes.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.title} (${parseFloat(o.pool || "0").toFixed(2)} · {o.percent}%)
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Selected Stance
                  </label>
                  <div className="mt-1.5 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setStakeStance("BACK")}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                        stakeStance === "BACK"
                          ? "bg-[#0EA5E9] text-white shadow-md shadow-sky-500/20"
                          : "bg-[#0B1222] text-slate-400 border border-[#233044]"
                      }`}
                    >
                      <TrendingUp className="size-3.5" />
                      BACK (Yes)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStakeStance("OPPOSE")}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                        stakeStance === "OPPOSE"
                          ? "bg-[#F43F5E] text-white shadow-md shadow-rose-500/20"
                          : "bg-[#0B1222] text-slate-400 border border-[#233044]"
                      }`}
                    >
                      <TrendingDown className="size-3.5" />
                      OPPOSE (No)
                    </button>
                  </div>
                </div>
              )}

              {/* Stake Amount */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Stake Amount ($)
                </label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    min={1}
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(Number(e.target.value))}
                    className="w-full rounded-lg border border-[#233044] bg-[#0B1222] pl-8 pr-3 py-2 text-sm font-bold text-slate-100 focus:border-sky-400 focus:outline-none"
                  />
                </div>

                {/* Preset Chips */}
                <div className="mt-2 flex gap-1.5">
                  {[10, 25, 50, 100, 250].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setStakeAmount(amt)}
                      className={`flex-1 py-1 rounded text-[11px] font-semibold border ${
                        stakeAmount === amt
                          ? "bg-slate-700 text-sky-400 border-sky-400/40"
                          : "bg-slate-800/50 text-slate-400 border-slate-700/50 hover:text-slate-200"
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary / Payout Preview */}
              <div className="rounded-lg border border-[#233044] bg-[#0B1222] p-3 text-xs space-y-1 text-slate-400">
                {stakeTargetBet.bet_type === "CUSTOM" ? (
                  <div className="flex justify-between">
                    <span>Total Market Pool:</span>
                    <span className="text-slate-200">${stakeTargetBet.total_pool}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span>Current Back Pool:</span>
                      <span className="text-slate-200">${stakeTargetBet.back_pool}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Oppose Pool:</span>
                      <span className="text-slate-200">${stakeTargetBet.oppose_pool}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between border-t border-slate-800 pt-1 font-semibold text-slate-200">
                  <span>Projected Escrow Lock:</span>
                  <span className="text-emerald-400">${stakeAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStakeTargetBet(null)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isStaking}
                  className={`font-semibold text-xs px-5 text-white ${
                    stakeTargetBet.bet_type === "CUSTOM" || stakeStance === "BACK"
                      ? "bg-[#0EA5E9] hover:bg-[#0284C7]"
                      : "bg-[#F43F5E] hover:bg-[#E11D48]"
                  }`}
                >
                  {isStaking
                    ? "Locking Escrow..."
                    : `Confirm Stake ($${stakeAmount})`}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Escrow & Automated Payout Pool Dialog */}
      {escrowBet && (
        <Dialog
          open={Boolean(escrowBet)}
          onOpenChange={(open) => !open && setEscrowBet(null)}
        >
          <DialogContent className="border border-[#233044] bg-[#162032] text-slate-100 sm:max-w-xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2 text-sky-400">
                <ShieldCheck className="size-5" />
                <DialogTitle className="text-base font-bold text-slate-100">
                  Escrow & Automated Payout Pool
                </DialogTitle>
              </div>
              <p className="text-xs text-slate-400 line-clamp-1">
                {escrowBet.title}
              </p>
            </DialogHeader>

            {isEscrowLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="size-6 animate-spin text-sky-400" />
              </div>
            ) : escrowStatus ? (
              <div className="space-y-4 pt-2">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">
                      <Lock className="size-4" />
                      Total Locked Pool
                    </div>
                    <div className="mt-1 text-xl font-bold text-slate-100">
                      ${parseFloat(escrowStatus.total_escrow).toFixed(2)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Secured in smart escrow
                    </div>
                  </div>

                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 className="size-4" />
                      {escrowStatus.status === "RESOLVED"
                        ? "Paid Out Pool"
                        : "Matched Escrow"}
                    </div>
                    <div className="mt-1 text-xl font-bold text-slate-100">
                      ${parseFloat(escrowStatus.matched_pool).toFixed(2)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {escrowStatus.status === "RESOLVED"
                        ? "Distributed to winning orders"
                        : "Ready for automated payout"}
                    </div>
                  </div>
                </div>

                {/* Winner Result Banner if resolved */}
                {escrowStatus.status === "RESOLVED" &&
                  escrowStatus.winning_side && (
                    <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5">
                      <Trophy className="size-6 text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-emerald-300">
                          Official Winning Outcome: {escrowStatus.winning_side}
                        </div>
                        <div className="text-[11px] text-emerald-400/80">
                          {escrowStatus.winners_count} winner(s) received
                          proportional payout directly to wallet balance.
                        </div>
                      </div>
                    </div>
                  )}

                {/* Platform Fee Disclosure Banner */}
                <div className="flex items-center justify-between rounded-xl border border-sky-500/20 bg-sky-500/5 px-3.5 py-2.5 text-xs">
                  <div className="flex items-center gap-2 text-sky-300">
                    <Percent className="size-4 text-sky-400 shrink-0" />
                    <div>
                      <span className="font-bold text-sky-400">
                        Platform Fee: {String(escrowStatus.commission_rate ?? "10.0")}%
                      </span>
                      <span className="ml-1 text-slate-400 text-[11px]">
                        (applied exclusively to net winning profits)
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const target = escrowBet;
                      setEscrowBet(null);
                      setCommissionBet(target);
                    }}
                    className="font-semibold text-sky-400 underline hover:text-sky-300 text-[11px] shrink-0"
                  >
                    Fee Details &gt;
                  </button>
                </div>

                {/* Participant Payout Roster */}
                <div>
                  <div className="flex items-center justify-between pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <span>
                      Participant Payout Distribution (
                      {escrowStatus.payouts?.length || 0})
                    </span>
                    <span>Payout & ROI</span>
                  </div>
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {escrowStatus.payouts && escrowStatus.payouts.length > 0 ? (
                      escrowStatus.payouts.map((p) => {
                        const isWin = p.is_winner === true;
                        return (
                          <div
                            key={p.participant_id}
                            className={`flex items-center justify-between rounded-lg border p-2.5 text-xs ${
                              isWin
                                ? "border-emerald-500/30 bg-emerald-500/5"
                                : "border-[#233044] bg-[#0B1222]"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className="flex size-6 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-300">
                                <User className="size-3 text-slate-400" />
                              </div>
                              <div>
                                <div className="font-medium text-slate-200">
                                  {p.user_name}
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px]">
                                  <span
                                    className={`font-bold ${
                                      p.side === "BACK"
                                        ? "text-sky-400"
                                        : p.side === "OPPOSE"
                                          ? "text-rose-400"
                                          : "text-amber-400"
                                    }`}
                                  >
                                    {p.outcome_title || p.side}
                                  </span>
                                  <span className="text-slate-400">
                                    · Stake: ${parseFloat(p.stake).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div
                                className={`font-bold ${
                                  isWin ? "text-emerald-400" : "text-slate-200"
                                }`}
                              >
                                {isWin
                                  ? `+$${parseFloat(p.payout_amount).toFixed(2)}`
                                  : escrowStatus.status === "RESOLVED"
                                    ? "$0.00"
                                    : "Locked"}
                              </div>
                              {isWin &&
                                p.commission_deducted &&
                                parseFloat(p.commission_deducted) > 0 && (
                                  <div className="text-[10px] text-slate-400">
                                    -${parseFloat(p.commission_deducted).toFixed(2)} fee
                                  </div>
                                )}
                              {isWin && p.roi_percent > 0 ? (
                                <span className="rounded bg-emerald-500/20 px-1 py-0.5 text-[10px] font-bold text-emerald-400">
                                  +{p.roi_percent}% ROI
                                </span>
                              ) : escrowStatus.status === "RESOLVED" &&
                                !isWin ? (
                                <span className="rounded bg-rose-500/20 px-1 py-0.5 text-[10px] font-bold text-rose-400">
                                  LOST
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400">
                                  {p.payout_status}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-4 text-xs text-slate-400">
                        No orders in escrow pool yet.
                      </div>
                    )}
                  </div>
                </div>

                {/* Resolve Action Button (if not resolved) */}
                {escrowStatus.status !== "RESOLVED" && (
                  <div className="pt-2">
                    <Button
                      className="w-full bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold text-xs flex items-center justify-center gap-1.5 py-2.5"
                      onClick={() => {
                        const target = escrowBet;
                        setEscrowBet(null);
                        setResolveBetTarget(target);
                        if (target.outcomes?.length) {
                          setResolveOutcomeId(target.outcomes[0].id);
                        }
                      }}
                    >
                      <Gavel className="size-4" />
                      Declare Winner & Distribute Escrow
                    </Button>
                  </div>
                )}

                <div className="pt-1">
                  <Button
                    variant="outline"
                    className="w-full border-rose-500/40 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 font-semibold text-xs flex items-center justify-center gap-1.5 py-2"
                    onClick={() => {
                      const target = escrowBet;
                      setEscrowBet(null);
                      setDisputeTargetBet(target);
                    }}
                  >
                    <AlertCircle className="size-4" />
                    File Dispute on this Bet
                  </Button>
                </div>

                <div className="pt-1">
                  <Button
                    variant="outline"
                    className="w-full border-indigo-500/40 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 font-semibold text-xs flex items-center justify-center gap-1.5 py-2"
                    onClick={() => {
                      const target = escrowBet;
                      setEscrowBet(null);
                      setGamingTargetBet(target);
                    }}
                  >
                    <Gamepad2 className="size-4" />
                    PlayStation / Gaming Result Check
                  </Button>
                </div>

                <div className="pt-1">
                  <Button
                    variant="outline"
                    className="w-full border-sky-500/40 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 font-semibold text-xs flex items-center justify-center gap-1.5 py-2"
                    onClick={() => {
                      const target = escrowBet;
                      setEscrowBet(null);
                      setAiTargetBet(target);
                      setAiChatHistory([]);
                    }}
                  >
                    <Sparkles className="size-4" />
                    AI Research Assistant
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                Failed to load escrow details.
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Resolve Bet Modal */}
      {resolveBetTarget && (
        <Dialog
          open={Boolean(resolveBetTarget)}
          onOpenChange={(open) => !open && setResolveBetTarget(null)}
        >
          <DialogContent className="border border-[#233044] bg-[#162032] text-slate-100 sm:max-w-md p-6 shadow-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2 text-sky-400">
                <Gavel className="size-5" />
                <DialogTitle className="text-base font-bold text-slate-100">
                  Resolve Bet & Distribute Escrow
                </DialogTitle>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2">
                {resolveBetTarget.title}
              </p>
            </DialogHeader>

            <form onSubmit={handleResolveSubmit} className="space-y-4 pt-3">
              {resolveBetTarget.bet_type === "CUSTOM" &&
              resolveBetTarget.outcomes &&
              resolveBetTarget.outcomes.length > 0 ? (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Select Official Winning Candidate
                  </label>
                  <select
                    value={
                      resolveOutcomeId || resolveBetTarget.outcomes[0]?.id
                    }
                    onChange={(e) => setResolveOutcomeId(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[#233044] bg-[#0B1222] px-3 py-2 text-xs font-semibold text-slate-100 focus:border-sky-400 focus:outline-none"
                  >
                    {resolveBetTarget.outcomes.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.title} ($
                        {parseFloat(o.pool || "0").toFixed(2)} - {o.percent}
                        %)
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Official Winner Stance
                  </label>
                  <div className="mt-1.5 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setResolveWinningSide("BACK")}
                      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                        resolveWinningSide === "BACK"
                          ? "bg-[#0EA5E9] text-white shadow-md shadow-sky-500/20"
                          : "bg-[#0B1222] text-slate-400 border border-[#233044]"
                      }`}
                    >
                      <TrendingUp className="size-3.5" />
                      BACK (Yes) Won
                    </button>
                    <button
                      type="button"
                      onClick={() => setResolveWinningSide("OPPOSE")}
                      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                        resolveWinningSide === "OPPOSE"
                          ? "bg-[#F43F5E] text-white shadow-md shadow-rose-500/20"
                          : "bg-[#0B1222] text-slate-400 border border-[#233044]"
                      }`}
                    >
                      <TrendingDown className="size-3.5" />
                      OPPOSE (No) Won
                    </button>
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                <div className="font-semibold">Automated Settlement & Platform Fee:</div>
                <div className="text-[11px] text-amber-300/80 mt-0.5">
                  The matched escrow pool will be distributed proportionally to
                  all winning participants. A {String(resolveBetTarget.commission_rate ?? "10.0")}% platform fee is deducted strictly from net winning profits. Initial stakes are returned 100%.
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setResolveBetTarget(null)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isResolving}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5"
                >
                  {isResolving ? "Distributing Payouts..." : "Confirm & Settle"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Platform Fee & Commission Details Modal */}
      {commissionBet && (
        <Dialog
          open={Boolean(commissionBet)}
          onOpenChange={(open) => !open && setCommissionBet(null)}
        >
          <DialogContent className="border border-[#233044] bg-[#162032] text-slate-100 sm:max-w-lg max-h-[85vh] overflow-y-auto p-6 shadow-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2 text-sky-400">
                <Percent className="size-5" />
                <DialogTitle className="text-base font-bold text-slate-100">
                  Platform Commission & Fee Management
                </DialogTitle>
              </div>
              <p className="text-xs text-slate-400 line-clamp-1">
                {commissionBet.title}
              </p>
            </DialogHeader>

            {isCommissionLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="size-6 animate-spin text-sky-400" />
              </div>
            ) : commissionStatus ? (
              <div className="space-y-4 pt-2">
                {/* Policy Highlights */}
                <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">
                      Commission Rate
                    </span>
                    <span className="rounded-full bg-sky-500/20 px-2.5 py-0.5 font-bold text-sky-400">
                      {commissionStatus.commission_rate}% on Net Profit
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Platform commission applies strictly to net winning profit
                    (max(0, payout - matched stake)). Never deducted from the
                    bettor&apos;s stake.
                  </p>
                </div>

                {/* Pool Metrics */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="rounded-lg border border-[#233044] bg-[#0B1222] p-3 text-center">
                    <div className="text-[10px] uppercase font-semibold text-slate-400">
                      Gross Payout Pool
                    </div>
                    <div className="mt-1 text-sm font-bold text-slate-100">
                      ${parseFloat(commissionStatus.gross_payout_pool).toFixed(2)}
                    </div>
                  </div>

                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-center">
                    <div className="text-[10px] uppercase font-semibold text-amber-300">
                      Fee Collected
                    </div>
                    <div className="mt-1 text-sm font-bold text-amber-400">
                      -${parseFloat(commissionStatus.total_commission_collected).toFixed(2)}
                    </div>
                  </div>

                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-center">
                    <div className="text-[10px] uppercase font-semibold text-emerald-300">
                      Net Payout Pool
                    </div>
                    <div className="mt-1 text-sm font-bold text-emerald-400">
                      ${parseFloat(commissionStatus.net_payout_pool).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Participant Fee Breakdown */}
                <div>
                  <div className="flex items-center justify-between pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <span>
                      Bettor Fee Roster (
                      {commissionStatus.participant_fees?.length || 0})
                    </span>
                    <span>Fee & Net Payout</span>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {commissionStatus.participant_fees &&
                    commissionStatus.participant_fees.length > 0 ? (
                      commissionStatus.participant_fees.map((pf) => {
                        const hasProfit = parseFloat(pf.net_profit) > 0;
                        return (
                          <div
                            key={pf.participant_id}
                            className="flex items-center justify-between rounded-lg border border-[#233044] bg-[#0B1222] p-2.5 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <div className="flex size-6 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-300">
                                <User className="size-3 text-slate-400" />
                              </div>
                              <div>
                                <div className="font-medium text-slate-200">
                                  {pf.user_name}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  Stake: $
                                  {parseFloat(pf.matched_stake).toFixed(2)} ·
                                  Profit: ${parseFloat(pf.net_profit).toFixed(2)}
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="font-bold text-emerald-400">
                                Net: ${parseFloat(pf.net_payout).toFixed(2)}
                              </div>
                              <div className="text-[10px]">
                                {hasProfit ? (
                                  <span className="text-amber-400">
                                    -${parseFloat(pf.commission_deducted).toFixed(2)} (
                                    {commissionStatus.commission_rate}%)
                                  </span>
                                ) : (
                                  <span className="text-slate-500">
                                    No fee (0 profit)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-4 text-xs text-slate-400">
                        No participants registered in fee pool yet.
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs py-2"
                    onClick={() => setCommissionBet(null)}
                  >
                    Close Fee Details
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-rose-400">
                Failed to load commission details.
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
      {/* User Wallet & Transaction Ledger Modal */}
      {isWalletOpen && (
        <Dialog
          open={isWalletOpen}
          onOpenChange={(open) => !open && setIsWalletOpen(false)}
        >
          <DialogContent className="border border-[#233044] bg-[#162032] text-slate-100 sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Wallet className="size-5" />
                  <DialogTitle className="text-base font-bold text-slate-100">
                    User Wallet &amp; Transaction Ledger
                  </DialogTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    refetchWallet();
                    refetchTransactions();
                  }}
                  className="size-7 p-0 text-slate-400 hover:text-slate-200"
                  title="Refresh"
                >
                  <RefreshCw className="size-3.5" />
                </Button>
              </div>
              <p className="text-xs text-slate-400">
                Manage your available balance, instant deposits, payouts, and
                immutable transaction ledger.
              </p>
            </DialogHeader>

            <div className="space-y-5 pt-3">
              {/* Wallet Balances Card */}
              <div className="rounded-xl border border-[#233044] bg-[#0B1222] p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="text-xs font-medium text-slate-400">
                      Available Balance
                    </div>
                    <div className="text-3xl font-extrabold text-emerald-400 mt-0.5">
                      $
                      {walletOverview
                        ? parseFloat(walletOverview.balance).toFixed(2)
                        : "0.00"}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 border-t sm:border-t-0 sm:border-l border-[#233044] pt-2 sm:pt-0 sm:pl-4 text-xs">
                    <div>
                      <div className="text-slate-400 text-[11px]">In Escrow</div>
                      <div className="font-bold text-amber-400 mt-0.5">
                        $
                        {walletOverview
                          ? parseFloat(walletOverview.escrow_locked).toFixed(2)
                          : "0.00"}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[11px]">Deposited</div>
                      <div className="font-bold text-slate-200 mt-0.5">
                        $
                        {walletOverview
                          ? parseFloat(walletOverview.total_deposited).toFixed(2)
                          : "0.00"}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[11px]">Withdrawn</div>
                      <div className="font-bold text-slate-400 mt-0.5">
                        $
                        {walletOverview
                          ? parseFloat(walletOverview.total_withdrawn).toFixed(2)
                          : "0.00"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deposit and Withdraw Action Forms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Deposit Card */}
                <form
                  onSubmit={handleDepositSubmit}
                  className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 space-y-3"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                    <ArrowDownLeft className="size-4" />
                    <span>Deposit Funds (+)</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400">
                      Quick Amount:
                    </label>
                    <div className="grid grid-cols-4 gap-1.5 mt-1">
                      {[25, 50, 100, 250].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setDepositAmount(amt)}
                          className={`rounded-lg py-1 text-xs font-bold border transition-colors ${
                            depositAmount === amt
                              ? "bg-sky-500 text-white border-sky-400"
                              : "bg-[#0B1222] text-slate-300 border-[#233044] hover:border-slate-600"
                          }`}
                        >
                          ${amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400">
                      Amount (USD):
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={depositAmount}
                      onChange={(e) =>
                        setDepositAmount(parseFloat(e.target.value) || 0)
                      }
                      className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0B1222] px-3 py-1.5 text-xs font-bold text-slate-100 focus:border-sky-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400">
                      Method:
                    </label>
                    <select
                      value={depositMethod}
                      onChange={(e) => setDepositMethod(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0B1222] px-3 py-1.5 text-xs text-slate-100 focus:border-sky-400 focus:outline-none"
                    >
                      <option value="CARD">Credit / Debit Card (Stripe)</option>
                      <option value="BANK_TRANSFER">Bank Wire Transfer</option>
                      <option value="CRYPTO">Cryptocurrency (USDT / USDC)</option>
                    </select>
                  </div>

                  {depositMethod === "BANK_TRANSFER" && (
                    <div className="space-y-2 rounded-lg border border-[#233044] bg-[#0B1222] p-2.5 text-[11px]">
                      <div className="text-slate-400 font-semibold">
                        Beneficiary: <span className="text-slate-200">BetSocial Global Ltd</span>
                      </div>
                      <div className="text-slate-400">
                        Bank: <span className="text-slate-200">JPMorgan Chase Bank, N.A.</span>
                      </div>
                      <div className="text-slate-400">
                        IBAN: <span className="text-slate-200">GB82WEST12345698765432</span>
                      </div>
                      <div>
                        <label className="text-slate-400 font-semibold">
                          Reference Code:
                        </label>
                        <input
                          type="text"
                          value={wireReference}
                          onChange={(e) => setWireReference(e.target.value)}
                          className="mt-1 w-full rounded border border-[#233044] bg-[#162032] px-2 py-1 text-slate-100 font-mono text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 font-semibold">
                          Sender Bank:
                        </label>
                        <input
                          type="text"
                          value={wireSenderBank}
                          onChange={(e) => setWireSenderBank(e.target.value)}
                          className="mt-1 w-full rounded border border-[#233044] bg-[#162032] px-2 py-1 text-slate-100 text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {depositMethod === "CRYPTO" && (
                    <div className="space-y-2 rounded-lg border border-[#233044] bg-[#0B1222] p-2.5 text-[11px]">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-slate-400 font-semibold">Asset:</label>
                          <select
                            value={cryptoAsset}
                            onChange={(e) => setCryptoAsset(e.target.value)}
                            className="mt-1 w-full rounded border border-[#233044] bg-[#162032] px-2 py-1 text-slate-100 text-xs"
                          >
                            <option value="USDT">USDT</option>
                            <option value="USDC">USDC</option>
                            <option value="BTC">BTC</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-400 font-semibold">Network:</label>
                          <select
                            value={cryptoNetwork}
                            onChange={(e) => setCryptoNetwork(e.target.value)}
                            className="mt-1 w-full rounded border border-[#233044] bg-[#162032] px-2 py-1 text-slate-100 text-xs"
                          >
                            <option value="POLYGON">Polygon</option>
                            <option value="ETHEREUM">Ethereum</option>
                            <option value="TRON">Tron (TRC20)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-slate-400 font-semibold">Deposit Address:</label>
                        <div className="mt-1 rounded border border-sky-500/30 bg-sky-500/10 p-1.5 font-mono text-[10px] text-sky-300 break-all select-all">
                          0x71Ce275d31b816280b2aB38
                        </div>
                      </div>

                      <div>
                        <label className="text-slate-400 font-semibold">
                          Tx Hash (after transfer):
                        </label>
                        <input
                          type="text"
                          value={cryptoTxHash}
                          onChange={(e) => setCryptoTxHash(e.target.value)}
                          className="mt-1 w-full rounded border border-[#233044] bg-[#162032] px-2 py-1 text-slate-100 font-mono text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {depositMethod === "CARD" && (
                    <div className="rounded-lg border border-sky-500/20 bg-sky-500/10 p-2 text-[11px] text-sky-400 flex items-center gap-1.5">
                      <Sparkles className="size-3.5" />
                      <span>Instant card deposit powered by Stripe 256-bit encryption</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isDepositing}
                    className="w-full bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-bold text-xs py-2"
                  >
                    {isDepositing
                      ? "Processing..."
                      : depositMethod === "BANK_TRANSFER"
                        ? `Submit Wire Proof ($${depositAmount})`
                        : depositMethod === "CRYPTO"
                          ? `Verify & Credit $${depositAmount}`
                          : `Confirm Stripe Deposit ($${depositAmount})`}
                  </Button>
                </form>

                {/* Withdraw Card */}
                <form
                  onSubmit={handleWithdrawSubmit}
                  className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    <ArrowUpRight className="size-4" />
                    <span>Withdraw Funds (-)</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400">
                      Quick Amount:
                    </label>
                    <div className="grid grid-cols-4 gap-1.5 mt-1">
                      {[25, 50, 100, 200].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setWithdrawAmount(amt)}
                          className={`rounded-lg py-1 text-xs font-bold border transition-colors ${
                            withdrawAmount === amt
                              ? "bg-amber-500 text-slate-900 border-amber-400"
                              : "bg-[#0B1222] text-slate-300 border-[#233044] hover:border-slate-600"
                          }`}
                        >
                          ${amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400">
                      Amount (USD):
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={withdrawAmount}
                      onChange={(e) =>
                        setWithdrawAmount(parseFloat(e.target.value) || 0)
                      }
                      className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0B1222] px-3 py-1.5 text-xs font-bold text-slate-100 focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400">
                      Payout Method:
                    </label>
                    <select
                      value={withdrawMethod}
                      onChange={(e) => setWithdrawMethod(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0B1222] px-3 py-1.5 text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
                    >
                      <option value="BANK_TRANSFER">Bank Wire / IBAN</option>
                      <option value="STRIPE_INSTANT">Stripe Instant Payout</option>
                      <option value="CRYPTO">Crypto Wallet (USDC)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400">
                      Destination Details:
                    </label>
                    <input
                      type="text"
                      value={withdrawDestination}
                      onChange={(e) => setWithdrawDestination(e.target.value)}
                      placeholder="Account Number or IBAN"
                      className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0B1222] px-3 py-1.5 text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isWithdrawing}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-2"
                  >
                    {isWithdrawing
                      ? "Submitting..."
                      : `Request $${withdrawAmount} Payout`}
                  </Button>
                </form>
              </div>

              {/* Transaction Ledger Section */}
              <div>
                <div className="flex items-center justify-between pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <span>Transaction Ledger ({transactions.length})</span>
                  <span>Amount &amp; Status</span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {isTransactionsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="size-5 animate-spin text-slate-400" />
                    </div>
                  ) : transactions.length > 0 ? (
                    transactions.map((tx) => {
                      const isCredit =
                        tx.type === "DEPOSIT" ||
                        tx.type === "PAYOUT" ||
                        tx.type === "REFUND";
                      return (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between rounded-lg border border-[#233044] bg-[#0B1222] p-2.5 text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`flex size-7 items-center justify-center rounded-lg ${
                                isCredit
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : tx.type === "WITHDRAWAL"
                                    ? "bg-amber-500/10 text-amber-400"
                                    : "bg-rose-500/10 text-rose-400"
                              }`}
                            >
                              {isCredit ? (
                                <ArrowDownLeft className="size-3.5" />
                              ) : (
                                <ArrowUpRight className="size-3.5" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-slate-200">
                                {tx.description}
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                <span
                                  className={`font-bold ${
                                    isCredit
                                      ? "text-emerald-400"
                                      : tx.type === "WITHDRAWAL"
                                        ? "text-amber-400"
                                        : "text-rose-400"
                                  }`}
                                >
                                  {tx.type}
                                </span>
                                <span>·</span>
                                <span>
                                  {new Date(tx.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div
                              className={`font-bold ${
                                isCredit ? "text-emerald-400" : "text-slate-100"
                              }`}
                            >
                              {isCredit ? "+" : "-"}${parseFloat(tx.amount).toFixed(2)}
                            </div>
                            <span
                              className={`text-[10px] font-semibold ${
                                tx.status === "COMPLETED"
                                  ? "text-emerald-400/80"
                                  : "text-amber-400/80"
                              }`}
                            >
                              {tx.status}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-xs text-slate-400">
                      No transactions recorded in wallet ledger yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* KYC Verification Dialog */}
      {isKycModalOpen && (
        <Dialog open={isKycModalOpen} onOpenChange={setIsKycModalOpen}>
          <DialogContent className="border border-[#233044] bg-[#162032] text-slate-100 sm:max-w-md p-6 shadow-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2 text-sky-400">
                <ShieldCheck className="size-5" />
                <DialogTitle className="text-base font-bold text-slate-100">
                  Identity &amp; KYC Compliance
                </DialogTitle>
              </div>
            </DialogHeader>

            <form onSubmit={handleKycSubmit} className="space-y-4 pt-2">
              <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-3 text-xs text-sky-300">
                Current Status:{" "}
                <span className="font-bold uppercase tracking-wider text-white">
                  {kycStatusData?.kyc_status || "UNVERIFIED"}
                </span>
                <p className="mt-1 text-[11px] text-slate-400">
                  Verify your government identity to unlock high-stakes betting limits and expedited withdrawals.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">
                  Legal Full Name:
                </label>
                <input
                  type="text"
                  value={kycFullName}
                  onChange={(e) => setKycFullName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0B1222] px-3 py-2 text-xs text-slate-100 focus:border-sky-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">
                  Document Type:
                </label>
                <select
                  value={kycDocType}
                  onChange={(e) => setKycDocType(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0B1222] px-3 py-2 text-xs text-slate-100 focus:border-sky-400 focus:outline-none"
                >
                  <option value="PASSPORT">International Passport</option>
                  <option value="DRIVERS_LICENSE">Driver&apos;s License</option>
                  <option value="NATIONAL_ID">National ID Card</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">
                  Document ID Number:
                </label>
                <input
                  type="text"
                  value={kycDocNumber}
                  onChange={(e) => setKycDocNumber(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0B1222] px-3 py-2 text-xs text-slate-100 focus:border-sky-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">
                  Document Scan / Photo URL:
                </label>
                <input
                  type="url"
                  value={kycDocUrl}
                  onChange={(e) => setKycDocUrl(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0B1222] px-3 py-2 text-xs text-slate-100 focus:border-sky-400 focus:outline-none"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmittingKyc}
                className="w-full bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-bold text-xs py-2.5 mt-2"
              >
                {isSubmittingKyc ? "Submitting..." : "Submit KYC Verification"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* File Dispute Dialog */}
      {disputeTargetBet && (
        <Dialog
          open={Boolean(disputeTargetBet)}
          onOpenChange={(open) => !open && setDisputeTargetBet(null)}
        >
          <DialogContent className="border border-[#233044] bg-[#162032] text-slate-100 sm:max-w-md p-6 shadow-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2 text-rose-400">
                <Gavel className="size-5" />
                <DialogTitle className="text-base font-bold text-slate-100">
                  File Bet Dispute
                </DialogTitle>
              </div>
              <p className="text-xs text-slate-400 line-clamp-1">
                {disputeTargetBet.title}
              </p>
            </DialogHeader>

            <form onSubmit={handleDisputeSubmit} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-400">
                  Dispute Reason:
                </label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0B1222] px-3 py-2 text-xs text-slate-100 focus:border-rose-400 focus:outline-none"
                >
                  <option value="INCORRECT_RESULT">Incorrect Outcome Declared</option>
                  <option value="EVENT_CANCELLED">Event Cancelled / Postponed</option>
                  <option value="COLLUSION">Fraud or Collusion Suspected</option>
                  <option value="SCORE_MISMATCH">Gaming / Score Mismatch</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">
                  Evidence / Explanation:
                </label>
                <textarea
                  rows={3}
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0B1222] px-3 py-2 text-xs text-slate-100 focus:border-rose-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">
                  Proof / Evidence URL:
                </label>
                <input
                  type="url"
                  value={disputeEvidenceUrl}
                  onChange={(e) => setDisputeEvidenceUrl(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0B1222] px-3 py-2 text-xs text-slate-100 focus:border-rose-400 focus:outline-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isFilingDispute}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2.5 mt-2"
              >
                {isFilingDispute ? "Escalating..." : "Submit Formal Dispute"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Disputes & Arbitration Ledger Dialog */}
      {isDisputesModalOpen && (
        <Dialog open={isDisputesModalOpen} onOpenChange={setIsDisputesModalOpen}>
          <DialogContent className="border border-[#233044] bg-[#162032] text-slate-100 sm:max-w-xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2 text-rose-400">
                <Gavel className="size-5" />
                <DialogTitle className="text-base font-bold text-slate-100">
                  Disputes &amp; Arbitration Ledger ({disputesList.length})
                </DialogTitle>
              </div>
              <p className="text-xs text-slate-400">
                Active dispute claims, referee evidence reports, and adjudicated payouts.
              </p>
            </DialogHeader>

            <div className="space-y-3 pt-2">
              {isDisputesLoading ? (
                <div className="flex items-center justify-center py-10">
                  <RefreshCw className="size-6 animate-spin text-rose-400" />
                </div>
              ) : disputesList.length > 0 ? (
                disputesList.map((d) => {
                  const isOpen = d.status === "OPEN";
                  return (
                    <div
                      key={d.id}
                      className="rounded-xl border border-[#233044] bg-[#0B1222] p-3.5 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            isOpen
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {d.status}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {d.reason}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-slate-200">
                        {d.description}
                      </div>

                      {d.evidence_url && (
                        <div className="text-[11px] text-sky-400 break-all">
                          Evidence: <a href={d.evidence_url} target="_blank" rel="noreferrer" className="underline">{d.evidence_url}</a>
                        </div>
                      )}

                      {isOpen && (
                        <div className="flex items-center gap-2 pt-2 border-t border-[#233044]/80">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] h-7"
                            onClick={() => handleResolveDispute(d.id, "OVERTURN_RESULT")}
                          >
                            Overturn Result
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-600 text-slate-300 text-[11px] h-7"
                            onClick={() => handleResolveDispute(d.id, "UPHOLD_ORIGINAL")}
                          >
                            Uphold Original
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-amber-600/40 text-amber-400 text-[11px] h-7"
                            onClick={() => handleResolveDispute(d.id, "REFUND_ALL")}
                          >
                            Refund All
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-xs text-slate-400">
                  No disputes recorded in the platform ledger.
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Gaming Result Check Dialog */}
      {gamingTargetBet && (
        <Dialog
          open={Boolean(gamingTargetBet)}
          onOpenChange={(open) => !open && setGamingTargetBet(null)}
        >
          <DialogContent className="border border-[#233044] bg-[#162032] text-slate-100 sm:max-w-md p-6 shadow-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2 text-indigo-400">
                <Gamepad2 className="size-5" />
                <DialogTitle className="text-base font-bold text-slate-100">
                  PlayStation / Gaming Result Check
                </DialogTitle>
              </div>
              <p className="text-xs text-slate-400 line-clamp-1">
                {gamingTargetBet.title}
              </p>
            </DialogHeader>

            {/* Live Submissions Status Banner */}
            {isGamingMatchLoading ? (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="size-5 animate-spin text-indigo-400" />
              </div>
            ) : gamingMatchStatus && gamingMatchStatus.submissions?.length > 0 ? (
              <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">Match Status:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      gamingMatchStatus.match_status === "MATCHED"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : gamingMatchStatus.match_status === "MISMATCH"
                        ? "bg-rose-500/20 text-rose-400"
                        : "bg-amber-500/20 text-amber-400"
                    }`}
                  >
                    {gamingMatchStatus.match_status}
                  </span>
                </div>
                <div className="space-y-1">
                  {gamingMatchStatus.submissions.map((sub, i) => (
                    <div key={i} className="text-[11px] text-slate-300 flex justify-between">
                      <span>{sub.player_name || sub.gamertag || sub.player_id}:</span>
                      <span className="font-mono text-slate-100 font-semibold">
                        {sub.my_score} - {sub.opponent_score} ({sub.platform})
                      </span>
                    </div>
                  ))}
                </div>
                {gamingMatchStatus.match_status === "MATCHED" && (
                  <p className="text-[11px] text-emerald-400 font-medium">
                    ✓ Both player scores match! Auto-resolved and escrow distributed.
                  </p>
                )}
                {gamingMatchStatus.match_status === "MISMATCH" && (
                  <p className="text-[11px] text-rose-400 font-medium">
                    ⚠️ Mismatch detected! Escalated to dispute #{gamingMatchStatus.dispute_id}. Escrow locked.
                  </p>
                )}
              </div>
            ) : null}

            <form onSubmit={handleGamingSubmitScore} className="space-y-3.5 pt-1">
              <div>
                <label className="text-xs font-semibold text-slate-400">
                  Platform:
                </label>
                <select
                  value={gamingPlatform}
                  onChange={(e) => setGamingPlatform(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0B1222] px-3 py-2 text-xs text-slate-100 focus:border-indigo-400 focus:outline-none"
                >
                  <option value="PLAYSTATION">PlayStation (PS5 / PS4)</option>
                  <option value="XBOX">Xbox Series X|S / One</option>
                  <option value="PC">PC / Steam / Epic</option>
                  <option value="NINTENDO">Nintendo Switch</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">
                  Gamertag / PSN ID:
                </label>
                <input
                  type="text"
                  value={gamingGamertag}
                  onChange={(e) => setGamingGamertag(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0B1222] px-3 py-2 text-xs text-slate-100 focus:border-indigo-400 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400">
                    My Score:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={gamingMyScore}
                    onChange={(e) => setGamingMyScore(parseInt(e.target.value) || 0)}
                    className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0B1222] px-3 py-2 text-xs text-slate-100 focus:border-indigo-400 focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400">
                    Opponent Score:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={gamingOpponentScore}
                    onChange={(e) => setGamingOpponentScore(parseInt(e.target.value) || 0)}
                    className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0B1222] px-3 py-2 text-xs text-slate-100 focus:border-indigo-400 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">
                  Match Proof Screenshot URL:
                </label>
                <input
                  type="url"
                  value={gamingProofUrl}
                  onChange={(e) => setGamingProofUrl(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0B1222] px-3 py-2 text-xs text-slate-100 focus:border-indigo-400 focus:outline-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmittingGaming}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 mt-2"
              >
                {isSubmittingGaming ? "Submitting Result..." : "Submit Game Score"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* AI Research Assistant Dialog */}
      {aiTargetBet && (
        <Dialog
          open={Boolean(aiTargetBet)}
          onOpenChange={(open) => !open && setAiTargetBet(null)}
        >
          <DialogContent className="border border-[#233044] bg-[#162032] text-slate-100 sm:max-w-lg p-6 shadow-2xl max-h-[88vh] flex flex-col">
            <DialogHeader className="shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sky-400">
                  <Sparkles className="size-5" />
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-base font-bold text-slate-100">
                      AI Research Assistant
                    </DialogTitle>
                    <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[10px] font-bold text-sky-400">
                      BETA
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="size-7 p-0 text-slate-400 hover:text-sky-400"
                  onClick={() => handleRunAiResearch()}
                  title="Re-run AI Analysis"
                >
                  <RefreshCw className="size-3.5" />
                </Button>
              </div>
              <p className="text-xs text-slate-400 line-clamp-1">
                {aiTargetBet.title}
              </p>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 pt-2">
              {isAiResearchLoading ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-2">
                  <RefreshCw className="size-6 animate-spin text-sky-400" />
                  <p className="text-xs text-slate-400">
                    Synthesizing orderbook liquidity, form &amp; crowd sentiment...
                  </p>
                </div>
              ) : aiResearchData ? (
                <>
                  {/* Strategic Stance Card */}
                  <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded px-2 py-0.5 font-bold text-[11px] ${
                            aiResearchData.suggested_stance === "BACK"
                              ? "bg-sky-500/20 text-sky-400"
                              : aiResearchData.suggested_stance === "OPPOSE"
                              ? "bg-rose-500/20 text-rose-400"
                              : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          Suggested: {aiResearchData.suggested_stance}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          {Math.round(aiResearchData.confidence_score * 100)}% Confidence
                        </span>
                      </div>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          aiResearchData.risk_level === "LOW"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : aiResearchData.risk_level === "MODERATE"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-rose-500/20 text-rose-400"
                        }`}
                      >
                        {aiResearchData.risk_level} RISK
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-200">
                      {aiResearchData.summary}
                    </p>
                  </div>

                  {/* Market Sentiment Meter */}
                  <div className="rounded-xl border border-[#233044] bg-[#0B1222] p-3 space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-sky-400">
                        Back ({aiResearchData.market_sentiment.back_percentage}%)
                      </span>
                      <span className="text-rose-400">
                        Oppose ({aiResearchData.market_sentiment.oppose_percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-rose-500/40">
                      <div
                        className="h-full bg-sky-400 transition-all"
                        style={{
                          width: `${aiResearchData.market_sentiment.back_percentage}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Key Factors */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-slate-200">
                      Key Statistical Drivers
                    </h4>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {aiResearchData.key_factors?.map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-sky-400 font-bold">•</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Sources */}
                  {aiResearchData.sources && aiResearchData.sources.length > 0 && (
                    <div className="space-y-1">
                      <h4 className="text-[11px] font-semibold text-slate-400">
                        Authoritative Sources
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {aiResearchData.sources.map((src, i) => (
                          <span
                            key={i}
                            className="rounded border border-[#233044] bg-[#0B1222] px-2 py-0.5 text-[10px] text-slate-400"
                          >
                            {src}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Conversational Q&A History */}
                  {aiChatHistory.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-[#233044]">
                      <h4 className="text-xs font-bold text-slate-200">
                        Conversational Intelligence
                      </h4>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {aiChatHistory.map((msg, i) => (
                          <div
                            key={i}
                            className={`rounded-lg p-2.5 text-xs ${
                              msg.role === "user"
                                ? "bg-sky-500/10 border border-sky-500/20 text-sky-100 ml-4"
                                : "bg-[#0B1222] border border-[#233044] text-slate-200 mr-4"
                            }`}
                          >
                            <span className="block text-[10px] font-bold text-slate-400 mb-0.5">
                              {msg.role === "user" ? "You" : "BetSocial AI"}
                            </span>
                            {msg.content}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-xs text-slate-400 space-y-2">
                  <p>Click below to generate contextual AI analysis.</p>
                  <Button
                    size="sm"
                    className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs"
                    onClick={() => handleRunAiResearch()}
                  >
                    Generate AI Intelligence
                  </Button>
                </div>
              )}
            </div>

            {/* Interactive Chat Query Row */}
            <form onSubmit={handleSendAiChat} className="pt-3 border-t border-[#233044] flex items-center gap-2 shrink-0">
              <input
                type="text"
                placeholder="Ask AI anything about this bet..."
                value={aiChatQuery}
                onChange={(e) => setAiChatQuery(e.target.value)}
                className="flex-1 rounded-lg border border-[#233044] bg-[#0B1222] px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
              />
              <Button
                type="submit"
                disabled={isAiChatLoading || !aiChatQuery.trim()}
                className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white px-3 py-2 h-auto text-xs"
              >
                {isAiChatLoading ? (
                  <RefreshCw className="size-3.5 animate-spin" />
                ) : (
                  <Send className="size-3.5" />
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Admin Control Panel Dialog */}
      {isAdminModalOpen && (
        <Dialog open={isAdminModalOpen} onOpenChange={setIsAdminModalOpen}>
          <DialogContent className="border border-[#233044] bg-[#162032] text-slate-100 sm:max-w-2xl max-h-[85vh] flex flex-col p-6">
            <DialogHeader className="shrink-0">
              <div className="flex items-center justify-between pb-2 border-b border-[#233044]">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-indigo-500/10 p-2 border border-indigo-500/20 text-indigo-400">
                    <ShieldAlert className="size-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-base font-bold text-white">
                      Administrative Control Panel
                    </DialogTitle>
                    <p className="text-xs text-slate-400">
                      Platform governance, user moderation, and financial settlement queue
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    refetchAdminOverview();
                    refetchAdminUsers();
                    refetchAdminWithdrawals();
                  }}
                  className="border-[#233044] bg-[#0B1222] text-slate-300 hover:text-white text-xs h-8 px-2.5"
                >
                  <RefreshCw className={`size-3.5 mr-1.5 ${isAdminOverviewLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </DialogHeader>

            {/* Navigation Tabs */}
            <div className="flex border-b border-[#233044] gap-2 pt-3 shrink-0">
              <button
                type="button"
                onClick={() => setAdminTab("overview")}
                className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
                  adminTab === "overview"
                    ? "border-indigo-400 text-indigo-300"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Macro Overview
              </button>
              <button
                type="button"
                onClick={() => setAdminTab("users")}
                className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
                  adminTab === "users"
                    ? "border-indigo-400 text-indigo-300"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                User Directory ({adminUsers.length})
              </button>
              <button
                type="button"
                onClick={() => setAdminTab("withdrawals")}
                className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
                  adminTab === "withdrawals"
                    ? "border-indigo-400 text-indigo-300"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Withdrawal Queue ({adminWithdrawals.length})
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {adminTab === "overview" && (
                <div className="space-y-4">
                  {/* Primary Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl border border-[#233044] bg-[#0B1222] p-3 text-center">
                      <span className="text-[11px] font-medium text-slate-400">Total Users</span>
                      <p className="mt-1 text-lg font-bold text-white">
                        {adminOverview?.total_users ?? 0}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#233044] bg-[#0B1222] p-3 text-center">
                      <span className="text-[11px] font-medium text-slate-400">Active Bets</span>
                      <p className="mt-1 text-lg font-bold text-sky-400">
                        {adminOverview?.active_bets ?? 0}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#233044] bg-[#0B1222] p-3 text-center">
                      <span className="text-[11px] font-medium text-slate-400">Locked Escrow</span>
                      <p className="mt-1 text-lg font-bold text-emerald-400">
                        ${Number(adminOverview?.total_escrow_locked ?? 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#233044] bg-[#0B1222] p-3 text-center">
                      <span className="text-[11px] font-medium text-slate-400">Volume Traded</span>
                      <p className="mt-1 text-lg font-bold text-purple-400">
                        ${Number(adminOverview?.total_volume_traded ?? 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Secondary Monitoring Cards */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl border border-[#233044] bg-[#0B1222] p-3 text-center">
                      <span className="text-[11px] font-medium text-slate-400">Commissions</span>
                      <p className="mt-1 text-base font-bold text-emerald-400">
                        ${Number(adminOverview?.total_commissions_earned ?? 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#233044] bg-[#0B1222] p-3 text-center">
                      <span className="text-[11px] font-medium text-slate-400">Pending Payouts</span>
                      <p className="mt-1 text-base font-bold text-amber-400">
                        {adminOverview?.pending_withdrawals_count ?? 0}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#233044] bg-[#0B1222] p-3 text-center">
                      <span className="text-[11px] font-medium text-slate-400">Open Disputes</span>
                      <p className="mt-1 text-base font-bold text-rose-400">
                        {adminOverview?.open_disputes_count ?? 0}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#233044] bg-[#0B1222] p-3 text-center">
                      <span className="text-[11px] font-medium text-slate-400">Unverified KYC</span>
                      <p className="mt-1 text-base font-bold text-slate-300">
                        {adminOverview?.unverified_kyc_count ?? 0}
                      </p>
                    </div>
                  </div>

                  {/* Featured Markets Management */}
                  <div className="rounded-xl border border-[#233044] bg-[#0B1222] p-4">
                    <h4 className="text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-amber-400" />
                      Featured Bet Promotion Control
                    </h4>
                    <p className="text-[11px] text-slate-400 mb-3">
                      Promote active betting markets to the top of the discovery feed with verified promotional banners.
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {bets.slice(0, 8).map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center justify-between rounded-lg border border-[#233044] bg-[#162032] p-2.5 text-xs"
                        >
                          <div className="truncate max-w-[340px]">
                            <p className="font-semibold text-slate-200 truncate">{b.title}</p>
                            <span className="text-[10px] text-slate-400">
                              Pool: ${b.total_pool} • Category: {b.category}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleBetFeature(b.id, Boolean(b.is_featured))}
                            className={`h-7 px-2.5 text-[11px] ${
                              b.is_featured
                                ? "border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                                : "border-[#233044] text-slate-400 hover:text-white"
                            }`}
                          >
                            <Sparkles className="size-3 mr-1" />
                            {b.is_featured ? "Featured" : "Feature"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {adminTab === "users" && (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 size-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search users by name, email, or username..."
                      value={adminUserSearch}
                      onChange={(e) => setAdminUserSearch(e.target.value)}
                      className="w-full rounded-lg border border-[#233044] bg-[#0B1222] pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                    />
                  </div>

                  {isAdminUsersLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="size-5 animate-spin text-slate-400" />
                    </div>
                  ) : adminUsers.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">
                      No users match your filter criteria.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                      {adminUsers.map((u) => (
                        <div
                          key={u.id}
                          className="flex items-center justify-between rounded-xl border border-[#233044] bg-[#0B1222] p-3 text-xs"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{u.name}</span>
                              <span
                                className={`rounded px-1.5 py-0.2 text-[10px] font-semibold ${
                                  u.status === "ACTIVE"
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                }`}
                              >
                                {u.status}
                              </span>
                              <span
                                className={`rounded px-1.5 py-0.2 text-[10px] font-semibold ${
                                  u.kyc_status === "VERIFIED"
                                    ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                                    : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                                }`}
                              >
                                KYC: {u.kyc_status}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              {u.email} {u.username ? `(@${u.username})` : ""}
                            </p>
                            <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-0.5">
                              <span>Wallet: ${Number(u.wallet_balance).toFixed(2)}</span>
                              <span>Escrow: ${Number(u.escrow_locked).toFixed(2)}</span>
                              <span>Role: {u.role}</span>
                            </div>
                          </div>

                          <Button
                            size="sm"
                            disabled={isAdminActionLoading}
                            onClick={() => handleToggleUserStatus(u.id, u.status)}
                            className={`h-7 px-3 text-[11px] font-semibold ${
                              u.status === "ACTIVE"
                                ? "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30"
                                : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30"
                            }`}
                          >
                            {u.status === "ACTIVE" ? "Suspend Account" : "Reactivate"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {adminTab === "withdrawals" && (
                <div className="space-y-3">
                  {isAdminWithdrawalsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="size-5 animate-spin text-slate-400" />
                    </div>
                  ) : adminWithdrawals.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">
                      No withdrawal requests currently pending review.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                      {adminWithdrawals.map((w) => (
                        <div
                          key={w.id}
                          className="rounded-xl border border-[#233044] bg-[#0B1222] p-3 text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold text-white">{w.user_name}</span>
                              <span className="ml-2 text-[10px] text-slate-400">
                                {new Date(w.created_at).toLocaleString()}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-amber-400">
                              ${Number(w.amount).toFixed(2)} {w.currency}
                            </span>
                          </div>

                          <div className="rounded-lg bg-[#162032] p-2 text-[11px] text-slate-300 space-y-0.5">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Payment Channel:</span>
                              <span className="font-semibold">{w.payment_method}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Destination:</span>
                              <span className="font-mono text-slate-200 truncate max-w-[280px]">
                                {w.destination}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-1">
                            <Button
                              size="sm"
                              disabled={isAdminActionLoading}
                              onClick={() => handleReviewWithdrawalAction(w.id, "REJECTED")}
                              className="h-7 px-3 text-[11px] bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30"
                            >
                              <X className="size-3 mr-1" />
                              Reject &amp; Refund
                            </Button>
                            <Button
                              size="sm"
                              disabled={isAdminActionLoading}
                              onClick={() => handleReviewWithdrawalAction(w.id, "APPROVED")}
                              className="h-7 px-3 text-[11px] bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30"
                            >
                              <Check className="size-3 mr-1" />
                              Approve Payout
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
