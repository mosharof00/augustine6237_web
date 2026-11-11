import type { UserProfile } from "@/lib/api/types";
import { TrendingUp, Trophy, Activity, Percent, Star } from "lucide-react";

export function ProfileStatsCard({ profile }: { profile: UserProfile }) {
  const { stats, rating } = profile;

  return (
    <div className="rounded-xl border border-border/40 bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-border/30">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Activity className="w-5 h-5 text-sky-400" />
          Betting Performance & Record
        </h3>
        {rating.count > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{rating.average.toFixed(1)}</span>
            <span className="text-muted-foreground">({rating.count})</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
        {/* Win Rate */}
        <div className="p-3.5 rounded-lg bg-surface-subtle/50 border border-border/20">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Percent className="w-3.5 h-3.5 text-emerald-400" />
            <span>Win Rate</span>
          </div>
          <div className="text-xl font-bold text-emerald-400">
            {stats.win_rate.toFixed(1)}%
          </div>
        </div>

        {/* Record (W/L) */}
        <div className="p-3.5 rounded-lg bg-surface-subtle/50 border border-border/20">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Trophy className="w-3.5 h-3.5 text-sky-400" />
            <span>Record (W / L)</span>
          </div>
          <div className="text-xl font-bold text-foreground">
            <span className="text-emerald-400">{stats.wins}W</span>
            <span className="mx-1 text-muted-foreground">/</span>
            <span className="text-rose-400">{stats.losses}L</span>
          </div>
        </div>

        {/* Total Bets */}
        <div className="p-3.5 rounded-lg bg-surface-subtle/50 border border-border/20">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>Total Bets</span>
          </div>
          <div className="text-xl font-bold text-foreground">
            {stats.total_bets}
          </div>
        </div>

        {/* ROI */}
        <div className="p-3.5 rounded-lg bg-surface-subtle/50 border border-border/20">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
            <span>Est. ROI</span>
          </div>
          <div
            className={`text-xl font-bold ${
              stats.roi >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {stats.roi >= 0 ? `+${stats.roi}%` : `${stats.roi}%`}
          </div>
        </div>
      </div>
    </div>
  );
}
