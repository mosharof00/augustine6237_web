import { Suspense } from "react";
import { StudentList } from "@/features/admin/students/student-list";

export default function StudentsPage() {
  return (
    <Suspense>
      <StudentList />
    </Suspense>
  );
}
