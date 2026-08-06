import { AdminCardGridSkeleton } from "@/components/general/AdminCardGridSkeleton";

export default function AdminTeamLoading() {
  return (
    <AdminCardGridSkeleton
      title="Team Members"
      description="Administrators who manage courses and platform operations."
      showSummary
    />
  );
}
