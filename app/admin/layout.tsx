import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminTopBar } from "@/components/layout/TopBar";
import { AuthEntryNotice } from "@/components/supabase/AuthEntryNotice";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminTopBar />
        <AuthEntryNotice />
        <div className="flex-1 p-7 overflow-x-auto">{children}</div>
      </div>
    </div>
  );
}
