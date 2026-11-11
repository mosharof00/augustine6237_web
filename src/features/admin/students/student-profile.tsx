"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "cn";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ErrorState, LoadingState } from "@/components/feedback/states";
import { StatusBadge } from "@/components/feedback/status-badge";
import { toastSuccess } from "@/components/feedback/toast";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/envelope";
import { approveStudent, getStudent, updateStudentStatus } from "./api";
import { MoveClassDialog } from "./move-dialog";
import {
  powerHeroesCount,
  statusPatch,
  studentStatusVariant,
  type StudentDetail,
} from "./model";
import { ProfilePanels, profileTabs, type ProfileTab } from "./profile-panels";

export function StudentProfile({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<ProfileTab>("details");
  const [moving, setMoving] = useState(false);
  const query = useQuery({
    queryKey: ["admin-students", id],
    queryFn: () => getStudent(id),
    retry: false,
  });

  if (query.isPending) return <LoadingState count={2} />;
  if (query.isError || !query.data) {
    return (
      <ErrorState
        message={
          query.error instanceof ApiError
            ? query.error.message
            : "Could not load this student."
        }
        onRetry={() => void query.refetch()}
      />
    );
  }

  const student = query.data;

  async function onReview(current: StudentDetail) {
    try {
      await approveStudent(current.id);
      toastSuccess({
        title: "Student approved",
        description: `${current.name} is active.`,
      });
      void queryClient.invalidateQueries({ queryKey: ["admin-students"] });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Could not approve this student.");
    }
  }

  async function onReactivate(current: StudentDetail) {
    try {
      await updateStudentStatus(current.id, statusPatch("ACTIVE").status);
      toastSuccess({
        title: "Account reactivated",
        description: `${current.name} is active.`,
      });
      void queryClient.invalidateQueries({ queryKey: ["admin-students"] });
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Could not reactivate this student.",
      );
    }
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">
        <Link href="/admin/users/students" className="hover:text-foreground">
          User Management
        </Link>
        {" / Students / "}
        <span className="text-foreground">{student.name}</span>
      </p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/15 font-medium text-primary">
            {student.name.slice(0, 1)}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">{student.name}</h2>
              <StatusBadge variant={studentStatusVariant(student.status)} />
            </div>
            <p className="text-sm text-muted-foreground">
              @{student.handle} · {student.className} · Power Heroes:{" "}
              {powerHeroesCount(student.powerHeroesUnlocked, student.powerHeroesTotal)}
            </p>
          </div>
        </div>
        {student.status === "PENDING" ? (
          <Button type="button" onClick={() => void onReview(student)}>
            Review
          </Button>
        ) : student.status === "INACTIVE" ? (
          <Button type="button" onClick={() => void onReactivate(student)}>
            Reactivate
          </Button>
        ) : (
          <Button type="button" onClick={() => setMoving(true)}>
            Move to Another Class
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-4 border-b">
        {profileTabs.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-current={tab === item.id ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-1 pb-2 text-sm",
              tab === item.id
                ? "border-primary font-medium text-primary"
                : "border-transparent text-muted-foreground",
            )}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <ProfilePanels student={student} tab={tab} />
      <MoveClassDialog
        studentId={student.id}
        studentName={student.name}
        options={student.classOptions}
        open={moving}
        onOpenChange={setMoving}
        onMoved={(className) => {
          toastSuccess({
            title: "Class updated",
            description: `${student.name} is now in ${className}.`,
          });
          void queryClient.invalidateQueries({ queryKey: ["admin-students"] });
        }}
      />
    </div>
  );
}
