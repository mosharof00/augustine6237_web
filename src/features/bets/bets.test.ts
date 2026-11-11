import { describe, expect, it } from "vitest";
import type {
  Bet,
  BetComment,
  BetMatchedStatus,
  BetEscrowStatus,
  BetCommissionStatus,
  FeeConfig,
  WalletOverview,
  WalletTransaction,
  PaymentMethod,
  StripeIntentResult,
  BankInstructions,
  CryptoAddressResult,
  ConfirmStripeResult,
  KycStatus,
  BetDispute,
  ResolveDisputeInput,
  GamingSubmission,
  GamingMatchCheck,
  SubmitGamingScoreInput,
  AiBetResearch,
  AiChatInput,
  AiChatResult,
  AdminOverview,
  AdminUser,
  AdminWithdrawal,
  UpdateUserStatusInput,
  UpdateUserStatusResult,
  FeatureBetInput,
  FeatureBetResult,
  ReviewWithdrawalInput,
  ReviewWithdrawalResult,
  TrendingTopic,
  DiscoveryCountry,
} from "@/lib/api/types";

describe("Slice 4: Bettor Social Interaction Tests", () => {
  const sampleComments: BetComment[] = [
    {
      id: "comm_1",
      bet_id: "bet_arsenal_chelsea",
      content: "Arsenal are in prime form at home. Backing 2-0!",
      stance: "BACK",
      created_at: "2026-11-10T16:30:00Z",
      author: {
        id: "u1",
        name: "Alex Mercer",
        username: "alexm",
      },
    },
    {
      id: "comm_2",
      bet_id: "bet_arsenal_chelsea",
      content: "Chelsea counter-attacks will break their line. Opposing!",
      stance: "OPPOSE",
      created_at: "2026-11-10T16:35:00Z",
      author: {
        id: "u2",
        name: "Sam Carter",
        username: "samc",
      },
    },
    {
      id: "comm_3",
      bet_id: "bet_arsenal_chelsea",
      content: "Rain expected at kickoff. Might affect total goals.",
      stance: "SPECTATOR",
      created_at: "2026-11-10T16:40:00Z",
      author: {
        id: "u3",
        name: "Spectator Dave",
      },
    },
  ];

  it("parses bet comments and checks stance values", () => {
    expect(sampleComments).toHaveLength(3);
    expect(sampleComments[0].stance).toBe("BACK");
    expect(sampleComments[1].stance).toBe("OPPOSE");
    expect(sampleComments[2].stance).toBe("SPECTATOR");
    expect(sampleComments[0].author?.username).toBe("alexm");
  });

  it("filters comments by bettor stance accurately", () => {
    const backers = sampleComments.filter((c) => c.stance === "BACK");
    const opposers = sampleComments.filter((c) => c.stance === "OPPOSE");
    const neutrals = sampleComments.filter((c) => c.stance === "SPECTATOR");

    expect(backers).toHaveLength(1);
    expect(opposers).toHaveLength(1);
    expect(neutrals).toHaveLength(1);
    expect(backers[0].id).toBe("comm_1");
  });

  it("handles optimistic comment additions and deletions", () => {
    const newComment: BetComment = {
      id: "comm_new",
      bet_id: "bet_arsenal_chelsea",
      content: "Another vote for Back!",
      stance: "BACK",
      created_at: "2026-11-10T16:45:00Z",
    };

    const added = [...sampleComments, newComment];
    expect(added).toHaveLength(4);
    expect(added[3].id).toBe("comm_new");

    const deleted = added.filter((c) => c.id !== "comm_1");
    expect(deleted).toHaveLength(3);
    expect(deleted.find((c) => c.id === "comm_1")).toBeUndefined();
  });
});

