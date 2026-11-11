import { ClassDetail } from "@/features/admin/classes/class-detail";

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ClassDetail id={id} />;
}
