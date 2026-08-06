import { AdminCardGridSkeleton } from "@/components/general/AdminCardGridSkeleton";

export default function AdminStudentsLoading() {
  return (
    <AdminCardGridSkeleton
      title="Students"
      description="View registered students and manage their access."
      showSummary
    />
  );
}