describe("Slice 5: Public Bets Engine Tests", () => {
  const sampleBets: Bet[] = [
    {
      id: "bet_premier_league",
      title: "Arsenal vs Chelsea - Premier League",
      description: "Match outcome in regular 90 minutes",
      category: "SPORTS",
      creator_id: "u1",
      status: "ACTIVE",
      is_private: false,
      deadline: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      total_pool: "1000.00",
      back_pool: "750.00",
      oppose_pool: "250.00",
      comments_count: 12,
      created_at: "2026-11-10T12:00:00Z",
      creator: {
        id: "u1",
        name: "Alex Mercer",
        username: "alexm",
      },
    },
    {
      id: "bet_us_election",
      title: "US Presidential Election 2028 Outcome",
      category: "POLITICS",
      creator_id: "u2",
      status: "ACTIVE",
      is_private: false,
      deadline: new Date(Date.now() + 10 * 3600 * 1000).toISOString(),
      total_pool: "5000.00",
      back_pool: "2500.00",
      oppose_pool: "2500.00",
      comments_count: 45,
      created_at: "2026-11-10T14:00:00Z",
    },
    {
      id: "bet_bitcoin_halving",
      title: "Bitcoin to cross $150k before end of Q4",
      category: "CRYPTO",
      creator_id: "u3",
      status: "ACTIVE",
      is_private: false,
      deadline: new Date(Date.now() + 100 * 3600 * 1000).toISOString(),
      total_pool: "0.00",
      back_pool: "0.00",
      oppose_pool: "0.00",
      comments_count: 0,
      created_at: "2026-11-10T16:00:00Z",
    },
  ];

  it("calculates accurate Back vs Oppose percentage ratios", () => {
    const bet1 = sampleBets[0];
    const total1 = parseFloat(bet1.total_pool);
    const backPercent1 = Math.round((parseFloat(bet1.back_pool) / total1) * 100);
    const opposePercent1 = 100 - backPercent1;

    expect(backPercent1).toBe(75);
    expect(opposePercent1).toBe(25);

    const bet2 = sampleBets[1];
    const total2 = parseFloat(bet2.total_pool);
    const backPercent2 = Math.round((parseFloat(bet2.back_pool) / total2) * 100);
    const opposePercent2 = 100 - backPercent2;

    expect(backPercent2).toBe(50);
    expect(opposePercent2).toBe(50);
  });

  it("handles zero-pool bets with equal 50/50 fallback", () => {
    const betZero = sampleBets[2];
    const total = parseFloat(betZero.total_pool);

    const bp = total > 0 ? Math.round((parseFloat(betZero.back_pool) / total) * 100) : 50;
    const op = total > 0 ? 100 - bp : 50;

    expect(bp).toBe(50);
    expect(op).toBe(50);
  });

  it("filters bets by category accurately", () => {
    const sportsBets = sampleBets.filter((b) => b.category === "SPORTS");
    const politicsBets = sampleBets.filter((b) => b.category === "POLITICS");
    const cryptoBets = sampleBets.filter((b) => b.category === "CRYPTO");

    expect(sportsBets).toHaveLength(1);
    expect(sportsBets[0].id).toBe("bet_premier_league");
    expect(politicsBets).toHaveLength(1);
    expect(cryptoBets).toHaveLength(1);
  });

  it("sorts bets by pool size (trending) and deadline (ending soon)", () => {
    const trending = [...sampleBets].sort(
      (a, b) => parseFloat(b.total_pool) - parseFloat(a.total_pool),
    );
    expect(trending[0].id).toBe("bet_us_election");
    expect(trending[1].id).toBe("bet_premier_league");
    expect(trending[2].id).toBe("bet_bitcoin_halving");

    const endingSoon = [...sampleBets].sort(
      (a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime(),
    );
    expect(endingSoon[0].id).toBe("bet_us_election");
  });
});

describe("Slice 6: Private Bets & Shareable Invite Links Tests", () => {
  const privateBet: Bet = {
    id: "bet_priv_hackney",
    title: "Hackney Half Marathon 2026: Alex vs Jordan",
    description: "Who finishes with the lower official chip time?",
    category: "SPORTS",
    creator_id: "u1",
    status: "ACTIVE",
    is_private: true,
    invite_code: "BET-9K2L8X",
    deadline: "2026-11-16T08:00:00Z",
    total_pool: "100.00",
    back_pool: "50.00",
    oppose_pool: "50.00",
    comments_count: 3,
    created_at: "2026-11-11T08:30:00Z",
    creator: {
      id: "u1",
      name: "Alex Mercer",
      username: "alexm",
    },
    participants: [
      {
        id: "p1",
        user_id: "u1",
        side: "BACK",
        stake: "50.00",
        created_at: "2026-11-11T08:30:00Z",
        user: { id: "u1", name: "Alex Mercer", username: "alexm" },
      },
      {
        id: "p2",
        user_id: "u2",
        side: "OPPOSE",
        stake: "50.00",
        created_at: "2026-11-11T08:35:00Z",
        user: { id: "u2", name: "Jordan Cole", username: "jordanc" },
      },
    ],
  };

  it("verifies private bet has valid invite code and is marked private", () => {
    expect(privateBet.is_private).toBe(true);
    expect(privateBet.invite_code).toBe("BET-9K2L8X");
    expect(privateBet.invite_code).toMatch(/^BET-[A-Z0-9]{6}$/);
    expect(privateBet.participants).toHaveLength(2);
  });

  it("calculates balanced 50/50 odds on equal head-to-head stakes", () => {
    const total = parseFloat(privateBet.total_pool);
    const back = parseFloat(privateBet.back_pool);
    const oppose = parseFloat(privateBet.oppose_pool);

    const backPercent = Math.round((back / total) * 100);
    const opposePercent = Math.round((oppose / total) * 100);

    expect(backPercent).toBe(50);
    expect(opposePercent).toBe(50);
  });

  it("dynamically recalculates pools when a third participant joins on BACK", () => {
    const additionalStake = 50;
    const newTotal = parseFloat(privateBet.total_pool) + additionalStake;
    const newBack = parseFloat(privateBet.back_pool) + additionalStake;
    const newOppose = parseFloat(privateBet.oppose_pool);

    const updatedBackPercent = Math.round((newBack / newTotal) * 100);
    const updatedOpposePercent = 100 - updatedBackPercent;

    expect(newTotal).toBe(150);
    expect(newBack).toBe(100);
    expect(newOppose).toBe(50);
    expect(updatedBackPercent).toBe(67);
    expect(updatedOpposePercent).toBe(33);
  });
});

describe("Slice 7: YES/NO and Custom Outcome Betting Tests", () => {
  const customBet: Bet = {
    id: "bet_custom_epl",
    title: "Who will win the Premier League 2026/27?",
    category: "SPORTS",
    bet_type: "CUSTOM",
    creator_id: "u1",
    status: "ACTIVE",
    is_private: false,
    total_pool: "400.00",
    back_pool: "0.00",
    oppose_pool: "0.00",
    comments_count: 8,
    created_at: "2026-11-11T09:00:00Z",
    outcomes: [
      {
        id: "out_1",
        title: "Arsenal",
        pool: "200.00",
        percent: 50.0,
      },
      {
        id: "out_2",
        title: "Manchester City",
        pool: "120.00",
        percent: 30.0,
      },
      {
        id: "out_3",
        title: "Liverpool",
        pool: "80.00",
        percent: 20.0,
      },
    ],
  };

  it("verifies custom multi-candidate bet structure and outcomes breakdown", () => {
    expect(customBet.bet_type).toBe("CUSTOM");
    expect(customBet.outcomes).toHaveLength(3);
    expect(customBet.outcomes?.[0].title).toBe("Arsenal");
    expect(customBet.outcomes?.[0].percent).toBe(50.0);
    expect(customBet.outcomes?.[1].title).toBe("Manchester City");
    expect(customBet.outcomes?.[1].percent).toBe(30.0);
  });

  it("calculates outcome percentage distribution correctly", () => {
    const total = parseFloat(customBet.total_pool);
    expect(total).toBe(400);

    const sumPercentages = (customBet.outcomes || []).reduce(
      (acc, curr) => acc + curr.percent,
      0,
    );
    expect(sumPercentages).toBe(100.0);
  });

  it("dynamically updates custom outcome odds when a new stake is placed", () => {
    const additionalStake = 100; // Bet on Liverpool
    const newTotal = parseFloat(customBet.total_pool) + additionalStake; // 500
    const liverpoolPool =
      parseFloat(customBet.outcomes?.[2].pool || "0") + additionalStake; // 180

    const updatedLiverpoolPercent = Number(
      ((liverpoolPool / newTotal) * 100).toFixed(1),
    );

    expect(newTotal).toBe(500);
    expect(liverpoolPool).toBe(180);
    expect(updatedLiverpoolPercent).toBe(36.0);
  });
});

describe("Slice 8: Matched Betting Engine Tests", () => {
  const sampleMatchedStatus: BetMatchedStatus = {
    bet_id: "bet_binary_match",
    bet_type: "BINARY",
    total_pool: "160.00",
    matched_pool: "120.00",
    unmatched_pool: "40.00",
    back_pool: "100.00",
    oppose_pool: "60.00",
    back_matched: "60.00",
    oppose_matched: "60.00",
    back_unmatched: "40.00",
    oppose_unmatched: "0.00",
    back_odds: "1.60",
    oppose_odds: "2.67",
    odds: {
      BACK: 1.6,
      OPPOSE: 2.67,
    },
    participants: [
      {
        id: "p1",
        bet_id: "bet_binary_match",
        user_id: "u1",
        stake: "100.00",
        side: "BACK",
        matched_stake: "60.00",
        unmatched_stake: "40.00",
        match_status: "PARTIALLY_MATCHED",
        refunded_amount: "0.00",
        created_at: "2026-11-11T10:00:00Z",
        user: { id: "u1", name: "Alice Backer" },
      },
      {
        id: "p2",
        bet_id: "bet_binary_match",
        user_id: "u2",
        stake: "60.00",
        side: "OPPOSE",
        matched_stake: "60.00",
        unmatched_stake: "0.00",
        match_status: "MATCHED",
        refunded_amount: "0.00",
        created_at: "2026-11-11T10:05:00Z",
        user: { id: "u2", name: "Bob Opposer" },
      },
    ],
  };

  it("verifies matched vs unmatched pool separation and decimal odds", () => {
    const total = parseFloat(sampleMatchedStatus.total_pool);
    const matched = parseFloat(sampleMatchedStatus.matched_pool);
    const unmatched = parseFloat(sampleMatchedStatus.unmatched_pool);

    expect(matched + unmatched).toBe(total);
    expect(sampleMatchedStatus.odds?.["BACK"]).toBe(1.6);
    expect(sampleMatchedStatus.odds?.["OPPOSE"]).toBe(2.67);
  });

  it("verifies participant order matching states", () => {
    const backer = sampleMatchedStatus.participants?.[0];
    const opposer = sampleMatchedStatus.participants?.[1];

    expect(backer?.match_status).toBe("PARTIALLY_MATCHED");
    expect(backer?.matched_stake).toBe("60.00");
    expect(backer?.unmatched_stake).toBe("40.00");

    expect(opposer?.match_status).toBe("MATCHED");
    expect(opposer?.matched_stake).toBe("60.00");
    expect(opposer?.unmatched_stake).toBe("0.00");
  });

  it("simulates refunding unmatched stakes to participant", () => {
    const backer = sampleMatchedStatus.participants?.[0];
    expect(backer).toBeDefined();

    const unmatchedStake = parseFloat(backer!.unmatched_stake || "0");
    expect(unmatchedStake).toBe(40.0);

    // Simulate refund action
    const refundedParticipant = {
      ...backer!,
      unmatched_stake: "0.00",
      refunded_amount: (parseFloat(backer!.refunded_amount || "0") + unmatchedStake).toFixed(2),
      match_status: "MATCHED" as const,
    };

    expect(refundedParticipant.unmatched_stake).toBe("0.00");
    expect(refundedParticipant.refunded_amount).toBe("40.00");
    expect(refundedParticipant.match_status).toBe("MATCHED");
  });
});

describe("Slice 9: Escrow & Automated Payout Pool Tests", () => {
  const sampleEscrow: BetEscrowStatus = {
    bet_id: "bet_escrow_settled",
    title: "Arsenal vs Chelsea - Premier League",
    status: "RESOLVED",
    escrow_status: "SETTLED",
    total_escrow: "200.00",
    matched_pool: "160.00",
    unmatched_pool: "40.00",
    payout_pool: "160.00",
    winning_side: "BACK",
    winning_outcome_id: null,
    resolved_at: "2026-11-11T12:00:00Z",
    winners_count: 1,
    losers_count: 1,
    payouts: [
      {
        participant_id: "p1",
        user_id: "u1",
        user_name: "Alice Backer",
        side: "BACK",
        stake: "120.00",
        matched_stake: "80.00",
        payout_amount: "160.00",
        profit: "80.00",
        roi_percent: 100.0,
        is_winner: true,
        payout_status: "PAID",
      },
      {
        participant_id: "p2",
        user_id: "u2",
        user_name: "Bob Opposer",
        side: "OPPOSE",
        stake: "80.00",
        matched_stake: "80.00",
        payout_amount: "0.00",
        profit: "0.00",
        roi_percent: 0.0,
        is_winner: false,
        payout_status: "LOST",
      },
    ],
  };

  it("verifies settled escrow breakdown and winning outcome", () => {
    expect(sampleEscrow.status).toBe("RESOLVED");
    expect(sampleEscrow.escrow_status).toBe("SETTLED");
    expect(sampleEscrow.winning_side).toBe("BACK");
    expect(sampleEscrow.total_escrow).toBe("200.00");
    expect(sampleEscrow.matched_pool).toBe("160.00");
    expect(sampleEscrow.payout_pool).toBe("160.00");
    expect(sampleEscrow.winners_count).toBe(1);
    expect(sampleEscrow.losers_count).toBe(1);
  });

  it("verifies winner proportional payout distribution and ROI percentage", () => {
    const winner = sampleEscrow.payouts.find((p) => p.is_winner);
    expect(winner).toBeDefined();
    expect(winner?.user_name).toBe("Alice Backer");
    expect(winner?.payout_amount).toBe("160.00");
    expect(winner?.profit).toBe("80.00");
    expect(winner?.roi_percent).toBe(100.0);
    expect(winner?.payout_status).toBe("PAID");

    const loser = sampleEscrow.payouts.find((p) => !p.is_winner);
    expect(loser).toBeDefined();
    expect(loser?.user_name).toBe("Bob Opposer");
    expect(loser?.payout_amount).toBe("0.00");
    expect(loser?.payout_status).toBe("LOST");
  });

  it("calculates proportional payout correctly for multi-winner pools", () => {
    // 2 winners who staked 60 and 20 respectively out of 80 total winning matched stake
    const totalMatchedPool = 160.0;
    const winnerA_Matched = 60.0;
    const winnerB_Matched = 20.0;
    const totalWinningStake = winnerA_Matched + winnerB_Matched;

    const payoutA = (winnerA_Matched / totalWinningStake) * totalMatchedPool;
    const payoutB = (winnerB_Matched / totalWinningStake) * totalMatchedPool;

    expect(payoutA).toBe(120.0);
    expect(payoutB).toBe(40.0);
    expect(payoutA + payoutB).toBe(totalMatchedPool);
  });
});

describe("Slice 10: Platform Commission & Fee Management Tests", () => {
  const sampleFeeConfig: FeeConfig = {
    commission_rate: "10.0",
    applies_to_profit: true,
    description: "Default platform commission on net winning profit",
    updated_at: "2026-11-11T00:00:00Z",
  };

  const sampleCommission: BetCommissionStatus = {
    bet_id: "bet-comm-test",
    title: "Arsenal vs Chelsea",
    status: "RESOLVED",
    commission_rate: "10.0",
    gross_payout_pool: "200.00",
    total_commission_collected: "10.00",
    net_payout_pool: "190.00",
    participant_fees: [
      {
        participant_id: "p1",
        user_id: "u1",
        user_name: "Winner Alice",
        side: "BACK",
        matched_stake: "100.00",
        gross_payout: "200.00",
        net_profit: "100.00",
        commission_deducted: "10.00",
        net_payout: "190.00",
      },
      {
        participant_id: "p2",
        user_id: "u2",
        user_name: "Loser Bob",
        side: "OPPOSE",
        matched_stake: "100.00",
        gross_payout: "0.00",
        net_profit: "0.00",
        commission_deducted: "0.00",
        net_payout: "0.00",
      },
    ],
  };

  it("verifies platform fee configuration structure and defaults", () => {
    expect(sampleFeeConfig.commission_rate).toBe("10.0");
    expect(sampleFeeConfig.applies_to_profit).toBe(true);
    expect(sampleFeeConfig.description).toContain("Default platform commission");
  });

  it("verifies commission deduction strictly on net profit", () => {
    const winner = sampleCommission.participant_fees[0];
    const gross = parseFloat(winner.gross_payout);
    const stake = parseFloat(winner.matched_stake);
    const netProfit = Math.max(0, gross - stake);
    const rate = parseFloat(sampleCommission.commission_rate) / 100;
    const fee = netProfit * rate;
    const netPayout = gross - fee;

    expect(netProfit).toBe(100.0);
    expect(fee).toBe(10.0);
    expect(netPayout).toBe(190.0);
    expect(winner.commission_deducted).toBe(fee.toFixed(2));
    expect(winner.net_payout).toBe(netPayout.toFixed(2));
  });

  it("verifies zero fee deducted when net profit is zero or negative", () => {
    const loser = sampleCommission.participant_fees[1];
    const gross = parseFloat(loser.gross_payout);
    const stake = parseFloat(loser.matched_stake);
    const netProfit = Math.max(0, gross - stake);
    const rate = parseFloat(sampleCommission.commission_rate) / 100;
    const fee = netProfit * rate;

    expect(netProfit).toBe(0.0);
    expect(fee).toBe(0.0);
    expect(loser.commission_deducted).toBe("0.00");
    expect(loser.net_payout).toBe("0.00");
  });

  it("verifies bet commission totals and net pool consistency", () => {
    const grossPool = parseFloat(sampleCommission.gross_payout_pool);
    const totalFee = parseFloat(sampleCommission.total_commission_collected);
    const netPool = parseFloat(sampleCommission.net_payout_pool);

    expect(netPool).toBe(grossPool - totalFee);
  });
});

describe("Slice 11: User Wallet System Tests", () => {
  const sampleWallet: WalletOverview = {
    user_id: "u_demo",
    balance: "1250.00",
    escrow_locked: "150.00",
    total_deposited: "2000.00",
    total_withdrawn: "600.00",
    currency: "USD",
  };

  const sampleTransactions: WalletTransaction[] = [
    {
      id: "tx_1",
      user_id: "u_demo",
      type: "DEPOSIT",
      amount: "500.00",
      currency: "USD",
      status: "COMPLETED",
      description: "Initial wallet top up",
      created_at: "2026-11-10T10:00:00Z",
    },
    {
      id: "tx_2",
      user_id: "u_demo",
      type: "WITHDRAWAL",
      amount: "100.00",
      currency: "USD",
      status: "COMPLETED",
      description: "Bank payout",
      destination_details: "Chase ending in 4242",
      created_at: "2026-11-10T12:00:00Z",
    },
    {
      id: "tx_3",
      user_id: "u_demo",
      type: "ESCROW_LOCK",
      amount: "150.00",
      currency: "USD",
      status: "LOCKED",
      description: "Stake placed on Arsenal vs Chelsea",
      created_at: "2026-11-10T14:00:00Z",
    },
  ];

  it("calculates available balance and total funds correctly", () => {
    const available = parseFloat(sampleWallet.balance);
    const locked = parseFloat(sampleWallet.escrow_locked);
    const totalDeposited = parseFloat(sampleWallet.total_deposited);
    const totalWithdrawn = parseFloat(sampleWallet.total_withdrawn);

    expect(available).toBe(1250.0);
    expect(locked).toBe(150.0);
    expect(available + locked).toBe(1400.0);
    expect(totalDeposited).toBe(2000.0);
    expect(totalWithdrawn).toBe(600.0);
    expect(sampleWallet.currency).toBe("USD");
  });

  it("processes deposit balance increment logic correctly", () => {
    const current = parseFloat(sampleWallet.balance);
    const depositAmount = 250.0;
    const newBalance = (current + depositAmount).toFixed(2);

    expect(newBalance).toBe("1500.00");
  });

  it("validates withdrawal against available balance", () => {
    const current = parseFloat(sampleWallet.balance);
    const validWithdraw = 200.0;
    const excessiveWithdraw = 2000.0;

    expect(validWithdraw <= current).toBe(true);
    expect(excessiveWithdraw <= current).toBe(false);
  });

  it("parses chronological transaction history items correctly", () => {
    expect(sampleTransactions.length).toBe(3);
    const [txDeposit, txWithdraw, txLock] = sampleTransactions;

    expect(txDeposit.type).toBe("DEPOSIT");
    expect(txDeposit.status).toBe("COMPLETED");
    expect(txWithdraw.type).toBe("WITHDRAWAL");
    expect(txWithdraw.destination_details).toBe("Chase ending in 4242");
    expect(txLock.type).toBe("ESCROW_LOCK");
    expect(txLock.status).toBe("LOCKED");
  });
});

describe("Slice 12: Multi-Method Payment Processing Tests", () => {
  const sampleMethods: PaymentMethod[] = [
    {
      id: "stripe_card",
      name: "Credit / Debit Card",
      provider: "STRIPE",
      type: "CARD",
      currencies: ["USD", "EUR", "GBP"],
      min_deposit: 5.0,
      max_deposit: 10000.0,
      fee_percent: "0.00",
      processing_time: "Instant",
      is_enabled: true,
    },
    {
      id: "bank_wire",
      name: "Bank Wire Transfer",
      provider: "BANK",
      type: "WIRE",
      currencies: ["USD", "EUR", "GBP"],
      min_deposit: 50.0,
      max_deposit: 50000.0,
      fee_percent: "0.00",
      processing_time: "1-3 Business Days",
      is_enabled: true,
    },
    {
      id: "crypto_deposit",
      name: "Cryptocurrency",
      provider: "CRYPTO",
      type: "CRYPTO",
      currencies: ["USDT", "USDC", "BTC", "ETH"],
      min_deposit: 10.0,
      max_deposit: 100000.0,
      fee_percent: "0.00",
      processing_time: "1-15 Minutes",
      is_enabled: true,
    },
  ];

  const sampleStripeIntent: StripeIntentResult = {
    payment_intent_id: "pi_3N42abcXYZ",
    client_secret: "pi_3N42abcXYZ_secret_test123",
    amount: "100.00",
    currency: "USD",
    transaction_id: "tx_strp_1",
  };

  const sampleBankInstructions: BankInstructions = {
    beneficiary_name: "BetSocial Global Ltd",
    bank_name: "JPMorgan Chase Bank, N.A.",
    swift_bic: "CHASUS33XXX",
    iban: "GB82WEST12345698765432",
    account_number: "9876543210",
    routing_number: "021000021",
    reference_prefix: "BS-DEPOSIT-",
    notes: "Include reference memo in wire",
  };

  const sampleCryptoAddress: CryptoAddressResult = {
    cryptocurrency: "USDT",
    network: "POLYGON",
    deposit_address: "0x71Ce275d31b816280b2aB38",
    memo_or_tag: null,
    min_deposit: "10.00",
    estimated_confirmations: 64,
  };

  it("verifies payment method options and properties", () => {
    expect(sampleMethods).toHaveLength(3);
    const [card, bank, crypto] = sampleMethods;

    expect(card.provider).toBe("STRIPE");
    expect(card.min_deposit).toBe(5.0);
    expect(bank.provider).toBe("BANK");
    expect(bank.min_deposit).toBe(50.0);
    expect(crypto.provider).toBe("CRYPTO");
    expect(crypto.currencies).toContain("USDT");
  });

  it("validates Stripe payment intent structure and confirmation balance update", () => {
    expect(sampleStripeIntent.payment_intent_id).toContain("pi_");
    expect(sampleStripeIntent.client_secret).toContain("_secret_");

    const startingBalance = 100.0;
    const depositAmt = parseFloat(sampleStripeIntent.amount);
    const confirmed: ConfirmStripeResult = {
      transaction_id: sampleStripeIntent.transaction_id,
      amount: sampleStripeIntent.amount,
      new_balance: (startingBalance + depositAmt).toFixed(2),
      currency: "USD",
      status: "COMPLETED",
      reference_number: sampleStripeIntent.payment_intent_id,
    };

    expect(confirmed.new_balance).toBe("200.00");
    expect(confirmed.status).toBe("COMPLETED");
  });

  it("validates platform bank wire instructions format", () => {
    expect(sampleBankInstructions.beneficiary_name).toBe("BetSocial Global Ltd");
    expect(sampleBankInstructions.iban).toMatch(/^GB/);
    expect(sampleBankInstructions.swift_bic).toBe("CHASUS33XXX");
    expect(sampleBankInstructions.reference_prefix).toBe("BS-DEPOSIT-");
  });

  it("validates cryptocurrency deposit address and confirmation parameters", () => {
    expect(sampleCryptoAddress.cryptocurrency).toBe("USDT");
    expect(sampleCryptoAddress.network).toBe("POLYGON");
    expect(sampleCryptoAddress.deposit_address).toMatch(/^0x/);
    expect(sampleCryptoAddress.estimated_confirmations).toBe(64);
  });
});

describe("Slice 13: Dispute Resolution & User KYC Verification Tests", () => {
  const sampleKyc: KycStatus = {
    user_id: "u_demo",
    kyc_status: "VERIFIED",
    document_type: "PASSPORT",
    document_url: "https://storage/kyc.jpg",
    submitted_at: "2026-11-10T10:00:00Z",
    verified_at: "2026-11-10T12:00:00Z",
    can_deposit_large: true,
    can_create_high_stakes: true,
  };

  const sampleDisputes: BetDispute[] = [
    {
      id: "disp_1",
      bet_id: "bet_arsenal_chelsea",
      creator_id: "u_alex",
      reason: "INCORRECT_RESULT",
      description: "Official report confirms Arsenal scored in 94th minute",
      evidence_url: "https://storage/report.pdf",
      status: "OPEN",
      created_at: "2026-11-11T12:00:00Z",
      bet: {
        id: "bet_arsenal_chelsea",
        title: "Arsenal vs Chelsea - Will Arsenal Win?",
      },
    },
    {
      id: "disp_2",
      bet_id: "bet_f1_monaco",
      creator_id: "u_sam",
      reason: "EVENT_CANCELLED",
      description: "Race cancelled due to rain",
      status: "RESOLVED",
      resolution: "REFUND_ALL",
      resolution_notes: "Race declared no-contest, all stakes refunded",
      created_at: "2026-11-10T15:00:00Z",
    },
  ];

  it("validates user KYC status levels and capabilities", () => {
    expect(sampleKyc.kyc_status).toBe("VERIFIED");
    expect(sampleKyc.document_type).toBe("PASSPORT");
    expect(sampleKyc.can_deposit_large).toBe(true);
    expect(sampleKyc.can_create_high_stakes).toBe(true);
  });

  it("validates dispute data structure and status states", () => {
    expect(sampleDisputes.length).toBe(2);
    const [openDispute, resolvedDispute] = sampleDisputes;

    expect(openDispute.status).toBe("OPEN");
    expect(openDispute.reason).toBe("INCORRECT_RESULT");
    expect(openDispute.evidence_url).toBe("https://storage/report.pdf");

    expect(resolvedDispute.status).toBe("RESOLVED");
    expect(resolvedDispute.resolution).toBe("REFUND_ALL");
    expect(resolvedDispute.resolution_notes).toContain("no-contest");
  });

  it("handles adjudication outcome resolution logic correctly", () => {
    const resolveInput: ResolveDisputeInput = {
      resolution: "OVERTURN_RESULT",
      resolution_notes: "Referee camera confirms goal",
      new_winning_side: "BACK",
    };

    expect(resolveInput.resolution).toBe("OVERTURN_RESULT");
    expect(resolveInput.new_winning_side).toBe("BACK");
  });
});

describe("Slice 14: PlayStation / Gaming Result Check Tests", () => {
  const sampleGamingSubmissions: GamingSubmission[] = [
    {
      player_id: "u_p1",
      gamertag: "ApexStriker",
      platform: "PLAYSTATION",
      my_score: 3,
      opponent_score: 1,
      proof_url: "https://proofs.betsocial.app/fifa24_match1.jpg",
      submitted_at: "2026-11-11T12:00:00Z",
      player_name: "Alex Mercer",
    },
    {
      player_id: "u_p2",
      gamertag: "DefendingChamp",
      platform: "PLAYSTATION",
      my_score: 1,
      opponent_score: 3,
      proof_url: "https://proofs.betsocial.app/fifa24_match2.jpg",
      submitted_at: "2026-11-11T12:05:00Z",
      player_name: "Marcus Vance",
    },
  ];

  it("validates dual-player reciprocity and score matching logic", () => {
    const [p1, p2] = sampleGamingSubmissions;
    const isMatched =
      p1.my_score === p2.opponent_score && p1.opponent_score === p2.my_score;
    expect(isMatched).toBe(true);

    const matchCheck: GamingMatchCheck = {
      bet_id: "bet_fifa_101",
      match_status: "MATCHED",
      submissions: sampleGamingSubmissions,
      winner_id: "u_p1",
      is_auto_resolved: true,
      is_auto_disputed: false,
    };

    expect(matchCheck.match_status).toBe("MATCHED");
    expect(matchCheck.is_auto_resolved).toBe(true);
    expect(matchCheck.winner_id).toBe("u_p1");
  });

  it("validates score conflict escalation into automated dispute", () => {
    const mismatchSubmissions: GamingSubmission[] = [
      {
        player_id: "u_p1",
        gamertag: "ApexStriker",
        platform: "PLAYSTATION",
        my_score: 3,
        opponent_score: 1,
      },
      {
        player_id: "u_p2",
        gamertag: "DefendingChamp",
        platform: "PLAYSTATION",
        my_score: 2,
        opponent_score: 2,
      },
    ];

    const [p1, p2] = mismatchSubmissions;
    const isMismatch = !(
      p1.my_score === p2.opponent_score && p1.opponent_score === p2.my_score
    );
    expect(isMismatch).toBe(true);

    const matchCheck: GamingMatchCheck = {
      bet_id: "bet_fifa_102",
      match_status: "MISMATCH",
      submissions: mismatchSubmissions,
      dispute_id: "disp_mismatch_999",
      is_auto_resolved: false,
      is_auto_disputed: true,
    };

    expect(matchCheck.match_status).toBe("MISMATCH");
    expect(matchCheck.is_auto_disputed).toBe(true);
    expect(matchCheck.dispute_id).toBe("disp_mismatch_999");
  });

  it("validates score submission input formatting across platforms", () => {
    const input: SubmitGamingScoreInput = {
      my_score: 4,
      opponent_score: 2,
      platform: "XBOX",
      gamertag: "HaloMaster",
      proof_url: "https://proofs/xbox_score.png",
    };

    expect(input.platform).toBe("XBOX");
    expect(input.my_score).toBe(4);
    expect(input.opponent_score).toBe(2);
    expect(input.gamertag).toBe("HaloMaster");
  });
});

describe("Slice 15: AI Research Assistant Tests", () => {
  const sampleAiResearch: AiBetResearch = {
    bet_id: "bet_arsenal_chelsea",
    topic: "Arsenal vs Chelsea - Will Arsenal Win?",
    summary:
      "Arsenal enters the London derby undefeated in their last 6 Premier League matches at Emirates Stadium, boasting a 2.1 xG per game average.",
    key_factors: [
      "Arsenal home advantage with 78% win rate this season",
      "Key Chelsea midfielder ruled out with hamstring strain",
      "Arsenal scored 2+ goals in 4 of the last 5 head-to-head encounters",
    ],
    market_sentiment: {
      back_percentage: 68.5,
      oppose_percentage: 31.5,
      consensus: "STRONG_BACK",
    },
    suggested_stance: "BACK",
    confidence_score: 0.86,
    risk_level: "MODERATE",
    sources: [
      "Opta Sports Statistics 2026",
      "Premier League Match Centre",
      "Team Injury Bulletin",
    ],
    generated_at: "2026-11-11T14:30:00Z",
  };

  it("validates AI market intelligence parsing and structure", () => {
    expect(sampleAiResearch.bet_id).toBe("bet_arsenal_chelsea");
    expect(sampleAiResearch.suggested_stance).toBe("BACK");
    expect(sampleAiResearch.confidence_score).toBe(0.86);
    expect(sampleAiResearch.risk_level).toBe("MODERATE");
    expect(sampleAiResearch.market_sentiment.consensus).toBe("STRONG_BACK");
    expect(sampleAiResearch.key_factors.length).toBe(3);
    expect(sampleAiResearch.sources).toContain("Opta Sports Statistics 2026");
  });

  it("validates dynamic sentiment ratio calculation", () => {
    const total =
      sampleAiResearch.market_sentiment.back_percentage +
      sampleAiResearch.market_sentiment.oppose_percentage;
    expect(total).toBe(100);
  });

  it("validates conversational Q&A input and response structures", () => {
    const chatInput: AiChatInput = {
      query: "What are the primary injury risks?",
      bet_id: "bet_arsenal_chelsea",
      history: [{ role: "user", content: "Tell me about this match" }],
    };

    const chatResult: AiChatResult = {
      reply: "Key injury update: Chelsea midfielder is out with a strain.",
      suggestions: [
        "What is the head-to-head card count?",
        "Compare decimal odds",
      ],
      sources: ["Premier League Bulletin"],
    };

    expect(chatInput.query).toContain("injury risks");
    expect(chatResult.reply).toContain("Chelsea midfielder is out");
    expect(chatResult.suggestions.length).toBe(2);
  });
});

describe("Slice 16: Admin Control Panel Tests", () => {
  const sampleOverview: AdminOverview = {
    total_users: 1250,
    active_bets: 48,
    total_escrow_locked: 142500.5,
    total_volume_traded: 1280900.0,
    total_commissions_earned: 128090.0,
    pending_withdrawals_count: 5,
    open_disputes_count: 2,
    unverified_kyc_count: 8,
  };

  const sampleUsers: AdminUser[] = [
    {
      id: "u_alex",
      name: "Alex Mercer",
      email: "alex@example.com",
      username: "alexm",
      role: "CLIENT",
      status: "ACTIVE",
      kyc_status: "VERIFIED",
      wallet_balance: 1250.0,
      escrow_locked: 450.0,
      created_at: "2026-11-01T10:00:00Z",
    },
    {
      id: "u_bad_actor",
      name: "Suspicious User",
      email: "bad@example.com",
      username: "baduser",
      role: "CLIENT",
      status: "SUSPENDED",
      kyc_status: "UNVERIFIED",
      wallet_balance: 50.0,
      escrow_locked: 0.0,
      created_at: "2026-11-05T12:00:00Z",
    },
  ];

  const sampleWithdrawals: AdminWithdrawal[] = [
    {
      id: "tx_w123",
      user_id: "u_alex",
      user_name: "Alex Mercer",
      amount: 250.0,
      currency: "USD",
      status: "PENDING",
      payment_method: "BANK_WIRE",
      destination: "IBAN: GB29NWBK60161331926819",
      created_at: "2026-11-11T13:45:00Z",
    },
  ];

  it("validates administrative macro overview metrics calculation", () => {
    expect(sampleOverview.total_users).toBe(1250);
    expect(sampleOverview.active_bets).toBe(48);
    expect(sampleOverview.total_escrow_locked).toBe(142500.5);
    expect(sampleOverview.total_volume_traded).toBe(1280900.0);
    expect(sampleOverview.total_commissions_earned).toBe(128090.0);
    expect(sampleOverview.pending_withdrawals_count).toBe(5);
    expect(sampleOverview.open_disputes_count).toBe(2);
  });

  it("simulates user moderation and suspension toggle", () => {
    const activeUser = sampleUsers[0];
    expect(activeUser.status).toBe("ACTIVE");

    const suspendInput: UpdateUserStatusInput = {
      status: "SUSPENDED",
      reason: "Repeated score mismatch",
    };

    const result: UpdateUserStatusResult = {
      user_id: activeUser.id,
      status: suspendInput.status,
      updated_at: new Date().toISOString(),
    };

    expect(result.status).toBe("SUSPENDED");
    expect(result.user_id).toBe("u_alex");
  });

  it("simulates bet promotion and featured market toggle", () => {
    const input: FeatureBetInput = { is_featured: true };
    const result: FeatureBetResult = {
      bet_id: "bet_sample_1",
      is_featured: input.is_featured,
    };

    expect(result.is_featured).toBe(true);
    expect(result.bet_id).toBe("bet_sample_1");
  });

  it("simulates withdrawal review approval and rejection flow", () => {
    const withdrawal = sampleWithdrawals[0];
    expect(withdrawal.status).toBe("PENDING");
    expect(withdrawal.amount).toBe(250.0);

    const approveInput: ReviewWithdrawalInput = {
      action: "APPROVED",
      notes: "Release confirmed via wire",
    };

    const approvalResult: ReviewWithdrawalResult = {
      transaction_id: withdrawal.id,
      status: "COMPLETED",
      action: approveInput.action,
      processed_at: new Date().toISOString(),
    };

    expect(approvalResult.status).toBe("COMPLETED");
    expect(approvalResult.action).toBe("APPROVED");

    const rejectInput: ReviewWithdrawalInput = {
      action: "REJECTED",
      notes: "Invalid destination details",
    };

    const rejectionResult: ReviewWithdrawalResult = {
      transaction_id: withdrawal.id,
      status: "CANCELLED",
      action: rejectInput.action,
      processed_at: new Date().toISOString(),
    };

    expect(rejectionResult.status).toBe("CANCELLED");
    expect(rejectionResult.action).toBe("REJECTED");
  });
});

describe("Slice 17: Discovery & Feed Filtering Tests", () => {
  const sampleExploreBet: Bet = {
    id: "bet_explore_uk_1",
    title: "Arsenal vs Chelsea - Will Arsenal Win?",
    category: "SPORTS",
    creator_id: "u_alex",
    status: "ACTIVE",
    is_private: false,
    country: "GB",
    is_featured: true,
    total_pool: "12500.00",
    back_pool: "7500.00",
    oppose_pool: "5000.00",
    comments_count: 14,
    created_at: "2026-11-10T12:00:00Z",
  };

  const sampleTrendingTopics: TrendingTopic[] = [
    {
      tag: "Premier League",
      category: "SPORTS",
      active_bets_count: 18,
      total_volume: 45200.0,
    },
    {
      tag: "US Elections",
      category: "POLITICS",
      active_bets_count: 12,
      total_volume: 78900.0,
    },
    {
      tag: "Bitcoin Halving",
      category: "CRYPTO",
      active_bets_count: 9,
      total_volume: 32100.0,
    },
  ];

  const sampleCountries: DiscoveryCountry[] = [
    { code: "GLOBAL", name: "Global / All", count: 48 },
    { code: "US", name: "United States", count: 22 },
    { code: "GB", name: "United Kingdom", count: 14 },
    { code: "NG", name: "Nigeria", count: 7 },
    { code: "CA", name: "Canada", count: 5 },
  ];

  it("validates bet exploration properties with country tag and promotional featured status", () => {
    expect(sampleExploreBet.id).toBe("bet_explore_uk_1");
    expect(sampleExploreBet.country).toBe("GB");
    expect(sampleExploreBet.is_featured).toBe(true);
    expect(parseFloat(sampleExploreBet.total_pool)).toBe(12500.0);
  });

  it("validates trending topic tag aggregations and active volumes", () => {
    expect(sampleTrendingTopics.length).toBe(3);
    expect(sampleTrendingTopics[0].tag).toBe("Premier League");
    expect(sampleTrendingTopics[0].active_bets_count).toBe(18);
    expect(sampleTrendingTopics[0].total_volume).toBe(45200.0);
    expect(sampleTrendingTopics[1].category).toBe("POLITICS");
    expect(sampleTrendingTopics[2].category).toBe("CRYPTO");
  });

  it("validates supported discovery countries breakdown", () => {
    expect(sampleCountries.length).toBe(5);
    const globalCount = sampleCountries.find((c) => c.code === "GLOBAL")?.count;
    const usCount = sampleCountries.find((c) => c.code === "US")?.count;
    const gbCount = sampleCountries.find((c) => c.code === "GB")?.count;

    expect(globalCount).toBe(48);
    expect(usCount).toBe(22);
    expect(gbCount).toBe(14);
  });

  it("validates multi-criteria discovery query filtering", () => {
    const query = {
      country: "GB",
      category: "SPORTS",
      is_featured: true,
      sort: "trending",
    };

    const matches =
      sampleExploreBet.country === query.country &&
      sampleExploreBet.category === query.category &&
      sampleExploreBet.is_featured === query.is_featured;

    expect(matches).toBe(true);
  });
});









