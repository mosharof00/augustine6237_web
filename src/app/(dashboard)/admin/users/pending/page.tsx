import { Suspense } from "react";
import { StudentList } from "@/features/admin/students/student-list";

export default function PendingStudentsPage() {
  return (
    <Suspense>
      <StudentList pending />
    </Suspense>
  );
}
