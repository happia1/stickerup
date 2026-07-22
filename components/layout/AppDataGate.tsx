"use client";
import { useAppLoading } from "@/lib/store/provider";
import { PageSkeleton } from "@/components/ui/PageSkeleton";

export function AppDataGate({ children }: { children: React.ReactNode }) {
  const loading = useAppLoading();
  return loading ? <PageSkeleton /> : children;
}
