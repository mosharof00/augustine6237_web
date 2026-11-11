"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { getStaff } from "@/features/admin/staff/api";
import { STAFF_PER_PAGE } from "@/features/admin/staff/model";
import { ClassTabs } from "./class-tabs";
import { CodeDialog } from "./code-dialog";
import { CreateClassDialog } from "./create-dialog";
import { CLASS_SUBTITLE, teacherChoices, type IssuedCode } from "./model";

export function ClassesChrome({
  current,
  classCount,
  requestCount,
  children,
}: {
  current: "classes" | "requests";
  classCount?: number;
  requestCount?: number;
  children: ReactNode;
}) {
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [issued, setIssued] = useState<IssuedCode | null>(null);
  const teachers = useQuery({
    queryKey: ["admin-staff", "teachers"],
    queryFn: () => getStaff({ page: 1, perPage: Math.max(STAFF_PER_PAGE, 100) }),
    enabled: creating,
    retry: false,
  });

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Classes</h2>
          <p className="text-sm text-muted-foreground">{CLASS_SUBTITLE}</p>
        </div>
        <Button type="button" onClick={() => setCreating(true)}>
          <Plus />
          Create Class
        </Button>
      </div>
      <ClassTabs current={current} classCount={classCount} requestCount={requestCount} />
      {children}
      <CreateClassDialog
        open={creating}
        teachers={teacherChoices(teachers.data?.items ?? [])}
        onOpenChange={setCreating}
        onCreated={(value) => {
          setIssued({ className: value.name, code: value.code });
          void queryClient.invalidateQueries({ queryKey: ["admin-classes"] });
        }}
      />
      <CodeDialog
        open={issued !== null}
        onOpenChange={(open) => {
          if (!open) setIssued(null);
        }}
        title="Class Created Successfully!"
        classLabel={issued?.className ?? ""}
        code={issued?.code ?? ""}
      />
    </div>
  );
}
