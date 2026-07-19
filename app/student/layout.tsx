import { StudentTopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-app mx-auto min-h-screen flex flex-col bg-surface-page shadow-sm">
      <StudentTopBar />
      <div className="flex-1 overflow-y-auto p-4">{children}</div>
      <BottomNav />
    </div>
  );
}
