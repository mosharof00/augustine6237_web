import { Suspense } from "react";
import { LoadingState } from "@/components/feedback/states";
import { TeacherSettingsView } from "@/features/teacher/settings/teacher-settings-view";

export default function TeacherSettingsPage() {
  return (
    <Suspense fallback={<LoadingState count={3} />}>
      <TeacherSettingsView />
    </Suspense>
  );
}
