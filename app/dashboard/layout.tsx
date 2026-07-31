import { DashboardAppSidebar } from "@/app/dashboard/_components/DashboardAppSidebar";
import { requireUser } from "@/app/data/user/require-user";
import { SiteHeader } from "@/components/sidebar/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireUser();

  return (
    <SidebarProvider
      className="course-player-shell"
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 88)",
          "--header-height": "calc(var(--spacing) * 16)",
        } as React.CSSProperties
      }
    >
      <DashboardAppSidebar variant="inset" />
      <SidebarInset className="min-w-0 md:peer-data-[variant=inset]:rounded-md">
        <SiteHeader />
        <div className="flex flex-1 flex-col overflow-x-hidden">
          <div className="@container/main flex flex-1 flex-col">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
