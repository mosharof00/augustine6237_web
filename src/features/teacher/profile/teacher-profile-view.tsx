"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Award, BookOpen, Pencil, Users } from "lucide-react";
import { toast } from "sonner";
import { ErrorState, LoadingState } from "@/components/feedback/states";
import { toastSuccess } from "@/components/feedback/toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/envelope";
import { getTeacherProfile, updateTeacherProfile } from "./api";
import type { TeacherProfile, UpdateProfileInput } from "./model";
import { TeacherProfileEditDialog } from "./teacher-profile-edit-dialog";

export function TeacherProfileView() {
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<TeacherProfile>({
    queryKey: ["teacher", "profile"],
    queryFn: getTeacherProfile,
  });

  const updateMutation = useMutation({
    mutationFn: (values: UpdateProfileInput) => updateTeacherProfile(values),
    onSuccess: (updated) => {
      queryClient.setQueryData(["teacher", "profile"], updated);
      queryClient.invalidateQueries({ queryKey: ["teacher", "settings"] });
      toastSuccess({
        title: "Profile updated",
        description: "Your profile details have been successfully saved.",
      });
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Failed to update profile. Please try again.",
      );
    },
  });

  if (isLoading) {
    return <LoadingState count={3} />;
  }

  if (isError || !profile) {
    return (
      <ErrorState
        message={
          error instanceof ApiError
            ? error.message
            : "Could not load profile. Please try again."
        }
        onRetry={() => refetch()}
      />
    );
  }

  const initials = profile.realName
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "T";

  const displayId =
    profile.id && profile.id.startsWith("TCH-")
      ? profile.id
      : `TCH-${profile.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase() || "2048"}`;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Profile
        </h1>
        <p className="text-sm text-muted-foreground">
          Your account details and security.
        </p>
      </div>

      {/* Main Identity & Stats Card */}
      <div className="rounded-xl border bg-card p-6 shadow-xs">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <Avatar className="size-20 rounded-2xl ring-1 ring-border/50">
              {profile.avatarUrl ? (
                <AvatarImage
                  src={profile.avatarUrl}
                  alt={profile.realName}
                  className="rounded-2xl object-cover"
                />
              ) : null}
              <AvatarFallback className="rounded-2xl bg-primary/10 text-xl font-bold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">
                  {profile.realName}
                </h2>
                <Badge
                  variant="outline"
                  className="border-emerald-200 bg-emerald-50 text-emerald-700 font-medium"
                >
                  <span className="mr-1 size-1.5 rounded-full bg-emerald-500 inline-block" />
                  {profile.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{profile.title}</p>
              <p className="text-xs font-medium text-muted-foreground">
                ID: {displayId}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditDialogOpen(true)}
            className="self-start gap-1.5 sm:self-center"
          >
            <Pencil className="size-3.5" />
            Edit Profile
          </Button>
        </div>

        {/* Metric tiles row */}
        <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-6 sm:grid-cols-4">
          <div className="flex items-center gap-3.5 rounded-lg border bg-muted/20 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-primary">
              <BookOpen className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Classes</p>
              <p className="text-xl font-bold text-foreground">
                {String(profile.classCount).padStart(2, "0")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-lg border bg-muted/20 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-primary">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Students</p>
              <p className="text-xl font-bold text-foreground">
                {profile.studentCount}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-lg border bg-muted/20 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-primary">
              <BookOpen className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Assigned Classes</p>
              <p className="text-xl font-bold text-foreground">
                {String(Math.max(profile.classCount, 15)).padStart(2, "0")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-lg border bg-muted/20 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-primary">
              <Award className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Experience</p>
              <p className="text-xl font-bold text-foreground">
                {profile.experience}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About Me Card */}
      <div className="rounded-xl border bg-card p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3">
          <h3 className="font-semibold text-foreground">About Me</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditDialogOpen(true)}
            aria-label="Edit About Me"
            className="size-8 text-muted-foreground hover:text-foreground"
          >
            <Pencil className="size-4" />
          </Button>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {profile.bio}
        </p>
      </div>

      {/* 2-Column Grid: Personal & Professional Information */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <div className="rounded-xl border bg-card p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4">
            <h3 className="font-semibold text-foreground">
              Personal Information
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditDialogOpen(true)}
              aria-label="Edit Personal Information"
              className="size-8 text-muted-foreground hover:text-foreground"
            >
              <Pencil className="size-4" />
            </Button>
          </div>

          <dl className="space-y-3.5 text-sm">
            <div className="flex items-center justify-between border-b pb-2.5">
              <dt className="text-muted-foreground">Email Address</dt>
              <dd className="font-medium text-foreground">{profile.email}</dd>
            </div>
            <div className="flex items-center justify-between border-b pb-2.5">
              <dt className="text-muted-foreground">Phone Number</dt>
              <dd className="font-medium text-foreground">{profile.phone}</dd>
            </div>
            <div className="flex items-center justify-between border-b pb-2.5">
              <dt className="text-muted-foreground">Date of Birth</dt>
              <dd className="font-medium text-foreground">{profile.dob}</dd>
            </div>
            <div className="flex items-center justify-between border-b pb-2.5">
              <dt className="text-muted-foreground">Gender</dt>
              <dd className="font-medium text-foreground">{profile.gender}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Address</dt>
              <dd className="font-medium text-foreground">{profile.address}</dd>
            </div>
          </dl>
        </div>

        {/* Professional Information */}
        <div className="rounded-xl border bg-card p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4">
            <h3 className="font-semibold text-foreground">
              Professional Information
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditDialogOpen(true)}
              aria-label="Edit Professional Information"
              className="size-8 text-muted-foreground hover:text-foreground"
            >
              <Pencil className="size-4" />
            </Button>
          </div>

          <dl className="space-y-3.5 text-sm">
            <div className="flex items-center justify-between border-b pb-2.5">
              <dt className="text-muted-foreground">Department</dt>
              <dd className="font-medium text-foreground">
                {profile.department}
              </dd>
            </div>
            <div className="flex items-center justify-between border-b pb-2.5">
              <dt className="text-muted-foreground">Qualification</dt>
              <dd className="font-medium text-foreground">
                {profile.qualification}
              </dd>
            </div>
            <div className="flex items-center justify-between border-b pb-2.5">
              <dt className="text-muted-foreground">Experience</dt>
              <dd className="font-medium text-foreground">
                {profile.experience}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Joining Date</dt>
              <dd className="font-medium text-foreground">
                {profile.joiningDate}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <TeacherProfileEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        profile={profile}
        onSubmit={async (values) => {
          await updateMutation.mutateAsync(values);
        }}
      />
    </div>
  );
}
