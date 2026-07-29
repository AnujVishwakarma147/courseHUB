import { requireAdmin } from "@/app/data/admin/require-admin";

export default async function CreateCourseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdmin();

  return children;
}
