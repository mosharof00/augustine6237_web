import { Suspense } from "react";
import { StaffList } from "@/features/admin/staff/staff-list";

export default function StaffPage() {
  return (
    <Suspense>
      <StaffList />
    </Suspense>
  );
}
