"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getTeacherClassesList } from "./api";
import { AwardTab } from "./award-tab";
import { BadgeMonitorTab } from "./badge-monitor-tab";
import { HistoryTab } from "./history-tab";

export type PointsTab = "award" | "monitor" | "history";

const TABS: { id: PointsTab; label: string }[] = [
  { id: "award", label: "Award points" },
  { id: "monitor", label: "Monitor badges" },
  { id: "history", label: "History" },
];

export function PointsBadgesView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get("tab")?.toLowerCase();
  const initialTab: PointsTab =
    tabParam === "monitor" || tabParam === "history" || tabParam === "award"
      ? tabParam
      : "award";

  const [activeTab, setActiveTab] = useState<PointsTab>(initialTab);
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(
    searchParams.get("classId") ?? undefined,
  );

  // Fetch teacher's classes for the switcher
  const classesQuery = useQuery({
    queryKey: ["teacher-points-classes"],
    queryFn: getTeacherClassesList,
  });

  const classes = classesQuery.data ?? [];

  const handleSelectTab = (tab: PointsTab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    if (selectedClassId) {
      params.set("classId", selectedClassId);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleSelectClass = (classId: string | undefined) => {
    setSelectedClassId(classId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", activeTab);
    if (classId) {
      params.set("classId", classId);
    } else {
      params.delete("classId");
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Points & badges
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Recognise positive behaviour and monitor achievements.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-6" aria-label="Points and Badges Tabs">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleSelectTab(tab.id)}
                className={cn(
                  "pb-3 text-xs font-medium transition-colors border-b-2",
                  isActive
                    ? "border-primary text-primary font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "award" && (
          <AwardTab
            classes={classes}
            selectedClassId={selectedClassId}
            onSelectClass={handleSelectClass}
          />
        )}
        {activeTab === "monitor" && (
          <BadgeMonitorTab
            classes={classes}
            selectedClassId={selectedClassId}
            onSelectClass={handleSelectClass}
          />
        )}
        {activeTab === "history" && (
          <HistoryTab
            classes={classes}
            selectedClassId={selectedClassId}
            onSelectClass={handleSelectClass}
          />
        )}
      </div>
    </div>
  );
}
