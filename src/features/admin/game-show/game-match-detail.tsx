"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Shield,
  Trophy,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ErrorState } from "@/components/feedback/states";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import { getMatchDetail } from "./api";
import {
  formatMatchDate,
  formatMatchDuration,
  formatModeLabel,
  getMatchScoreDisplay,
  getWinnerTeam,
  type GameParticipant,
  type GameTeam,
} from "./model";

export function GameMatchDetailView({ id }: { id: string }) {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session.status !== "loading" && session.user?.role !== "ADMIN") {
      router.replace("/teacher");
    }
  }, [session, router]);

  const query = useQuery({
    queryKey: ["admin-game-match-detail", id],
    queryFn: () => getMatchDetail(id),
  });

  if (session.status === "loading" || session.user?.role !== "ADMIN") {
    return null;
  }

  if (query.isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6 md:p-8">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
          <div className="size-8 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="h-40 animate-pulse rounded-2xl bg-muted" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="h-64 animate-pulse rounded-2xl bg-muted" />
          <div className="h-64 animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="mx-auto max-w-5xl p-6 md:p-8">
        <ErrorState
          message="Could not load match details."
          onRetry={() => void query.refetch()}
        />
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            render={<Link href="/admin/game-show" />}
          >
            Back to Match History
          </Button>
        </div>
      </div>
    );
  }

  const match = query.data;
  const is1v1 = match.mode === "ONE_V_ONE" || match.mode === "SINGLE";
  const scores = getMatchScoreDisplay(match);
  const winnerTeam = getWinnerTeam(match);

  const teamA: GameTeam = match.teams?.[0] || {
    id: "team-a",
    label: is1v1 ? "Player 1" : "Team A",
    scoreXp: scores.teamA,
    scoreKindness: 0,
    scoreBaskets: 0,
  };

  const teamB: GameTeam = match.teams?.[1] || {
    id: "team-b",
    label: is1v1 ? "Player 2" : "Team B",
    scoreXp: scores.teamB,
    scoreKindness: 0,
    scoreBaskets: 0,
  };

  const isTeamAWinner = winnerTeam?.id === teamA.id || teamA.scoreXp > teamB.scoreXp;
  const isTeamBWinner = winnerTeam?.id === teamB.id || teamB.scoreXp > teamA.scoreXp;

  // Split participants by team
  const participantsTeamA = match.participants?.filter(
    (p) => p.teamId === teamA.id,
  ) || [];
  const participantsTeamB = match.participants?.filter(
    (p) => p.teamId === teamB.id,
  ) || [];

  // If participants don't have matching teamIds, split evenly
  const teamAPlayers =
    participantsTeamA.length > 0
      ? participantsTeamA
      : match.participants?.slice(0, Math.ceil(match.participants.length / 2)) || [];
  const teamBPlayers =
    participantsTeamB.length > 0
      ? participantsTeamB
      : match.participants?.slice(Math.ceil(match.participants.length / 2)) || [];

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 md:p-8">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Back to Game Show Activity"
            render={<Link href="/admin/game-show" />}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Match Details
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              ID: {match.id}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close"
          render={<Link href="/admin/game-show" />}
        >
          <X className="size-5" />
        </Button>
      </div>

      {/* Meta Information Bar */}
      <div className="grid grid-cols-2 gap-4 rounded-xl border bg-card p-4 sm:grid-cols-4">
        <div>
          <span className="text-xs text-muted-foreground">Class</span>
          <p className="text-sm font-semibold text-foreground">
            {match.className || "Grade 3 • Maple"}
          </p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Play Date</span>
          <p className="text-sm font-semibold text-foreground">
            {formatMatchDate(match.startedAt || match.createdAt)}
          </p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Play Mode</span>
          <p className="text-sm font-semibold text-foreground">
            {formatModeLabel(match.mode)}
          </p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Duration</span>
          <p className="text-sm font-semibold text-foreground">
            {formatMatchDuration(match.startedAt, match.finishedAt)}
          </p>
        </div>
      </div>

      {/* Final Match Score Hero Card */}
      <div className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm">
        <div className="text-center pb-4">
          <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
            Final Match Score
          </span>
        </div>

        <div className="flex items-center justify-around gap-4">
          {/* Left Side (Player 1 / Team A) */}
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-foreground">
                {teamA.label || (is1v1 ? "Player 1" : "Team A")}
              </span>
              {isTeamAWinner && (
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300"
                >
                  <Trophy className="mr-1 size-3" /> Winner
                </Badge>
              )}
            </div>
            <span
              className={cn(
                "text-5xl md:text-6xl font-black tracking-tight",
                isTeamAWinner ? "text-emerald-600 dark:text-emerald-400" : "text-foreground",
              )}
            >
              {teamA.scoreXp}
            </span>
            <span className="text-xs text-muted-foreground">
              {teamA.scoreBaskets} baskets • {teamA.scoreKindness} kindness pts
            </span>
          </div>

          {/* VS Center Badge */}
          <div className="flex flex-col items-center justify-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-muted text-sm font-extrabold text-muted-foreground shadow-inner">
              VS
            </span>
          </div>

          {/* Right Side (Player 2 / Team B) */}
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-foreground">
                {teamB.label || (is1v1 ? "Player 2" : "Team B")}
              </span>
              {isTeamBWinner && (
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300"
                >
                  <Trophy className="mr-1 size-3" /> Winner
                </Badge>
              )}
            </div>
            <span
              className={cn(
                "text-5xl md:text-6xl font-black tracking-tight",
                isTeamBWinner ? "text-emerald-600 dark:text-emerald-400" : "text-foreground",
              )}
            >
              {teamB.scoreXp}
            </span>
            <span className="text-xs text-muted-foreground">
              {teamB.scoreBaskets} baskets • {teamB.scoreKindness} kindness pts
            </span>
          </div>
        </div>
      </div>

      {/* Participants & Team Roster Breakdown */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Team A / Player 1 Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-foreground">
              {teamA.label || (is1v1 ? "Player 1" : "Team A")}
            </h3>
            <span className="text-xs font-medium text-muted-foreground">
              {teamAPlayers.length} {teamAPlayers.length === 1 ? "participant" : "participants"}
            </span>
          </div>

          <div className="space-y-3">
            {teamAPlayers.map((participant) => (
              <ParticipantCard
                key={participant.id}
                participant={participant}
                isWinner={isTeamAWinner}
              />
            ))}
          </div>
        </div>

        {/* Team B / Player 2 Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-foreground">
              {teamB.label || (is1v1 ? "Player 2" : "Team B")}
            </h3>
            <span className="text-xs font-medium text-muted-foreground">
              {teamBPlayers.length} {teamBPlayers.length === 1 ? "participant" : "participants"}
            </span>
          </div>

          <div className="space-y-3">
            {teamBPlayers.map((participant) => (
              <ParticipantCard
                key={participant.id}
                participant={participant}
                isWinner={isTeamBWinner}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Close Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          render={<Link href="/admin/game-show" />}
        >
          Close
        </Button>
      </div>
    </div>
  );
}

function ParticipantCard({
  participant,
  isWinner,
}: {
  participant: GameParticipant;
  isWinner?: boolean;
}) {
  const username =
    participant.user?.username ??
    (participant.nickname
      ? `@${participant.nickname.toLowerCase().replace(/\s+/g, "")}`
      : "@student");

  const heroName =
    participant.hero?.displayName ??
    participant.hero?.name ??
    "Power Hero";

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 shadow-xs space-y-3",
        isWinner && "border-emerald-200/60 dark:border-emerald-900/60",
      )}
    >
      {/* Header: Avatar, Nickname, Handle */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-11 border">
            <AvatarImage
              src={participant.avatarUrl ?? participant.user?.avatarUrl ?? undefined}
            />
            <AvatarFallback className="font-bold text-sm bg-primary/10 text-primary">
              {participant.nickname?.slice(0, 2).toUpperCase() || "ST"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-bold text-foreground text-sm leading-tight">
              {participant.nickname}
            </h4>
            <span className="text-xs text-muted-foreground">{username}</span>
          </div>
        </div>

        {participant.jerseyNumber && (
          <Badge variant="outline" className="text-xs font-mono">
            #{participant.jerseyNumber}
          </Badge>
        )}
      </div>

      {/* Hero Badge if available */}
      <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-2.5 py-1.5 text-xs">
        <Shield className="size-3.5 text-primary shrink-0" />
        <span className="font-medium text-foreground truncate">{heroName}</span>
        {participant.hero?.powerLabel && (
          <span className="text-muted-foreground truncate">
            • {participant.hero.powerLabel}
          </span>
        )}
      </div>

      {/* Stats Breakdown Grid */}
      <div className="grid grid-cols-3 gap-2 border-t pt-2 text-center text-xs">
        <div>
          <span className="text-muted-foreground">Score</span>
          <p className="font-bold text-foreground">
            {participant.scoreXp ?? 0} XP
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">Kindness</span>
          <p className="font-bold text-foreground">
            {participant.kindnessPoints ?? 0} pts
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">Shots</span>
          <p className="font-bold text-foreground">
            {participant.shotsMade ?? 0} /{" "}
            {(participant.shotsMade ?? 0) + (participant.shotsMissed ?? 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
