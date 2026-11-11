import { StaffProfile } from "@/features/admin/staff/staff-profile";

export default async function StaffProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StaffProfile id={id} />;
}
