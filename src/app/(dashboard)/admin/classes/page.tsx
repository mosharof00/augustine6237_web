import { Suspense } from "react";
import { ClassList } from "@/features/admin/classes/class-list";

export default function ClassesPage() {
  return (
    <Suspense>
      <ClassList />
    </Suspense>
  );
}
