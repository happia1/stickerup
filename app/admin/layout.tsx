import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminTopBar } from "@/components/layout/TopBar";
import { AuthEntryNotice } from "@/components/supabase/AuthEntryNotice";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen min-w-0 flex-col md:flex-row">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopBar />
        <AuthEntryNotice />
        <main className="admin-content flex-1 min-w-0 overflow-x-auto p-4 sm:p-5 md:p-6 lg:p-7">{children}</main>
      </div>
    </div>
  );
}
