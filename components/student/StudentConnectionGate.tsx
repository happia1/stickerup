"use client";

import { useEffect, useState } from "react";
import { StudentTopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { TeacherConnectionCard } from "./TeacherConnectionCard";

type ConnectionState = "checking" | "connected" | "unconnected";

export function StudentConnectionGate({ children }: { children: React.ReactNode }) {
  const [connectionState, setConnectionState] = useState<ConnectionState>("checking");

  useEffect(() => {
    let active = true;
    async function checkConnection() {
      const client = getSupabaseBrowserClient();
      const { data } = await client!.auth.getSession();
      if (!data.session) return;
      try {
        const response = await fetch("/api/auth/profile", {
          headers: { Authorization: `Bearer ${data.session.access_token}` },
          cache: "no-store",
        });
        const profile = await response.json() as { role?: string; teacherConnected?: boolean };
        if (active && response.ok && profile.role === "student") {
          setConnectionState(profile.teacherConnected ? "connected" : "unconnected");
        }
      } catch {
        if (active) setConnectionState("checking");
      }
    }
    void checkConnection();
    return () => {
      active = false;
    };
  }, []);

  if (connectionState === "checking") {
    return <div className="flex-1 p-4"><PageSkeleton /></div>;
  }

  if (connectionState === "unconnected") {
    return (
      <main className="flex flex-1 items-center justify-center p-5">
        <section className="w-full max-w-sm rounded-card bg-surface-card p-6 shadow-xl">
          <TeacherConnectionCard compact />
          <p className="mt-4 text-center text-micro text-text-muted">선생님 연결이 완료되면 스티커 앱을 이용할 수 있어요.</p>
        </section>
      </main>
    );
  }

  return (
    <>
      <StudentTopBar />
      <div className="flex-1 overflow-y-auto p-4">{children}</div>
      <BottomNav />
    </>
  );
}
