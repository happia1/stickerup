import { AuthEntryNotice } from "@/components/supabase/AuthEntryNotice";
import { StudentConnectionGate } from "@/components/student/StudentConnectionGate";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-app mx-auto min-h-screen flex flex-col bg-surface-page shadow-sm">
      <AuthEntryNotice accountType="student" />
      <StudentConnectionGate>{children}</StudentConnectionGate>
    </div>
  );
}
